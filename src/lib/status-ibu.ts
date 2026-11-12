/**
 * Kartu "Hasil periksa terakhir" di beranda ibu: hanya angka yang paling mudah dipahami
 * (tekanan darah dan berat badan). Hasil lain tetap ada di Catatan.
 * Ambang mengikuti mesin peringatan (aturan.ts) supaya warna kartu dan peringatan selalu sejalan.
 */
import type { Ringkasan } from "./hooks";
import { tampil } from "./tanggal";

export interface StatusKesehatan {
  id: string;
  judul: string;
  nilai: string;
  satuan: string;
  label: string;
  ket: string;
  nada: "hijau" | "kuning" | "merah";
  href: string;
}

const fmt = (n: number, d = 1) => n.toLocaleString("id-ID", { maximumFractionDigits: d });

/** Catatan terbaru (urut tanggal) yang punya nilai untuk kolom tertentu. */
function terbaru(r: Ringkasan, tabel: string[], kolom: string) {
  let hasil: { v: unknown; tanggal?: unknown } | undefined;
  let kunci = "";
  for (const t of tabel) {
    for (const c of r.cari(t)) {
      const v = c.data[kolom];
      if (v === undefined || v === null || v === "") continue;
      const k = String(c.data.tanggal ?? c.data.tanggal_jam ?? c.meta.dibuat_pada);
      if (k >= kunci) {
        kunci = k;
        hasil = { v, tanggal: c.data.tanggal ?? c.data.tanggal_jam };
      }
    }
  }
  return hasil;
}

/** Hanya kartu yang sudah ada angkanya; kartu kosong tidak ditampilkan. */
export function hitungStatus(r: Ringkasan): StatusKesehatan[] {
  const set = r.tahap.set;
  const out: StatusKesehatan[] = [];
  const diperiksa = (t?: unknown) => (t ? `Diperiksa ${tampil(t)}` : "Dari pemeriksaan terakhir");

  // Tekanan darah: ANC saat hamil, KF saat nifas. >= 140/90 -> Merah.
  const sumberTd = set === "nifas" ? ["kf"] : ["anc"];
  const s = terbaru(r, sumberTd, "td_sistolik");
  const d = terbaru(r, sumberTd, "td_diastolik");
  if (s && d) {
    const tinggi = Number(s.v) >= 140 || Number(d.v) >= 90;
    out.push({ id: "td", judul: "Tekanan darah", nilai: `${s.v}/${d.v}`, satuan: "mmHg", label: tinggi ? "Tinggi" : "Normal", ket: diperiksa(s.tanggal), nada: tinggi ? "merah" : "hijau", href: "/ibu/catatan" });
  }

  if (set === "hamil") {
    const bb = terbaru(r, ["anc"], "bb_kg");
    if (bb) {
      const pra = terbaru(r, ["riwayat"], "bb_prahamil_kg");
      const naik = pra ? Number(bb.v) - Number(pra.v) : undefined;
      const kurangPas = r.peringatan.some((p) => /berat badan/i.test(p.judul));
      out.push({
        id: "bb",
        judul: "Berat badan",
        nilai: fmt(Number(bb.v)),
        satuan: "kg",
        label: naik !== undefined ? `${naik >= 0 ? "+" : ""}${fmt(naik)} kg` : kurangPas ? "Perlu dicek" : "Tercatat",
        ket: naik !== undefined ? "Kenaikan sejak sebelum hamil" : diperiksa(bb.tanggal),
        nada: kurangPas ? "kuning" : "hijau",
        href: "/ibu/hasil#grafik",
      });
    }
  }

  if (set === "nifas") {
    const bbBayi = terbaru(r, ["kn", "bayi_lahir"], "bb_g") ?? terbaru(r, ["bayi_lahir"], "berat_lahir_g");
    if (bbBayi) {
      const v = Number(bbBayi.v);
      out.push({ id: "bb_bayi", judul: "Berat bayi", nilai: fmt(v, 0), satuan: "gram", label: v < 2500 ? "Rendah" : "Baik", ket: diperiksa(bbBayi.tanggal), nada: v < 2500 ? "merah" : "hijau", href: "/ibu/catatan" });
    }
  }

  return out;
}
