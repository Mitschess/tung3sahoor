export type Peran = "ibu" | "kader" | "bidan" | "dokter";

export interface Pengguna {
  id: string;
  nama: string;
  peran: Peran;
  /** Wilayah posyandu (kader: satu, bidan: wilayah kerja). Dokter melihat seluruh puskesmas. */
  posyandu?: string[];
  /** Untuk akun ibu: ibu yang ditautkan. */
  ibuId?: string;
  keterangan?: string;
}

export type Sumber = "Ketik manual" | "foto (OCR)" | "impor";

export interface RiwayatUbah {
  oleh: string;
  pada: string;
  catatan: string;
}

export interface Meta {
  dibuat_oleh: string;
  dibuat_pada: string;
  sumber: Sumber;
  foto_id?: string;
  ocr_yakin?: Record<string, number>;
  dikonfirmasi_oleh?: string;
  dikonfirmasi_pada?: string;
  diubah_terakhir?: RiwayatUbah[];
}

export type Nilai = string | number | boolean | string[] | null | undefined | Record<string, unknown>;
export type Data = Record<string, Nilai>;

/** Satu baris pada salah satu tabel kamus data (anc, kf, kn, pemantauan_hamil, …). */
export interface Catatan {
  id: string;
  tabel: string;
  ibuId: string;
  anakId?: string;
  data: Data;
  meta: Meta;
}

export interface Ibu {
  id: string;
  /** Kolom tabel "ibu" (tanpa NIK mentah). */
  profil: Data;
  /** Kolom tabel "keluarga". */
  keluarga: Data;
  /** NIK disimpan sebagai hash SHA-256, ditampilkan tersamar. */
  nikHash: string;
  nikSamaran: string;
  persetujuan: { tanggal: string; versi: string; saksi: string };
}

export interface DrafOcr {
  id: string;
  ibuId: string;
  tabel: string;
  fotoDataUrl: string;
  hasil: Data;
  yakin: Record<string, number>;
  /** "tesseract": dibaca di perangkat. "demo" hanya ada pada draf lama. */
  mode: "gemini" | "tesseract" | "demo";
  model?: string;
  dibuat_oleh: string;
  dibuat_pada: string;
}

export type Level = "merah" | "kuning";

export interface Peringatan {
  id: string;
  ibuId: string;
  level: Level;
  judul: string;
  detail: string;
  /** Rujukan halaman cetak Buku KIA atau literatur. */
  sumber: string;
  halamanCetak?: number;
  tabel?: string;
  catatanId?: string;
  /** Data sensitif (tripel eliminasi, kesehatan jiwa): tidak tampil ke kader & keluarga. */
  sensitif?: boolean;
  untuk: "ibu" | "bayi";
  tanggal: string;
}

export interface StatusPeringatan {
  status: "ditutup";
  oleh: string;
  pada: string;
  catatan: string;
}

export interface LogPengingat {
  id: string;
  ibuId: string;
  ke: "ibu" | "pendamping";
  telepon: string;
  pesan: string;
  oleh: string;
  pada: string;
}
