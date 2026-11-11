/**
 * Kartu "Status Kesehatan Ibu" di beranda ibu: nilai terakhir dari pemeriksaan + label sederhana.
 * Ambang mengikuti mesin peringatan (aturan.ts) supaya warna kartu dan peringatan selalu sejalan.
 */
import type { Ringkasan } from "./hooks";
import type { SetMenu } from "./tahap";
import { tampil } from "./tanggal";

export type Nada = "hijau" | "kuning" | "merah" | "netral";

export interface StatusKesehatan {
  id: string;
  judul: string;
  nilai?: string;
  satuan?: string;
  label?: string;
  ket: string;
  nada: Nada;
  href: string;
  aksi?: string;
  lebar?: boolean;
}

export const KARTU_STATUS: { id: string; judul: string; untuk: SetMenu[] }[] = [
  { id: "pantau", judul: "Pemantauan Ibu", untuk: ["hamil", "nifas"] },
  { id: "td", judul: "Tekanan Darah", untuk: ["hamil", "nifas"] },
  { id: "bb", judul: "Berat Badan", untuk: ["hamil"] },
  { id: "hb", judul: "Hemoglobin (Hb)", untuk: ["hamil"] },
  { id: "djj", judul: "Detak Jantung Janin", untuk: ["hamil"] },
  { id: "lila", judul: "Lingkar Lengan Atas", untuk: ["hamil"] },
  { id: "suhu", judul: "Suhu Tubuh", untuk: ["nifas"] },
  { id: "bb_bayi", judul: "Berat Bayi", untuk: ["nifas"] },
  { id: "menyusu", judul: "Menyusu", untuk: ["nifas"] },
];

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

const kosong = (id: string, judul: string, ket: string, href = "/ibu/hasil", aksi = "Cek jadwal"): StatusKesehatan => ({ id, judul, ket, nada: "netral", href, aksi });

