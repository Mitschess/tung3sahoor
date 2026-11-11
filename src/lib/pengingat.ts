/** Pengingat kunjungan ke ibu & suami: H-2, H, H+2 dari "tanggal kembali", plus jendela kunjungan yang jatuh tempo. */
import type { Ringkasan } from "./hooks";
import { parse, selisihHari } from "./tanggal";

export interface Pengingat {
  id: string;
  r: Ringkasan;
  label: string;
  teks: string;
  mendesak: boolean;
}

export function daftarPengingat(rs: Ringkasan[], now: Date): Pengingat[] {
  const out: Pengingat[] = [];
  for (const r of rs) {
    const anc = r.cari("anc");
    const terakhirAnc = anc[anc.length - 1];
    const tk = parse(terakhirAnc?.data.tanggal_kembali);
    if (tk && r.tahap.set === "hamil") {
      const d = selisihHari(tk, now);
      if (d >= -2 && d <= 2) {
        const label = d > 0 ? `H-${d}` : d === 0 ? "Hari H" : `H+${-d}`;
        out.push({ id: `kembali:${r.ibu.id}`, r, label, teks: `Tanggal kembali ${tk.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}${d < 0 ? " — belum datang" : ""}`, mendesak: d <= 0 });
        continue;
      }
    }
    const k = r.berikut;
    if (k && (k.status === "sekarang" || selisihHari(k.mulai, now) <= 3)) {
      out.push({ id: `jadwal:${r.ibu.id}:${k.kode}`, r, label: k.kode, teks: `${k.nama} · ${k.mulai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}–${k.selesai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`, mendesak: selisihHari(k.selesai, now) <= 2 });
    }
    for (const t of r.jadwal.filter((j) => j.status === "terlambat").slice(0, 1)) {
      out.push({ id: `telat:${r.ibu.id}:${t.kode}`, r, label: `${t.kode} terlambat`, teks: `${t.nama} terlewat sejak ${t.selesai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`, mendesak: true });
    }
  }
  return out.sort((a, b) => Number(b.mendesak) - Number(a.mendesak));
}
