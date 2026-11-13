"use client";

import { Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BarisIbu, KotakDaftar, type Alasan } from "@/components/baris-ibu";
import { LABEL_PERAN } from "@/lib/akses";
import { useDaftarRingkasan, useSekarang, type Ringkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { cn, namaDepan } from "@/lib/util";

const tgl = (d: unknown) => new Date(String(d)).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

/**
 * Beranda petugas: status wilayah, lalu satu daftar kerja untuk hari ini.
 * Tiap ibu muncul sekali; semua alasannya (tanda bahaya, terusan kader, rujukan, jatuh tempo dokter) ditulis di barisnya.
 */
export default function BerandaStaf() {
  const u = usePengguna()!;
  const rs = useDaftarRingkasan();
  const now = useSekarang();
  const catatan = useStore((s) => s.catatan);
  const draf = useStore((s) => s.draf);

  const jumlah = (w: Ringkasan["warna"]) => rs.filter((r) => r.warna === w).length;
  const salam = now.getHours() < 11 ? "Selamat pagi" : now.getHours() < 15 ? "Selamat siang" : now.getHours() < 18 ? "Selamat sore" : "Selamat malam";

  // Daftar kerja: rs sudah urut dari yang paling mendesak, jadi urutan itu dipertahankan.
  const kerja: { r: Ringkasan; alasan: Alasan[] }[] = [];
  for (const r of rs) {
    const alasan: Alasan[] = [];
    const merah = r.peringatan.filter((p) => p.level === "merah");
    if (merah.length) alasan.push({ teks: merah[0].judul, level: "merah", lain: r.peringatan.length - 1 });

    if (u.peran === "bidan") {
      // Tindak lanjut kader yang gagal (ibu menolak atau tidak bisa dihubungi) diteruskan ke bidan.
      for (const c of catatan) {
        if (c.tabel === "tindak_lanjut" && c.ibuId === r.ibu.id && c.data.diteruskan_ke && r.peringatan.some((p) => p.id === c.data.peringatan_id)) {
          alasan.push({ teks: `Diteruskan kader: ${c.data.hasil}${c.data.catatan ? ` — ${c.data.catatan}` : ""}` });
        }
      }
    }
    if (u.peran === "dokter") {
      for (const k of r.jadwal) {
        if (k.oleh === "Dokter" && (k.status === "sekarang" || k.status === "terlambat")) alasan.push({ teks: `${k.nama} ${k.status === "terlambat" ? "terlambat" : "jatuh tempo"}`, level: k.status === "terlambat" ? "kuning" : undefined });
      }
    }
    if (u.peran === "bidan" || u.peran === "dokter") {
      for (const c of r.cari("rujukan")) {
        if (!c.data.tanggal_balik) alasan.push({ teks: `Menunggu rujukan balik dari ${c.data.tujuan}, dirujuk ${tgl(c.data.tanggal_rujuk)}` });
      }
    }
    if (alasan.length) kerja.push({ r, alasan });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} · {LABEL_PERAN[u.peran]}, {u.posyandu ? `Posyandu ${u.posyandu.join(" & ")}` : "seluruh wilayah puskesmas"}
        </p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">
          {salam}, {u.peran === "dokter" ? u.nama : namaDepan(u.nama.replace(/^Bidan\s+/, ""))}
        </h1>
      </div>

      <StatusWilayah merah={jumlah("merah")} kuning={jumlah("kuning")} hijau={jumlah("hijau")} />

      {draf.length > 0 && (
        <Link href="/app/foto" className="flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-ink transition hover:brightness-[0.98]">
          <Camera className="size-5 shrink-0 text-brand" />
          <p className="min-w-0 flex-1">
            <b>{draf.length} foto Buku KIA menunggu dicek.</b> Data belum tersimpan sebelum dikonfirmasi.
          </p>
          <ChevronRight className="size-4 shrink-0" />
        </Link>
      )}

      <section>
        <h2 className="mb-2.5 px-1 text-[15px] font-bold tracking-tight">
          Perlu tindakan hari ini
          {kerja.length > 0 && <span className="ml-1.5 font-semibold text-muted">{kerja.length} ibu</span>}
        </h2>
        {kerja.length === 0 ? (
          <p className="rounded-2xl bg-surface px-4 py-3.5 text-sm text-muted shadow-[var(--shadow-kartu)]">Tidak ada yang perlu ditindaklanjuti hari ini. Tidak ada ibu berstatus Merah di wilayah Anda.</p>
        ) : (
          <KotakDaftar>
            {kerja.map(({ r, alasan }) => (
              <BarisIbu key={r.ibu.id} r={r} alasan={alasan} level={false} />
            ))}
          </KotakDaftar>
        )}
      </section>
    </div>
  );
}

const BAGIAN_STATUS = [
  { kunci: "merah", label: "Merah", arti: "Hubungi hari ini", warna: "bg-merah" },
  { kunci: "kuning", label: "Kuning", arti: "Cek saat kunjungan", warna: "bg-kuning" },
  { kunci: "hijau", label: "Hijau", arti: "Sesuai jadwal", warna: "bg-hijau" },
] as const;

/**
 * Status seluruh ibu di wilayah dalam satu kartu: garis proporsi memperlihatkan sebarannya,
 * dan tiap status di bawahnya membuka daftar ibu dengan saringan itu.
 */
function StatusWilayah(p: { merah: number; kuning: number; hijau: number }) {
  const total = p.merah + p.kuning + p.hijau;
  return (
    <section aria-label="Status ibu di wilayah Anda" className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)] sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-muted">
          <span className="text-ink">{total} ibu</span> di wilayah Anda
        </h2>
        <Link href="/app/ibu" className="shrink-0 text-sm font-semibold text-brand hover:underline">
          Lihat daftar
        </Link>
      </div>
      {total > 0 && (
        <div className="mt-3 flex h-2 gap-1" aria-hidden>
          {BAGIAN_STATUS.filter((b) => p[b.kunci] > 0).map((b) => (
            <span key={b.kunci} className={cn("rounded-full", b.warna)} style={{ flexGrow: p[b.kunci] }} />
          ))}
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 divide-x divide-line">
        {BAGIAN_STATUS.map((b) => (
          <Link key={b.kunci} href={`/app/ibu?status=${b.kunci}`} className="group min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted sm:text-sm">
              <span className={cn("size-2 shrink-0 rounded-full", b.warna)} aria-hidden />
              {b.label}
            </span>
            <span className="mt-0.5 block text-[28px] font-extrabold leading-none tracking-tight tabular-nums">{p[b.kunci]}</span>
            <span className="mt-1 block text-xs leading-snug text-muted group-hover:text-brand">{b.arti}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
