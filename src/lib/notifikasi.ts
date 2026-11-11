/** Notifikasi untuk ibu: peringatan dari hasil periksa/pemantauan + jadwal yang jatuh tempo atau terlewat. */
import type { Ringkasan } from "./hooks";
import { parse, selisihHari } from "./tanggal";

export interface Notifikasi {
  id: string;
  jenis: "peringatan" | "jadwal";
  judul: string;
  teks: string;
  nada: "merah" | "kuning" | "brand";
  href: string;
}

const tgl = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });

export function daftarNotifikasi(r: Ringkasan, now: Date): Notifikasi[] {
  const out: Notifikasi[] = [];
  // r.peringatan sudah disaring per peran: data sensitif tidak pernah tampil di akun ibu.
  for (const p of r.peringatan) {
    out.push({
      id: p.id,
      jenis: "peringatan",
      judul: p.level === "merah" ? `Segera periksa: ${p.judul}` : p.judul,
      teks: p.level === "merah" ? "Sudah masuk daftar tugas kader & bidan. Datang ke Puskesmas hari ini." : "Ceritakan ke bidan saat periksa berikutnya.",
      nada: p.level,
      href: "/ibu/tanda-bahaya",
    });
  }
  const tk = parse(r.cari("anc").at(-1)?.data.tanggal_kembali);
  if (tk && r.tahap.set === "hamil") {
    const d = selisihHari(tk, now);
    if (d >= -2 && d <= 3) out.push({ id: "kembali", jenis: "jadwal", judul: d > 0 ? `Periksa ${d} hari lagi` : d === 0 ? "Hari ini jadwal periksa" : "Ibu belum datang periksa", teks: `Tanggal kembali dari bidan: ${tgl(tk)}. Bawa Buku KIA.`, nada: d < 0 ? "kuning" : "brand", href: "/ibu/hasil" });
  }
  for (const k of r.jadwal) {
    if (k.status === "terlambat") out.push({ id: `telat:${k.kode}`, jenis: "jadwal", judul: `${k.nama} terlewat`, teks: `Seharusnya sampai ${tgl(k.selesai)}. Hubungi kader atau bidan untuk jadwal ulang.`, nada: "kuning", href: "/ibu/hasil" });
    else if (k.status === "sekarang") out.push({ id: `jadwal:${k.kode}`, jenis: "jadwal", judul: `${k.nama} sudah bisa dilakukan`, teks: `Bisa dilakukan sampai ${tgl(k.selesai)} · ${k.oleh}.`, nada: "brand", href: "/ibu/hasil" });
  }
  const urut = { merah: 0, kuning: 1, brand: 2 } as const;
  return out.sort((a, b) => urut[a.nada] - urut[b.nada]);
}
