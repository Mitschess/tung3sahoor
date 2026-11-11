import raw from "@/data/kamus-data-momcare.json";

export type Tipe =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "enum"
  | "enum_multi"
  | "ref"
  | "list"
  | "object";

export interface Kolom {
  label: string;
  tipe: Tipe;
  otomatis?: boolean;
  pilihan?: string[];
  rentang?: [number, number];
  satuan?: string;
  peringatan?: string;
  nilai?: Record<string, [number, number]>;
}

export interface Tabel {
  judul: string;
  diisi_oleh: string;
  prioritas: "Wajib demo" | "Nanti";
  halaman_pdf: number[];
  kolom: Record<string, Kolom>;
}

export interface Kamus {
  versi: string;
  sumber: string;
  url_pdf: string;
  tabel: Record<string, Tabel>;
}

export const kamus = raw as unknown as Kamus;

export type NamaTabel = keyof typeof raw.tabel;

export function tabel(nama: string): Tabel {
  const t = kamus.tabel[nama];
  if (!t) throw new Error(`Tabel kamus tidak dikenal: ${nama}`);
  return t;
}

export function kolom(namaTabel: string, namaKolom: string): Kolom | undefined {
  return kamus.tabel[namaTabel]?.kolom[namaKolom];
}

/** Tautan langsung ke halaman PDF Buku KIA (nomor halaman PDF, bukan nomor cetak). */
export function urlHalaman(halamanPdf: number): string {
  return `${kamus.url_pdf}#page=${halamanPdf}`;
}

/** Buku dicetak 2 halaman per lembar PDF: halaman cetak → halaman PDF. */
export function cetakKePdf(halamanCetak: number): number {
  return Math.floor(halamanCetak / 2) + 2;
}

export function urlHalamanCetak(halamanCetak: number): string {
  return urlHalaman(cetakKePdf(halamanCetak));
}

/**
 * Pemicu peringatan sederhana yang ditulis di kamus sebagai teks "Ya → Merah" atau
 * "Ya → Kuning". Dipakai agar aturan untuk lembar ceklis (pemantauan) diturunkan
 * langsung dari kamus data, bukan ditulis ulang di kode.
 */
export function levelDariPeringatanYa(k: Kolom): "merah" | "kuning" | null {
  if (k.tipe !== "boolean" || !k.peringatan) return null;
  const m = k.peringatan.match(/^Ya\s*→\s*(Merah|Kuning)/i);
  if (!m) return null;
  return m[1].toLowerCase() === "merah" ? "merah" : "kuning";
}

export type HasilValidasi = { ok: true } | { ok: false; pesan: string };

/**
 * Validasi teknis (bukan batas medis): angka di luar "rentang" ditolak dan pengisi
 * diminta mengecek ulang. Dipakai untuk input manual dan hasil OCR.
 */
export function validasiNilai(k: Kolom, nilai: unknown): HasilValidasi {
  if (nilai === undefined || nilai === null || nilai === "") return { ok: true };
  if (k.tipe === "number") {
    const n = typeof nilai === "number" ? nilai : Number(String(nilai).replace(",", "."));
    if (Number.isNaN(n)) return { ok: false, pesan: "Harus berupa angka" };
    if (k.rentang && (n < k.rentang[0] || n > k.rentang[1])) {
      return {
        ok: false,
        pesan: `Di luar rentang wajar ${k.rentang[0]}–${k.rentang[1]}${k.satuan ? " " + k.satuan : ""}. Cek lagi.`,
      };
    }
  }
  if (k.tipe === "enum" && k.pilihan && !k.pilihan.includes(String(nilai))) {
    return { ok: false, pesan: "Pilihan tidak dikenal" };
  }
  return { ok: true };
}

/** Kolom sensitif: hanya nakes/dokter yang boleh melihat (kode etik bagian 6). */
export const KOLOM_SENSITIF = new Set([
  "tripel_hiv",
  "tripel_sifilis",
  "tripel_hepb",
  "tripel_eliminasi",
  "skrining_jiwa",
  "skrining_jiwa_tanggal",
  "skrining_jiwa_hasil",
  "skrining_jiwa_tindak_lanjut",
  "skrining_jiwa_rujuk",
  "masalah_jiwa",
]);

export function hitungKolom(namaTabel: string) {
  return Object.keys(tabel(namaTabel).kolom).length;
}

export function ringkasKamus() {
  const tabels = Object.values(kamus.tabel);
  return {
    jumlahTabel: tabels.length,
    jumlahKolom: tabels.reduce((s, t) => s + Object.keys(t.kolom).length, 0),
  };
}
