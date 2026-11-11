import type { Pencari, Tahap } from "./tahap";
import { terakhir } from "./tahap";
import { tambahHari } from "./tanggal";

export type StatusKunjungan = "selesai" | "sekarang" | "akan datang" | "terlambat";

export interface Kunjungan {
  kode: string;
  nama: string;
  jenis: "anc" | "dokter" | "skrining" | "kf" | "kn";
  oleh: "Bidan/nakes" | "Dokter";
  tabel: string;
  mulai: Date;
  selesai: Date;
  status: StatusKunjungan;
  tanggalSelesai?: string;
  catatanId?: string;
  halamanCetak: number;
  untuk: "ibu" | "bayi";
}

/** Jendela K1–K6: 1× T1, 2× T2, 3× T3 (Permenkes 21/2021 Ps. 13; Buku KIA hlm. 96). */
const ANC: { kode: string; minggu: [number, number] }[] = [
  { kode: "K1", minggu: [0, 12] },
  { kode: "K2", minggu: [13, 20] },
  { kode: "K3", minggu: [21, 24] },
  { kode: "K4", minggu: [25, 30] },
  { kode: "K5", minggu: [31, 36] },
  { kode: "K6", minggu: [37, 40] },
];

const TOLERANSI_HAMIL_HARI = 7; // "Lewat jadwal > 7 hari → Kuning"

function status(now: Date, mulai: Date, selesai: Date, selesaiPada?: string, toleransi = 0): StatusKunjungan {
  if (selesaiPada) return "selesai";
  if (now > tambahHari(selesai, toleransi)) return "terlambat";
  if (now >= mulai) return "sekarang";
  return "akan datang";
}

export function jadwalKehamilan(t: Tahap, cari: Pencari, now: Date): Kunjungan[] {
  if (!t.hpht) return [];
  const hpht = t.hpht;
  const tglMinggu = (m: number, akhir = false) => tambahHari(hpht, m * 7 + (akhir ? 6 : 0));
  const anc = cari("anc");
  const out: Kunjungan[] = [];

  ANC.forEach((k, i) => {
    const rec = anc.find((a) => Number(a.data.kunjungan_ke) === i + 1) ?? anc[i];
    const mulai = tglMinggu(k.minggu[0]);
    const selesai = tglMinggu(k.minggu[1], true);
    out.push({
      kode: k.kode,
      nama: `Periksa kehamilan ${k.kode}`,
      jenis: "anc",
      oleh: "Bidan/nakes",
      tabel: "anc",
      mulai,
      selesai,
      status: status(now, mulai, selesai, rec?.data.tanggal as string | undefined, TOLERANSI_HAMIL_HARI),
      tanggalSelesai: rec?.data.tanggal as string | undefined,
      catatanId: rec?.id,
      halamanCetak: 96,
      untuk: "ibu",
    });
  });

  const tambah = (kode: string, nama: string, tabel: string, m: [number, number], oleh: Kunjungan["oleh"], hlm: number, jenis: Kunjungan["jenis"]) => {
    const rec = terakhir(cari, tabel);
    const mulai = tglMinggu(m[0]);
    const selesai = tglMinggu(m[1], true);
    out.push({
      kode,
      nama,
      jenis,
      oleh,
      tabel,
      mulai,
      selesai,
      status: status(now, mulai, selesai, rec?.data.tanggal as string | undefined, TOLERANSI_HAMIL_HARI),
      tanggalSelesai: rec?.data.tanggal as string | undefined,
      catatanId: rec?.id,
      halamanCetak: hlm,
      untuk: "ibu",
    });
  };
  tambah("Dokter T1", "Pemeriksaan dokter T1 + USG", "dokter_t1", [0, 12], "Dokter", 98, "dokter");
  tambah("Preeklamsia", "Skrining preeklamsia (< 20 minggu)", "preeklamsia", [0, 19], "Bidan/nakes", 102, "skrining");
  tambah("Skrining DM", "Skrining diabetes gestasional", "dm", [24, 28], "Dokter", 102, "skrining");
  tambah("Dokter T3", "Pemeriksaan dokter T3 + USG", "dokter_t3", [32, 36], "Dokter", 104, "dokter");

  return out.sort((a, b) => a.mulai.getTime() - b.mulai.getTime());
}

const KF: { kode: string; jam: [number, number] }[] = [
  { kode: "KF1", jam: [6, 48] },
  { kode: "KF2", jam: [3 * 24, 7 * 24] },
  { kode: "KF3", jam: [8 * 24, 28 * 24] },
  { kode: "KF4", jam: [29 * 24, 42 * 24] },
];
const KN: { kode: string; jam: [number, number] }[] = [
  { kode: "KN1", jam: [6, 48] },
  { kode: "KN2", jam: [3 * 24, 7 * 24] },
  { kode: "KN3", jam: [8 * 24, 28 * 24] },
];

function plusJam(d: Date, j: number) {
  return new Date(d.getTime() + j * 3600_000);
}

export function jadwalNifas(t: Tahap, cari: Pencari, now: Date): Kunjungan[] {
  if (!t.lahir) return [];
  const lahir = t.lahir;
  const kf = cari("kf");
  const kn = cari("kn");
  const out: Kunjungan[] = [];
  KF.forEach((k, i) => {
    const rec = kf.find((r) => Number(r.data.kf_ke) === i + 1);
    const mulai = plusJam(lahir, k.jam[0]);
    const selesai = plusJam(lahir, k.jam[1]);
    out.push({
      kode: k.kode,
      nama: `Kunjungan nifas ${k.kode}`,
      jenis: "kf",
      oleh: "Bidan/nakes",
      tabel: "kf",
      mulai,
      selesai,
      status: status(now, mulai, selesai, rec?.data.tanggal as string | undefined),
      tanggalSelesai: rec?.data.tanggal as string | undefined,
      catatanId: rec?.id,
      halamanCetak: 116,
      untuk: "ibu",
    });
  });
  KN.forEach((k) => {
    const rec = kn.find((r) => r.data.kn_ke === k.kode);
    const mulai = plusJam(lahir, k.jam[0]);
    const selesai = plusJam(lahir, k.jam[1]);
    out.push({
      kode: k.kode,
      nama: `Kunjungan neonatal ${k.kode}`,
      jenis: "kn",
      oleh: "Bidan/nakes",
      tabel: "kn",
      mulai,
      selesai,
      status: status(now, mulai, selesai, (rec?.data.tanggal_jam as string | undefined)),
      tanggalSelesai: rec?.data.tanggal_jam as string | undefined,
      catatanId: rec?.id,
      halamanCetak: 122,
      untuk: "bayi",
    });
  });
  return out.sort((a, b) => a.mulai.getTime() - b.mulai.getTime());
}

export function jadwal(t: Tahap, cari: Pencari, now: Date): Kunjungan[] {
  if (t.set === "hamil") return jadwalKehamilan(t, cari, now);
  if (t.set === "nifas") return jadwalNifas(t, cari, now);
  return [];
}

export function kunjunganBerikut(js: Kunjungan[]): Kunjungan | undefined {
  return js.find((k) => k.status === "sekarang") ?? js.find((k) => k.status === "akan datang");
}
