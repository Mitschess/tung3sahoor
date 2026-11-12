/**
 * Penanda nilai pada satu catatan: angka atau jawaban yang di luar batas diberi warna
 * Merah/Kuning supaya terlihat saat catatan dibuka. Batas mengikuti kolom "peringatan" di kamus data
 * dan mesin peringatan (aturan.ts), tetapi dinilai per catatan, termasuk catatan lama.
 */
import { kamus, levelDariPeringatanYa } from "./kamus";
import type { Level } from "./types";

export interface Tanda {
  level: Level;
  /** Ringkas dan mudah dipahami ibu, misalnya "Tekanan darah tinggi". */
  judul: string;
  /** Batas atau keterangan tambahan. */
  ket?: string;
}

/** Warna latar dan teks untuk penanda. */
export const WARNA_TANDA: Record<Level, string> = {
  merah: "bg-merah-soft text-merah",
  kuning: "bg-kuning-soft text-kuning",
};

const n = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const x = Number(v);
  return Number.isNaN(x) ? undefined : x;
};

/**
 * Penanda per kolom. Tekanan darah memakai kunci gabungan "td" (sistolik dan diastolik dibaca bersama).
 * `boleh` menyaring kolom yang tidak boleh dilihat pengguna (data sensitif), supaya penanda tidak membocorkannya.
 */
export function tandaiNilai(tabel: string, data: Record<string, unknown>, boleh: (kolom: string) => boolean = () => true): Record<string, Tanda> {
  const out: Record<string, Tanda> = {};
  const pasang = (k: string, t: Tanda) => {
    if (k !== "td" && !boleh(k)) return;
    if (!out[k] || (out[k].level === "kuning" && t.level === "merah")) out[k] = t;
  };

  const s = n(data.td_sistolik);
  const d = n(data.td_diastolik);
  const tdTinggi = (s ?? 0) >= 140 || (d ?? 0) >= 90;
  if ((tabel === "anc" || tabel === "kf") && tdTinggi) pasang("td", { level: "merah", judul: "Tekanan darah tinggi", ket: "batas 140/90" });

  if (tabel === "anc" && String(data.protein_urine ?? "").startsWith("+"))
    pasang("protein_urine", { level: tdTinggi ? "merah" : "kuning", judul: "Protein urine positif", ket: tdTinggi ? "bersama tekanan darah tinggi" : undefined });

  if (tabel === "anc" || tabel === "dokter_t3") {
    const djj = n(data.djj);
    if (djj !== undefined && (djj < 120 || djj > 160)) pasang("djj", { level: "merah", judul: "Denyut jantung bayi tidak normal", ket: "normal 120–160" });
  }

  if (tabel === "anc" || tabel === "lab_t1" || tabel === "dokter_t3") {
    const kolom = tabel === "dokter_t3" ? "lab_hb" : "hb";
    const hb = n(data[kolom]);
    const uk = n(data.usia_kehamilan_minggu);
    const batas = tabel === "anc" && uk !== undefined && uk > 12 && uk <= 24 ? 10.5 : 11;
    if (hb !== undefined && hb < 7) pasang(kolom, { level: "merah", judul: "Hb sangat rendah", ket: "di bawah 7" });
    else if (hb !== undefined && hb < batas) pasang(kolom, { level: "kuning", judul: "Hb rendah (kurang darah)", ket: `di bawah ${String(batas).replace(".", ",")}` });
  }

  if (tabel === "anc" && (n(data.lila_cm) ?? 99) < 23.5) pasang("lila_cm", { level: "kuning", judul: "Lingkar lengan kecil", ket: "di bawah 23,5 cm" });
  if (tabel === "lab_t1" && (n(data.gds) ?? 0) >= 200) pasang("gds", { level: "merah", judul: "Gula darah tinggi", ket: "200 atau lebih" });

  if (tabel === "kf") {
    if ((n(data.suhu_c) ?? 0) > 38) pasang("suhu_c", { level: "merah", judul: "Demam", ket: "di atas 38 °C" });
    if (data.lokhia_perdarahan === "tidak normal") pasang("lokhia_perdarahan", { level: "merah", judul: "Perdarahan tidak normal" });
    if (data.jalan_lahir === "tidak normal") pasang("jalan_lahir", { level: "kuning", judul: "Jalan lahir perlu dicek" });
  }

  if (tabel === "kn") {
    if ((n(data.bb_g) ?? 9999) < 2500) pasang("bb_g", { level: "merah", judul: "Berat bayi rendah", ket: "di bawah 2.500 gram" });
    if (data.menyusu === false) pasang("menyusu", { level: "merah", judul: "Bayi tidak mau menyusu" });
  }
  if (tabel === "bayi_lahir" && (n(data.berat_lahir_g) ?? 9999) < 2500) pasang("berat_lahir_g", { level: "merah", judul: "Berat lahir rendah", ket: "di bawah 2.500 gram" });
  if (tabel === "tinja" && (n(data.nomor_warna) ?? 9) <= 3) pasang("nomor_warna", { level: "merah", judul: "Tinja bayi pucat", ket: "segera ke dokter" });

  // Jawaban "Ya" yang di kamus ditandai "Ya → Merah/Kuning" (lembar pemantauan, tanda bahaya bayi, bayi kuning).
  const def = kamus.tabel[tabel]?.kolom ?? {};
  for (const [k, kol] of Object.entries(def)) {
    if (data[k] !== true) continue;
    const lv = levelDariPeringatanYa(kol);
    if (lv) pasang(k, { level: lv, judul: kol.label });
  }
  return out;
}

/** Penanda terberat untuk satu catatan (merah lebih dulu), dan berapa penanda lainnya. */
export function tandaUtama(t: Record<string, Tanda>): (Tanda & { lain: number }) | null {
  const semua = Object.values(t);
  if (!semua.length) return null;
  const urut = [...semua].sort((a, b) => (a.level === b.level ? 0 : a.level === "merah" ? -1 : 1));
  return { ...urut[0], lain: semua.length - 1 };
}
