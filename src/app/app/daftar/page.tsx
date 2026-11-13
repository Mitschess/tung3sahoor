"use client";

import { Check, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KamusForm } from "@/components/kamus-form";
import { KepalaHalaman } from "@/components/kepala";
import { Kartu, Kosong, Masukan, Memuat, Tombol } from "@/components/ui";
import { bolehIsi } from "@/lib/akses";
import { kamus } from "@/lib/kamus";
import { PUSKESMAS, VERSI_PERSETUJUAN } from "@/lib/seed";
import { usePengguna, useStore } from "@/lib/store";
import { imt } from "@/lib/tahap";
import { iso, parse, tambahHari } from "@/lib/tanggal";
import type { Data } from "@/lib/types";
import { cn } from "@/lib/util";

const LANGKAH = ["Persetujuan", "Identitas ibu", "Suami / keluarga", "Kehamilan saat ini"] as const;

export default function DaftarkanIbu() {
  const u = usePengguna();
  const router = useRouter();
  const daftarIbu = useStore((s) => s.daftarIbu);
  const [langkah, setLangkah] = useState(0);
  const [setuju, setSetuju] = useState(false);
  const [nik, setNik] = useState("");
  const [profil, setProfil] = useState<Data>({});
  const [keluarga, setKeluarga] = useState<Data>({});
  const [memuat, setMemuat] = useState(false);

  if (!u) return <Memuat />;
  if (!bolehIsi(u, "ibu")) return <Kosong judul="Tidak diizinkan" teks="Pendaftaran ibu dilakukan oleh kader atau bidan." />;

  const hariIni = iso(new Date());
  const nikBersih = nik.replace(/\D/g, "");
  const nikSalah = nikBersih.length > 0 && nikBersih.length !== 16;

  const selesai = async (riwayat: Data) => {
    setMemuat(true);
    try {
      const rw = { ...riwayat };
      const hpht = parse(rw.hpht);
      if (hpht) rw.hpl_hpht = iso(tambahHari(hpht, 280));
      if (rw.bb_prahamil_kg && rw.tb_cm) rw.imt_prahamil = imt(Number(rw.bb_prahamil_kg), Number(rw.tb_cm));
      const ibu = await daftarIbu({ ...profil, persetujuan_tanggal: hariIni }, keluarga, nikBersih, rw);
      toast.success(`${String(ibu.profil.nama)} terdaftar. Jadwal & peringatan langsung dihitung.`);
      router.push(`/app/ibu/${ibu.id}`);
    } catch (e) {
      toast.error((e as Error).message);
      setMemuat(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <KepalaHalaman judul="Daftarkan ibu" sub="Salin dari halaman identitas Buku KIA" kembali="/app/ibu" />

      <ol className="mb-5 grid grid-cols-4 gap-2">
        {LANGKAH.map((l, i) => (
          <li key={l} className="flex flex-col gap-1.5">
            <span className={cn("h-1.5 rounded-full", i <= langkah ? "bg-brand" : "bg-line")} />
            <span className={cn("text-[11px] font-semibold sm:text-xs", i === langkah ? "text-ink" : "text-muted")}>
              {i + 1}. {l}
            </span>
          </li>
        ))}
      </ol>

      {langkah === 0 && (
        <Kartu className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-hijau-soft text-hijau">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h2 className="font-bold">Bacakan ini kepada ibu</h2>
              <p className="text-xs text-muted">Teks persetujuan {VERSI_PERSETUJUAN}</p>
            </div>
          </div>
          <div className="space-y-2 rounded-2xl bg-bg p-4 text-sm leading-relaxed">
            <p>
              Data dari Buku KIA Ibu akan dicatat di MOMCARE agar kader, bidan, dan dokter {PUSKESMAS} bisa mengingatkan jadwal periksa dan mengenali tanda bahaya lebih cepat.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Kader hanya melihat ibu di posyandunya sendiri.</li>
              <li>Hasil tes HIV/sifilis/hepatitis B dan skrining kesehatan jiwa hanya dilihat bidan/dokter, dan tidak pernah dikirim ke keluarga.</li>
              <li>NIK disimpan dalam bentuk tersandi (hash), tidak bisa dibaca ulang.</li>
              <li>Pesan pengingat WhatsApp ke Ibu dan suami/keluarga hanya berisi jadwal, bukan hasil pemeriksaan.</li>
              <li>Ibu boleh menolak atau berhenti kapan saja tanpa memengaruhi pelayanan.</li>
            </ul>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
            <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-0.5 size-5 accent-[var(--color-brand)]" />
            <span className="text-sm">
              Ibu sudah mendengar penjelasan di atas dan <b>setuju</b> datanya dicatat. Disaksikan oleh <b>{u.nama}</b> pada {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.
            </span>
          </label>
          <div className="flex justify-end">
            <Tombol type="button" disabled={!setuju} onClick={() => setLangkah(1)}>
              <Check className="size-4" /> Lanjut
            </Tombol>
          </div>
        </Kartu>
      )}

      {langkah === 1 && (
        <Kartu className="space-y-4">
          <label className="block text-sm font-semibold">
            NIK ibu
            <Masukan inputMode="numeric" maxLength={20} value={nik} onChange={(e) => setNik(e.target.value)} placeholder="16 digit" className={cn("mt-1.5", nikSalah && "border-merah")} />
            <span className={cn("mt-1 flex items-center gap-1 text-xs font-normal", nikSalah ? "text-merah" : "text-muted")}>
              <Lock className="size-3" /> {nikSalah ? `NIK harus 16 digit (sekarang ${nikBersih.length}).` : "NIK disamarkan; yang tampil hanya 4 digit terakhir."}
            </span>
          </label>
          <KamusForm
            key="ibu"
            tabel="ibu"
            kolom={Object.keys(kamus.tabel.ibu.kolom).filter((k) => !["ibu_id", "nik", "persetujuan_tanggal"].includes(k))}
            nilaiAwal={{ wilayah_posyandu: u.posyandu?.[0], puskesmas_domisili: PUSKESMAS, ...profil }}
            labelSimpan="Lanjut"
            onBatal={() => setLangkah(0)}
            onSimpan={(d) => {
              if (nikSalah) return void toast.error("Periksa NIK terlebih dahulu.");
              if (u.peran === "kader" && d.wilayah_posyandu && !u.posyandu?.includes(String(d.wilayah_posyandu))) return void toast.error(`Kader hanya bisa mendaftarkan ibu di Posyandu ${u.posyandu?.join(", ")}.`);
              setProfil(d);
              setLangkah(2);
            }}
          />
        </Kartu>
      )}

      {langkah === 2 && (
        <Kartu>
          <KamusForm
            key="keluarga"
            tabel="keluarga"
            kolom={Object.keys(kamus.tabel.keluarga.kolom).filter((k) => k !== "nik_pendamping")}
            nilaiAwal={{ hubungan: "Suami", ...keluarga }}
            labelSimpan="Lanjut"
            onBatal={() => setLangkah(1)}
            onSimpan={(d) => {
              setKeluarga(d);
              setLangkah(3);
            }}
          />
        </Kartu>
      )}

      {langkah === 3 && (
        <Kartu className="space-y-3">
          <p className="rounded-2xl bg-brand-soft/60 px-4 py-3 text-sm text-brand-ink">
            Cukup isi <b>HPHT</b> agar usia kehamilan, trimester, HPL, dan jadwal K1–K6 dihitung otomatis. Data lain boleh dilengkapi bidan nanti.
          </p>
          <KamusForm key="riwayat" tabel="riwayat" labelSimpan="Daftarkan ibu" memuat={memuat} onBatal={() => setLangkah(2)} onSimpan={selesai} />
        </Kartu>
      )}
    </div>
  );
}
