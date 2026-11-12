/** "Hari ini: apa yang harus kulakukan?" – maksimal 3 hal yang jatuh tempo untuk ibu. */
import type { Ringkasan } from "./hooks";
import { terakhir } from "./tahap";
import { parse, selisihHari } from "./tanggal";

export interface Tugas {
  id: string;
  judul: string;
  teks: string;
  href: string;
  nada: "brand" | "kuning";
}

export function tugasHariIni(r: Ringkasan, now: Date): Tugas[] {
  const out: Tugas[] = [];
  const t = r.tahap;

  // Peringatan Merah tidak diulang di sini: beranda sudah menampilkannya sebagai kotak merah tersendiri.

  if (t.set === "hamil") {
    const minggu = t.ukMinggu ?? 0;
    const sudah = r.cari("pemantauan_hamil").some((c) => Number(c.data.minggu_kehamilan) === minggu);
    if (!sudah) out.push({ id: "pantau", judul: `Isi pemantauan minggu ke-${minggu}`, teks: "Ketuk gambar kondisi Ibu minggu ini (±1 menit).", href: "/ibu/pantau", nada: "brand" });
  }
  if (t.set === "nifas") {
    const h = t.hariNifas ?? 0;
    const ibuSudah = r.cari("pemantauan_nifas").some((c) => Number(c.data.hari_ke) === h);
    const bayiSudah = r.cari("pemantauan_bayi").some((c) => Number(c.data.hari_ke) === h - 1 || Number(c.data.hari_ke) === h);
    if (!ibuSudah) out.push({ id: "pantau-nifas", judul: `Cek kondisi Ibu hari ke-${h}`, teks: "Lembar pemantauan nifas harian.", href: "/ibu/pantau?lembar=nifas", nada: "brand" });
    if (!bayiSudah && (t.umurBayiHari ?? 99) <= 28) out.push({ id: "pantau-bayi", judul: `Cek kondisi bayi hari ke-${Math.max(1, t.umurBayiHari ?? 1)}`, teks: "Lembar pemantauan harian bayi 0–28 hari.", href: "/ibu/pantau?lembar=bayi", nada: "brand" });
  }

  const kembali = [...r.cari("anc")].reverse().find((a) => a.data.tanggal_kembali)?.data.tanggal_kembali;
  const tk = parse(kembali);
  if (tk && t.set === "hamil") {
    const d = selisihHari(tk, now);
    if (d >= -2 && d <= 3) {
      out.push({ id: "kembali", judul: d === 0 ? "Hari ini jadwal periksa" : d > 0 ? `Periksa ${d} hari lagi` : `Jadwal periksa lewat ${-d} hari`, teks: `Tanggal kembali dari bidan: ${tk.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}. Bawa Buku KIA.`, href: "/ibu/hasil", nada: d < 0 ? "kuning" : "brand" });
    }
  }
  if (r.berikut && (r.berikut.status === "sekarang" || r.berikut.status === "terlambat") && !out.some((o) => o.id === "kembali")) {
    out.push({ id: "jadwal", judul: r.berikut.nama, teks: `Jatuh tempo sampai ${r.berikut.selesai.toLocaleDateString("id-ID", { day: "numeric", month: "long" })} · ${r.berikut.oleh}`, href: "/ibu/hasil", nada: "brand" });
  }

  if (t.set === "hamil" && (t.ukMinggu ?? 0) > 12) {
    const p = terakhir(r.cari, "persiapan")?.data ?? {};
    const total = 10;
    const sudah = Object.values(p).filter((v) => v === true).length;
    if (sudah < total) out.push({ id: "persiapan", judul: "Lengkapi persiapan melahirkan", teks: `${sudah} dari ${total} persiapan sudah siap.`, href: "/ibu/persiapan", nada: (t.ukMinggu ?? 0) >= 36 ? "kuning" : "brand" });
  }

  return out.slice(0, 3);
}
