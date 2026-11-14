"""Membuat voice over (VO) yang waktunya sama dengan video Rangkul.

Waktu mulai tiap adegan dihitung dari src/durasi.json (sumber yang sama dengan video),
lalu tiap baris di vo/naskah.json diletakkan pada <mulai adegan> + <jeda>.

Hasil:
  public/vo/<id>.mp3        suara per baris (dibuat TTS, atau rekaman Anda sendiri)
  public/vo/vo-lengkap.mp3  satu trek VO sepanjang video
  vo/subtitle.srt           subtitle sesuai VO

Pemakaian (dari folder video/):
  pip install edge-tts
  python scripts/buat-vo.py               # buat suara dengan TTS (Microsoft Edge, suara id-ID)
  python scripts/buat-vo.py --ulang       # buat ulang semua suara TTS
  python scripts/buat-vo.py --tanpa-tts   # pakai rekaman sendiri di public/vo/<id>.mp3 / .wav
"""

import argparse
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
FOLDER_VO = AKAR / "public" / "vo"
TEMPO_MAKS = 1.2  # percepatan maksimal bila satu baris lebih panjang dari adegannya


def durasi_audio(berkas: Path) -> float:
    keluaran = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(berkas)],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(keluaran.stdout.strip())


def batas_suara(berkas: Path, panjang: float) -> tuple[float, float]:
    """Detik awal dan akhir suara, tanpa hening di depan dan belakang klip."""
    keluaran = subprocess.run(
        ["ffmpeg", "-i", str(berkas), "-af", "silencedetect=n=-45dB:d=0.1", "-f", "null", "-"],
        capture_output=True,
        text=True,
    ).stderr
    mulai = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", keluaran)]
    akhir = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", keluaran)]
    a, b = 0.0, panjang
    if mulai and mulai[0] < 0.01 and akhir:
        a = max(0.0, akhir[0] - 0.05)
    if mulai and mulai[-1] > a and (len(akhir) < len(mulai) or akhir[-1] >= panjang - 0.05):
        b = min(panjang, mulai[-1] + 0.1)
    return a, b


def waktu_srt(detik: float) -> str:
    ms = int(round(detik * 1000))
    j, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    d, ms = divmod(ms, 1000)
    return f"{j:02d}:{m:02d}:{d:02d},{ms:03d}"


async def tts(teks: str, suara: str, kecepatan: str, tujuan: Path) -> None:
    import edge_tts

    await edge_tts.Communicate(teks, suara, rate=kecepatan).save(str(tujuan))


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--tanpa-tts", action="store_true", help="jangan membuat suara, pakai berkas yang sudah ada")
    p.add_argument("--ulang", action="store_true", help="buat ulang semua suara TTS")
    a = p.parse_args()

    durasi = json.loads((AKAR / "src" / "durasi.json").read_text(encoding="utf-8"))
    naskah = json.loads((AKAR / "vo" / "naskah.json").read_text(encoding="utf-8"))
    fps = durasi["fps"]
    transisi = durasi["transisi"]
    adegan = list(durasi["adegan"].items())

    # Frame mulai tiap adegan di video utama (transisi membuat adegan saling tumpang).
    mulai: dict[str, int] = {}
    t = 0
    for i, (nama, d) in enumerate(adegan):
        mulai[nama] = t
        t += d - (transisi if i < len(adegan) - 1 else 0)
    total = t / fps
    urutan = [n for n, _ in adegan]

    FOLDER_VO.mkdir(parents=True, exist_ok=True)
    potongan = []
    for baris in naskah["baris"]:
        nama = baris["id"]
        if nama not in mulai:
            sys.exit(f"Adegan '{nama}' di naskah tidak ada di src/durasi.json")
        berkas = FOLDER_VO / f"{nama}.mp3"
        if not berkas.exists() and (FOLDER_VO / f"{nama}.wav").exists():
            berkas = FOLDER_VO / f"{nama}.wav"
        if not a.tanpa_tts and (a.ulang or not berkas.exists()):
            berkas = FOLDER_VO / f"{nama}.mp3"
            print(f"TTS  {nama}")
            asyncio.run(tts(baris["teks"], naskah["suara"], naskah["kecepatan"], berkas))
        if not berkas.exists():
            sys.exit(f"Tidak ada suara untuk {nama}: {berkas}")

        awal = mulai[nama] / fps + baris["jeda"]
        k = urutan.index(nama)
        # Boleh berbunyi sampai 2/3 transisi ke adegan berikutnya.
        akhir = (mulai[urutan[k + 1]] + transisi * 2 / 3) / fps if k + 1 < len(urutan) else total - 0.5
        potong = batas_suara(berkas, durasi_audio(berkas))
        panjang = potong[1] - potong[0]
        tersedia = akhir - awal
        tempo = 1.0
        if panjang > tersedia:
            tempo = panjang / tersedia
            if tempo > TEMPO_MAKS:
                print(f"PERINGATAN {nama}: suara {panjang:.1f}s, ruang {tersedia:.1f}s. Pendekkan teksnya.")
                tempo = TEMPO_MAKS
        potongan.append({"id": nama, "berkas": berkas, "awal": awal, "potong": potong, "panjang": panjang / tempo, "tempo": tempo, "teks": baris["teks"]})

    # Satu trek VO sepanjang video.
    masukan, filter_ = [], []
    for i, s in enumerate(potongan):
        masukan += ["-i", str(s["berkas"])]
        tempo = f",atempo={s['tempo']:.4f}" if s["tempo"] > 1.0 else ""
        ms = int(round(s["awal"] * 1000))
        a0, a1 = s["potong"]
        filter_.append(f"[{i}:a]atrim={a0:.3f}:{a1:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo{tempo},adelay={ms}|{ms}[v{i}]")
    gabung = "".join(f"[v{i}]" for i in range(len(potongan)))
    filter_.append(f"{gabung}amix=inputs={len(potongan)}:normalize=0:dropout_transition=0,apad,atrim=0:{total:.3f}[vo]")
    hasil = FOLDER_VO / "vo-lengkap.mp3"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", *masukan, "-filter_complex", ";".join(filter_), "-map", "[vo]", "-b:a", "192k", str(hasil)],
        check=True,
    )

    srt = []
    for i, s in enumerate(potongan, 1):
        srt.append(f"{i}\n{waktu_srt(s['awal'])} --> {waktu_srt(s['awal'] + s['panjang'])}\n{s['teks']}\n")
    (AKAR / "vo" / "subtitle.srt").write_text("\n".join(srt), encoding="utf-8")

    print(f"\n{'Adegan':<15}{'mulai':>8}{'durasi':>8}{'tempo':>7}")
    for s in potongan:
        print(f"{s['id']:<15}{s['awal']:>7.1f}s{s['panjang']:>7.1f}s{s['tempo']:>7.2f}")
    print(f"\nTrek VO {total:.1f}s -> {hasil}")
    print(f"Subtitle -> {AKAR / 'vo' / 'subtitle.srt'}")


if __name__ == "__main__":
    main()
