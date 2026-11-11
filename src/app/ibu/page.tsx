"use client";

import { AlertOctagon, ArrowRight, Bell, ChevronRight, LayoutGrid, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GambarKia } from "@/components/gambar-kia";
import { Ilustrasi } from "@/components/ilustrasi";
import { TombolSos } from "@/components/sos";
import { DaftarJadwal, KartuTahap } from "@/components/tahap";
import { Memuat, TitikLevel } from "@/components/ui";
import { useRingkasan, useSekarang, type Ringkasan } from "@/lib/hooks";
import { daftarNotifikasi } from "@/lib/notifikasi";
import { hitungStatus, type StatusKesehatan } from "@/lib/status-ibu";
import { usePengguna, useStore } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";
import { tugasHariIni } from "@/lib/tugas";
import { cn } from "@/lib/util";
import type { NamaGambar } from "@/data/gambar-kia";

export default function BerandaIbu() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const now = useSekarang();
  const tersembunyi = useStore((s) => s.statusTersembunyi);
  if (!r) return <Memuat />;

  const tugas = tugasHariIni(r, now);
  const merah = r.peringatan.filter((p) => p.level === "merah");
  const notif = daftarNotifikasi(r, now).length;
  const status = hitungStatus(r).filter((s) => !tersembunyi.includes(s.id));

  return (
    <div className="space-y-5 px-4 pt-5">
      <Kepala r={r} notif={notif} />

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
        <h2 className="text-[17px] font-bold">Tindak Lanjut Hari Ini</h2>
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
                  <TitikLevel level={t.nada === "merah" ? "merah" : t.nada === "kuning" ? "kuning" : "hijau"} />
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

      <Banner set={r.tahap.set} />

      {status.length > 0 || tersembunyi.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[19px] font-bold">Status Kesehatan Ibu</h2>
            <Link href="/ibu/atur-status" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand">
              <LayoutGrid className="size-4" /> Atur
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {status.map((s) => (
              <KartuStatus key={s.id} s={s} />
            ))}
          </div>
        </section>
      ) : null}

      {r.jadwal.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[19px] font-bold">Jadwal Periksa</h2>
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

function Kepala({ r, notif }: { r: Ringkasan; notif: number }) {
  const nama = String(r.ibu.profil.nama);
  return (
    <header className="flex items-center gap-3">
      <Link href="/ibu/profil" className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-brand ring-1 ring-brand/25" aria-label="Profil">
        <UserRound className="size-7" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[17px] leading-tight">
          Halo, <b className="uppercase">{nama}</b>
        </p>
        <p className="truncate text-xs text-muted">Posyandu {String(r.ibu.profil.wilayah_posyandu)}</p>
      </div>
      <TombolSos />
      <Link href="/ibu/notifikasi" className="relative grid size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-black/5" aria-label={`Notifikasi${notif ? `, ${notif} baru` : ""}`}>
        <Bell className="size-6" />
        {notif > 0 && <span className="absolute right-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-merah px-1 text-[10px] font-bold leading-[18px] text-white">{notif}</span>}
      </Link>
    </header>
  );
}

const WARNA_NADA: Record<StatusKesehatan["nada"], string> = {
  merah: "bg-merah-soft text-merah",
  kuning: "bg-kuning-soft text-kuning",
  hijau: "bg-hijau-soft text-hijau",
  netral: "bg-bg text-muted",
};

function KartuStatus({ s }: { s: StatusKesehatan }) {
  return (
    <Link href={s.href} className={cn("flex min-h-40 flex-col rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)] transition active:scale-[0.99]", s.lebar && "col-span-2 min-h-0")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] font-semibold leading-snug">{s.judul}</p>
        <ArrowRight className="size-5 shrink-0 text-brand" />
      </div>
      {s.nilai ? (
        <div className={cn("mt-auto pt-3", s.lebar && "flex items-end justify-between gap-3")}>
          <p className="text-2xl font-extrabold tracking-tight">
            {s.nilai} {s.satuan && <span className="text-sm font-semibold text-muted">{s.satuan}</span>}
          </p>
          <div className={cn(!s.lebar && "mt-1.5")}>
            {s.label && <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", WARNA_NADA[s.nada])}>{s.label}</span>}
            <p className="mt-1 text-xs text-muted">{s.ket}</p>
          </div>
        </div>
      ) : (
        <div className={cn("mt-auto flex flex-col pt-3 text-center", s.lebar && "flex-row items-center justify-between text-left")}>
          <p className="line-clamp-2 text-xs text-muted">{s.ket}</p>
          {s.aksi && (
            <span className="mt-3 inline-flex items-center justify-center gap-1 text-sm font-semibold text-brand">
              <Plus className="size-4" /> {s.aksi}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

const BANNER: Record<"hamil" | "nifas", { judul: string; sub: string; href: string; g: NamaGambar; latar: string }[]> = {
  hamil: [
    { judul: "Kenali tanda bahaya kehamilan", sub: "Lihat gambarnya di sini", href: "/ibu/tanda-bahaya", g: "tb2-pusing", latar: "from-[#fde8f1] to-[#fbd3e4]" },
    { judul: "Siapkan persalinan sejak dini", sub: "Ceklis P4K bersama suami", href: "/ibu/persiapan", g: "p4k", latar: "from-[#e3effe] to-[#cfe3fd]" },
    { judul: "Buku edukasi bergambar", sub: "Materi sesuai usia kehamilan", href: "/ibu/edukasi", g: "hamil-periksa", latar: "from-[#e0f6f3] to-[#c9eee8]" },
    { judul: "Cemas itu wajar, Bu", sub: "Kesehatan jiwa ibu hamil", href: "/ibu/edukasi/jiwa-hamil", g: "jiwa-hamil", latar: "from-[#efebfe] to-[#e0d8fd]" },
  ],
  nifas: [
    { judul: "Tanda bahaya ibu nifas & bayi", sub: "Lihat gambarnya di sini", href: "/ibu/tanda-bahaya", g: "tbb-demam", latar: "from-[#fde8f1] to-[#fbd3e4]" },
    { judul: "Menyusui: posisi & pelekatan", sub: "ASI saja sampai 6 bulan", href: "/ibu/edukasi/menyusui", g: "menyusui", latar: "from-[#e3f6ee] to-[#cdeedd]" },
    { judul: "Baby blues itu nyata", sub: "Ceritakan perasaan Ibu", href: "/ibu/edukasi/baby-blues", g: "depresi", latar: "from-[#efebfe] to-[#e0d8fd]" },
    { judul: "Pilih KB setelah melahirkan", sub: "Jarak kehamilan sehat", href: "/ibu/edukasi/kb", g: "kb", latar: "from-[#e3effe] to-[#cfe3fd]" },
  ],
};

function Banner({ set }: { set: SetMenu }) {
  const [aktif, setAktif] = useState(0);
  if (set !== "hamil" && set !== "nifas") return null;
  const isi = BANNER[set];
  return (
    <section aria-label="Info kesehatan">
      <div
        onScroll={(e) => {
          const el = e.currentTarget;
          const lebar = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
          setAktif(Math.round(el.scrollLeft / (lebar + 12)));
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4"
      >
        {isi.map((b) => (
          <Link key={b.href} href={b.href} className={cn("flex h-28 w-[86%] shrink-0 snap-start items-stretch overflow-hidden rounded-2xl bg-gradient-to-r", b.latar)}>
            <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pl-4 pr-2">
              <span className="block text-[17px] font-bold leading-snug text-ink">{b.judul}</span>
              <span className="mt-0.5 text-xs text-ink/60">{b.sub}</span>
            </span>
            <span className="relative w-[38%] shrink-0 overflow-hidden" aria-hidden>
              <GambarKia nama={b.g} alt="" sizes="140px" className="absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_28%)]" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5" aria-hidden>
        {isi.map((b, i) => (
          <span key={b.href} className={cn("h-1.5 rounded-full transition-all", i === aktif ? "w-6 bg-brand" : "w-1.5 bg-[#c9d3df]")} />
        ))}
      </div>
    </section>
  );
}
