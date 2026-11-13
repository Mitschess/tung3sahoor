/**
 * Ringkasan klinis untuk petugas: angka yang paling sering dicari saat membuka data seorang ibu,
 * supaya tidak perlu membuka riwayat satu per satu. Ambang mengikuti mesin peringatan (aturan.ts).
 */
import type { Ringkasan } from "./hooks";
import { hitungStatus, terbaru } from "./status-ibu";
import { tampil } from "./tanggal";

export interface ButirKlinis {
  id: string;
  label: string;
  nilai: string;
  satuan?: string;
  ket?: string;
  nada?: "merah" | "kuning" | "hijau";
}

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 1 });

export function ringkasKlinis(r: Ringkasan): ButirKlinis[] {
  const out: ButirKlinis[] = [];
  const status = hitungStatus(r);
  const hamil = r.tahap.set === "hamil";

  const td = status.find((s) => s.id === "td");
  if (td) out.push({ id: "td", label: "Tekanan darah", nilai: td.nilai, satuan: td.satuan, ket: `${td.label} · ${td.ket.replace(/^Diperiksa /, "")}`, nada: td.nada });

  const bb = status.find((s) => s.id === "bb");
  if (bb) out.push({ id: "bb", label: "Berat badan", nilai: bb.nilai, satuan: bb.satuan, ket: bb.label.endsWith("kg") ? `${bb.label} sejak sebelum hamil` : bb.label, nada: bb.nada === "hijau" ? undefined : bb.nada });

  const bayi = status.find((s) => s.id === "bb_bayi");
  if (bayi) out.push({ id: "bb_bayi", label: "Berat bayi", nilai: bayi.nilai, satuan: bayi.satuan, ket: `${bayi.label} · ${bayi.ket.replace(/^Diperiksa /, "")}`, nada: bayi.nada });

  if (hamil) {
    const hb = terbaru(r, ["anc", "lab_t1"], "hb");
    if (hb) {
      const v = Number(hb.v);
      const nada = v < 7 ? "merah" : v < 11 ? "kuning" : "hijau";
      out.push({ id: "hb", label: "Hemoglobin", nilai: fmt(v), satuan: "g/dL", ket: `${v < 7 ? "Anemia berat" : v < 11 ? "Anemia" : "Normal"}${hb.tanggal ? ` · ${tampil(hb.tanggal)}` : ""}`, nada });
    }

    const rw = r.cari("riwayat").at(-1)?.data;
    if (rw?.gravida !== undefined) {
      out.push({ id: "gpa", label: "Riwayat kehamilan", nilai: `G${rw.gravida} P${rw.paritas ?? 0} A${rw.abortus ?? 0}`, ket: Number(rw.paritas ?? 0) === 0 ? "Belum pernah melahirkan" : undefined });
    }
  }

  const gol = r.ibu.profil.golongan_darah ?? terbaru(r, ["anc"], "golongan_darah")?.v ?? terbaru(r, ["lab_t1"], "golongan_darah_rhesus")?.v;
  if (gol && gol !== "belum tahu") {
    const rh = r.ibu.profil.rhesus;
    out.push({ id: "gol", label: "Golongan darah", nilai: `${gol}${rh && !String(gol).match(/[+-]/) ? String(rh) : ""}` });
  }

  return out;
}
