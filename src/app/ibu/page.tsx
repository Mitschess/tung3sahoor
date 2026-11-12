"use client";

import { AlertOctagon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Ilustrasi } from "@/components/ilustrasi";
import { TombolSos } from "@/components/sos";
import { DaftarJadwal, KartuTahap } from "@/components/tahap";
import { Memuat, TitikLevel } from "@/components/ui";
import { useRingkasan, useSekarang } from "@/lib/hooks";
import { hitungStatus, type StatusKesehatan } from "@/lib/status-ibu";
import { usePengguna } from "@/lib/store";
import { tugasHariIni } from "@/lib/tugas";
import { cn, namaDepan } from "@/lib/util";

const JUDUL = "text-[17px] font-bold";

export default function BerandaIbu() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const now = useSekarang();
  if (!r) return <Memuat />;

  const tugas = tugasHariIni(r, now);
  const merah = r.peringatan.filter((p) => p.level === "merah");
  const status = hitungStatus(r);

  return (
    <div className="space-y-5 px-4 pt-5">
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold leading-tight">Halo, Bu {namaDepan(r.ibu.profil.nama)}</p>
          <p className="truncate text-sm text-muted">Posyandu {String(r.ibu.profil.wilayah_posyandu)}</p>
        </div>
        <TombolSos />
      </header>

      <KartuTahap t={r.tahap} href="/ibu/hasil" />

      {merah.length > 0 && (
        <Link href="/ibu/tanda-bahaya" className="flex items-center gap-3 rounded-2xl bg-merah-soft p-4 ring-1 ring-merah/20">
          <AlertOctagon className="size-6 shrink-0 text-merah" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold text-merah">Perlu diperiksa bidan hari ini</p>
            <p className="text-ink/75">{merah.map((m) => m.judul).join(" · ")}</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-merah" />
        </Link>
      )}

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
        <h2 className={JUDUL}>Hari ini</h2>
        {tugas.length === 0 ? (
          <div className="flex items-center gap-3 pt-3">
            <Ilustrasi nama="tanaman" className="size-14 shrink-0" />
            <p className="text-sm text-muted">
              <b className="block text-[15px] text-ink">Tidak ada tugas hari ini</b>
              Tetap minum tablet tambah darah ya, Bu.
            </p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {tugas.map((t) => (
              <li key={t.id}>
                <Link href={t.href} className="flex items-center gap-3 py-3">
                  <TitikLevel level={t.nada === "kuning" ? "kuning" : "hijau"} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{t.judul}</span>
                    <span className="block text-sm text-muted">{t.teks}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {status.length > 0 && (
        <section>
          <h2 className={cn(JUDUL, "mb-3")}>Hasil periksa terakhir</h2>
          <div className="grid grid-cols-2 gap-3">
            {status.map((s) => (
              <KartuStatus key={s.id} s={s} />
            ))}
          </div>
        </section>
      )}

      {r.jadwal.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={JUDUL}>Jadwal periksa</h2>
            <Link href="/ibu/hasil" className="text-[15px] font-semibold text-brand">
              Semua
            </Link>
          </div>
          <DaftarJadwal js={r.jadwal} ringkas />
        </section>
      )}

      <p className="px-2 pb-2 text-center text-xs text-muted">MOMCARE tidak menggantikan Buku KIA dan pemeriksaan bidan. Bila ada tanda bahaya, segera ke fasilitas kesehatan terdekat.</p>
    </div>
  );
}

const WARNA_NADA: Record<StatusKesehatan["nada"], string> = {
  merah: "bg-merah-soft text-merah",
  kuning: "bg-kuning-soft text-kuning",
  hijau: "bg-hijau-soft text-hijau",
};

function KartuStatus({ s }: { s: StatusKesehatan }) {
  return (
    <Link href={s.href} className="flex flex-col rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)] transition active:scale-[0.99]">
      <p className="text-sm font-semibold text-muted">{s.judul}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">
        {s.nilai} <span className="text-sm font-semibold text-muted">{s.satuan}</span>
      </p>
      <div className="mt-2">
        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", WARNA_NADA[s.nada])}>{s.label}</span>
        <p className="mt-1 text-xs text-muted">{s.ket}</p>
      </div>
    </Link>
  );
}
