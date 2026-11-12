/** Pengelompokan tabel catatan ke bab Buku KIA (warna pita mengikuti buku). */
import type { Tema } from "@/data/edukasi";
import { kamus } from "./kamus";
import { tampil } from "./tanggal";
import type { Catatan } from "./types";

export const BAB_TABEL: { tema: Tema; judul: string; tabel: string[] }[] = [
  { tema: "rose", judul: "Kehamilan", tabel: ["riwayat", "anc", "dokter_t1", "lab_t1", "preeklamsia", "dm", "dokter_t3", "pemantauan_hamil", "ttd", "kelas_hamil", "persiapan", "amanat"] },
  { tema: "brand", judul: "Melahirkan", tabel: ["persalinan", "riwayat_persalinan", "bayi_lahir", "rujukan"] },
  { tema: "ungu", judul: "Setelah melahirkan", tabel: ["kf", "pemantauan_nifas", "kb"] },
  { tema: "teal", judul: "Bayi 0–28 hari", tabel: ["kn", "imunisasi", "pemantauan_bayi", "tinja"] },
];

/**
 * Judul catatan dalam bahasa sehari-hari untuk layar ibu. Judul kamus data (mis. "Evaluasi kesehatan
 * ibu hamil dan pemeriksaan dokter T1") tetap dipakai di layar petugas.
 */
const JUDUL_IBU: Record<string, string> = {
  riwayat: "Data awal kehamilan",
  anc: "Periksa kehamilan (K1–K6)",
  dokter_t1: "Periksa dokter, trimester 1",
  lab_t1: "Cek darah, trimester 1",
  preeklamsia: "Cek risiko preeklamsia",
  dm: "Cek gula darah kehamilan",
  dokter_t3: "Periksa dokter, trimester 3",
  pemantauan_hamil: "Pantau mingguan",
  ttd: "Minum tablet tambah darah",
  kelas_hamil: "Kelas ibu hamil",
  persiapan: "Persiapan melahirkan (P4K)",
  amanat: "Amanat persalinan",
  persalinan: "Catatan persalinan",
  riwayat_persalinan: "Riwayat melahirkan",
  bayi_lahir: "Bayi saat lahir",
  rujukan: "Rujukan",
  kf: "Periksa nifas (KF1–KF4)",
  pemantauan_nifas: "Pantau nifas harian",
  kb: "Keluarga berencana (KB)",
  kn: "Periksa bayi (KN1–KN3)",
  imunisasi: "Imunisasi bayi",
  pemantauan_bayi: "Pantau bayi harian",
  tinja: "Warna tinja bayi",
};

export function judulTabelIbu(tabel: string): string {
  return JUDUL_IBU[tabel] ?? kamus.tabel[tabel]?.judul ?? tabel;
}

/** Halaman cetak Buku KIA untuk sebuah tabel (PDF memuat 2 halaman cetak per lembar). */
export function halamanCetakTabel(tabel: string): number | undefined {
  const pdf = kamus.tabel[tabel]?.halaman_pdf[0];
  return pdf && pdf > 2 ? (pdf - 2) * 2 : undefined;
}

/** Tanggal utama sebuah catatan untuk pengurutan. */
export function tanggalCatatan(c: Catatan): string {
  const d = c.data;
  return String(d.tanggal ?? d.tanggal_jam ?? d.tanggal_rujuk ?? c.meta.dibuat_pada ?? "");
}

export function keteranganTanggal(c: Catatan): string {
  const t = tanggalCatatan(c);
  return t ? tampil(t.slice(0, 10)) : "";
}

/** Keterangan baris catatan: tanggal (bila belum ada di judul) dan pengisi. */
export function keteranganCatatan(c: Catatan, judul: string, pengisi: string): string {
  const tgl = keteranganTanggal(c);
  return [tgl && !judul.includes(tgl) ? tgl : null, `diisi ${pengisi}`].filter(Boolean).join(" · ");
}