export function hitungStatus(r: Ringkasan): StatusKesehatan[] {
  const set = r.tahap.set;
  const out: StatusKesehatan[] = [];
  const diperiksa = (t?: unknown) => (t ? `Diperiksa ${tampil(t)}` : "Dari pemeriksaan terakhir");

  // Pemantauan mandiri (lembar Buku KIA)
  if (set === "hamil") {
    const m = r.tahap.ukMinggu ?? 0;
    const c = r.cari("pemantauan_hamil").find((x) => Number(x.data.minggu_kehamilan) === m);
    const gejala = c ? Object.entries(c.data).filter(([k, v]) => v === true && !["periksa_kehamilan", "kelas_ibu_hamil"].includes(k)).length : 0;
    out.push(
      c
        ? { id: "pantau", judul: "Pemantauan Ibu", nilai: `Minggu ke-${m}`, label: gejala ? `${gejala} keluhan` : "Tidak ada keluhan", ket: "Lembar pemantauan sudah diisi", nada: gejala ? "kuning" : "hijau", href: "/ibu/pantau", lebar: true }
        : { id: "pantau", judul: "Pemantauan Ibu", ket: `Lembar minggu ke-${m} belum diisi. Hanya ±1 menit.`, nada: "netral", href: "/ibu/pantau", aksi: "Isi sekarang", lebar: true },
    );
  } else if (set === "nifas") {
    const h = r.tahap.hariNifas ?? 0;
    const c = r.cari("pemantauan_nifas").find((x) => Number(x.data.hari_ke) === h);
    out.push(
      c
        ? { id: "pantau", judul: "Pemantauan Ibu", nilai: `Hari ke-${h}`, label: "Sudah diisi", ket: "Lembar pemantauan nifas hari ini", nada: "hijau", href: "/ibu/pantau?lembar=nifas", lebar: true }
        : { id: "pantau", judul: "Pemantauan Ibu", ket: `Lembar nifas hari ke-${h} belum diisi.`, nada: "netral", href: "/ibu/pantau?lembar=nifas", aksi: "Isi sekarang", lebar: true },
    );
  }

  // Tekanan darah: ANC saat hamil, KF saat nifas. ≥ 140/90 → Merah.
  const sumberTd = set === "nifas" ? ["kf"] : ["anc"];
  const s = terbaru(r, sumberTd, "td_sistolik");
  const d = terbaru(r, sumberTd, "td_diastolik");
  if (s && d) {
    const tinggi = Number(s.v) >= 140 || Number(d.v) >= 90;
    out.push({ id: "td", judul: "Tekanan Darah", nilai: `${s.v}/${d.v}`, satuan: "mmHg", label: tinggi ? "Tinggi" : "Normal", ket: diperiksa(s.tanggal), nada: tinggi ? "merah" : "hijau", href: "/ibu/hasil" });
  } else out.push(kosong("td", "Tekanan Darah", "Periksa di posyandu/puskesmas untuk mengetahui tekanan darah."));

  if (set === "hamil") {
    const bb = terbaru(r, ["anc"], "bb_kg");
    const pra = terbaru(r, ["riwayat"], "bb_prahamil_kg");
    const naik = bb && pra ? Number(bb.v) - Number(pra.v) : undefined;
    const kurangPas = r.peringatan.some((p) => /berat badan/i.test(p.judul));
    out.push(
      bb
        ? { id: "bb", judul: "Berat Badan", nilai: fmt(Number(bb.v)), satuan: "kg", label: naik !== undefined ? `${naik >= 0 ? "+" : ""}${fmt(naik)} kg` : undefined, ket: naik !== undefined ? "Kenaikan sejak sebelum hamil" : diperiksa(bb.tanggal), nada: kurangPas ? "kuning" : "hijau", href: "/ibu/hasil" }
        : kosong("bb", "Berat Badan", "Ditimbang setiap periksa kehamilan."),
    );

    const hb = terbaru(r, ["anc", "lab_t1"], "hb");
    if (hb) {
      const v = Number(hb.v);
      const batas = r.tahap.trimester === 2 ? 10.5 : 11;
      out.push({ id: "hb", judul: "Hemoglobin (Hb)", nilai: fmt(v), satuan: "g/dL", label: v < 7 ? "Sangat rendah" : v < batas ? "Rendah" : "Normal", ket: diperiksa(hb.tanggal), nada: v < 7 ? "merah" : v < batas ? "kuning" : "hijau", href: "/ibu/hasil" });
    } else out.push(kosong("hb", "Hemoglobin (Hb)", "Cek Hb di laboratorium puskesmas (trimester 1 & 3)."));

    const djj = terbaru(r, ["anc"], "djj");
    if (djj) {
      const v = Number(djj.v);
      const ok = v >= 120 && v <= 160;
      out.push({ id: "djj", judul: "Detak Jantung Janin", nilai: String(v), satuan: "x/menit", label: ok ? "Normal" : "Perlu dicek", ket: diperiksa(djj.tanggal), nada: ok ? "hijau" : "merah", href: "/ibu/hasil" });
    } else out.push(kosong("djj", "Detak Jantung Janin", "Didengarkan bidan mulai usia kehamilan ±12 minggu."));

    const lila = terbaru(r, ["anc"], "lila_cm");
    if (lila) {
      const v = Number(lila.v);
      out.push({ id: "lila", judul: "Lingkar Lengan Atas", nilai: fmt(v), satuan: "cm", label: v < 23.5 ? "Risiko KEK" : "Normal", ket: diperiksa(lila.tanggal), nada: v < 23.5 ? "kuning" : "hijau", href: "/ibu/hasil" });
    } else out.push(kosong("lila", "Lingkar Lengan Atas", "Diukur saat kunjungan pertama (K1)."));
  }

  if (set === "nifas") {
    const suhu = terbaru(r, ["kf"], "suhu_c");
    if (suhu) {
      const v = Number(suhu.v);
      out.push({ id: "suhu", judul: "Suhu Tubuh", nilai: fmt(v), satuan: "°C", label: v > 38 ? "Demam" : "Normal", ket: diperiksa(suhu.tanggal), nada: v > 38 ? "merah" : "hijau", href: "/ibu/hasil" });
    } else out.push(kosong("suhu", "Suhu Tubuh", "Diukur saat kunjungan nifas (KF)."));

    const bbBayi = terbaru(r, ["kn", "bayi_lahir"], "bb_g") ?? terbaru(r, ["bayi_lahir"], "berat_lahir_g");
    if (bbBayi) {
      const v = Number(bbBayi.v);
      out.push({ id: "bb_bayi", judul: "Berat Bayi", nilai: fmt(v, 0), satuan: "gram", label: v < 2500 ? "Rendah" : "Baik", ket: diperiksa(bbBayi.tanggal), nada: v < 2500 ? "merah" : "hijau", href: "/ibu/hasil" });
    } else out.push(kosong("bb_bayi", "Berat Bayi", "Ditimbang saat kunjungan neonatal (KN)."));

    const menyusu = terbaru(r, ["kn"], "menyusu");
    if (menyusu) {
      const ya = menyusu.v === true;
      out.push({ id: "menyusu", judul: "Menyusu", nilai: ya ? "Kuat" : "Tidak mau", ket: diperiksa(menyusu.tanggal), nada: ya ? "hijau" : "merah", href: "/ibu/edukasi/menyusui" });
    } else out.push(kosong("menyusu", "Menyusu", "Susui bayi sesering mungkin, minimal 8 kali sehari.", "/ibu/edukasi/menyusui", "Baca tips"));
  }

  return out;
}
