/**
 * Hak akses per peran (spesifikasi bagian 2). Dicek di lapisan data (store) dan di UI.
 */
import { KOLOM_SENSITIF } from "./kamus";
import type { Ibu, Peran, Pengguna, Peringatan } from "./types";

export const LABEL_PERAN: Record<Peran, string> = {
  ibu: "Ibu",
  kader: "Kader",
  bidan: "Bidan / nakes",
  dokter: "Dokter",
};

/** Tabel yang boleh DIISI/DIUBAH oleh tiap peran. */
export const BOLEH_ISI: Record<Peran, string[]> = {
  ibu: ["pemantauan_hamil", "pemantauan_nifas", "pemantauan_bayi", "persiapan", "kb", "ttd", "tinja", "kelas_hamil"],
  kader: ["ibu", "keluarga", "anc", "kf", "kn", "tindak_lanjut", "kelas_hamil", "persiapan"],
  bidan: [
    "ibu", "keluarga", "riwayat", "anc", "lab_t1", "preeklamsia", "dm", "persalinan", "bayi_lahir",
    "kf", "kn", "imunisasi", "amanat", "riwayat_persalinan", "tindak_lanjut", "persiapan", "kelas_hamil",
  ],
  dokter: ["dokter_t1", "dokter_t3", "dm", "rujukan", "preeklamsia", "tindak_lanjut"],
};

/** Tabel yang bisa dipotret (OCR) lalu dikonfirmasi. */
export const TABEL_OCR = ["anc", "kf", "kn"] as const;

export function bolehIsi(u: Pengguna | null | undefined, tabel: string): boolean {
  return !!u && BOLEH_ISI[u.peran].includes(tabel);
}

export function bolehOcr(u: Pengguna | null | undefined): boolean {
  return !!u && u.peran !== "ibu";
}

/** Status tindak lanjut peringatan merah hanya bisa ditutup oleh bidan/nakes atau dokter. */
export function bolehTutupPeringatan(u: Pengguna | null | undefined): boolean {
  return !!u && (u.peran === "bidan" || u.peran === "dokter");
}

export function bolehLihatSensitif(u: Pengguna | null | undefined): boolean {
  return !!u && (u.peran === "bidan" || u.peran === "dokter");
}

export function bolehLihatKolom(u: Pengguna | null | undefined, kolom: string): boolean {
  return !KOLOM_SENSITIF.has(kolom) || bolehLihatSensitif(u);
}

/** Kader hanya melihat ibu di wilayah posyandunya; bidan di wilayah kerjanya; dokter seluruh puskesmas. */
export function bolehLihatIbu(u: Pengguna | null | undefined, ibu: Ibu): boolean {
  if (!u) return false;
  if (u.peran === "ibu") return u.ibuId === ibu.id;
  if (u.peran === "dokter") return true;
  return (u.posyandu ?? []).includes(String(ibu.profil.wilayah_posyandu));
}

export function saringPeringatan(u: Pengguna | null | undefined, ps: Peringatan[]): Peringatan[] {
  if (bolehLihatSensitif(u)) return ps;
  return ps.filter((p) => !p.sensitif);
}
