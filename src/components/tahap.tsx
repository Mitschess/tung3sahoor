"use client";

import { ArrowRight, Baby } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { Kunjungan } from "@/lib/jadwal";
import type { Tahap } from "@/lib/tahap";
import { cn } from "@/lib/util";
import type { NamaGambar } from "@/data/gambar-kia";
import { GambarKia } from "./gambar-kia";

const BUAH: { m: number; nama: string }[] = [
  { m: 4, nama: "biji beras" },
  { m: 12, nama: "jeruk nipis" },
  { m: 16, nama: "apel" },
  { m: 24, nama: "jagung" },
  { m: 30, nama: "pepaya" },
  { m: 99, nama: "semangka" },
];

/** Perbandingan ukuran bayi sesuai Buku KIA hlm. 4–19. */
export function ukuranBayi(minggu: number) {
  return BUAH.find((b) => minggu <= b.m) ?? BUAH[BUAH.length - 1];
}

/** Gambaran janin dari Buku KIA hlm. 4, yang menggambar janin pada usia 1, 3, 6, dan 9 bulan. */
function gambarJanin(minggu: number): NamaGambar {
  if (minggu <= 6) return "janin-1";
  if (minggu <= 16) return "janin-3";
  if (minggu <= 28) return "janin-6";
  return "janin-9";
}

/** Penanda pada garis kemajuan: kehamilan 40 minggu (T2 mulai minggu 13, T3 minggu 25) atau nifas 42 hari. */
const PENANDA_HAMIL = [
  { label: "T1", posisi: 0 },
  { label: "T2", posisi: 13 / 40 },
  { label: "T3", posisi: 25 / 40 },
];
const PENANDA_NIFAS = [
  { label: "Lahir", posisi: 0 },
  { label: "Hari 7", posisi: 7 / 42 },
  { label: "Hari 28", posisi: 28 / 42 },
];

export function KartuTahap({ t, href }: { t: Tahap; href?: string }) {
  const hamil = t.set === "hamil";
  const nifas = t.set === "nifas";
  const buah = hamil ? ukuranBayi(t.ukMinggu ?? 0) : null;
  const sisaHari = hamil && t.hpl ? Math.max(0, 280 - (t.ukHari ?? 0)) : null;
  const tglHpl = t.hpl?.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const penanda = hamil ? PENANDA_HAMIL : nifas ? PENANDA_NIFAS : null;
  const isi = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{hamil ? "Usia kehamilan" : nifas ? "Masa nifas" : "Tahap Ibu"}</p>
        {href && <ArrowRight className="size-5 text-brand" />}
      </div>
      <div className="mt-1 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          {hamil ? (
            <p className="flex flex-wrap items-baseline gap-x-1.5 leading-none">
              <span className="text-[40px] font-extrabold tracking-tight">{t.ukMinggu}</span>
              <span className="text-lg font-bold">minggu</span>
              {!!t.ukSisaHari && <span className="text-base font-semibold text-muted">{t.ukSisaHari} hari</span>}
            </p>
          ) : nifas ? (
            <p className="flex flex-wrap items-baseline gap-x-1.5 leading-none">
              <span className="text-lg font-bold">
                Hari ke-<span className="text-[40px] font-extrabold tracking-tight">{t.hariNifas}</span>
              </span>
              <span className="text-base font-semibold text-muted">dari 42</span>
            </p>
          ) : (
            <p className="text-2xl font-extrabold leading-tight tracking-tight">{t.label}</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-semibold">
            {hamil && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand-ink">Trimester {t.trimester}</span>}
            {hamil && tglHpl && (
              <span className="rounded-full bg-rose-soft px-2.5 py-1 text-rose">
                HPL {tglHpl}
                {t.sumberHpl === "USG T1" && " (USG)"}
              </span>
            )}
            {nifas && <span className="rounded-full bg-rose-soft px-2.5 py-1 text-rose">Bayi berumur {t.umurBayiHari} hari</span>}
            {!hamil && !nifas && <span className="font-medium text-muted">{t.sublabel}</span>}
          </div>
        </div>
        {hamil && (
          <div className="size-[76px] shrink-0 overflow-hidden rounded-full bg-[#fbebee]">
            <GambarKia nama={gambarJanin(t.ukMinggu ?? 0)} alt="Gambaran janin di dalam kandungan" sizes="76px" className="h-full w-full object-cover" />
          </div>
        )}
        {nifas && (
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-rose-soft text-rose">
            <Baby className="size-7" />
          </div>
        )}
      </div>
      {buah && (
        <p className="mt-3 text-sm text-ink/75">
          Bayi Ibu kira-kira sebesar <b className="font-semibold text-ink">{buah.nama}</b>
          {sisaHari !== null && <>, {sisaHari ? `${sisaHari} hari lagi menuju HPL` : "sudah masuk HPL"}.</>}
        </p>
      )}
      {nifas && <p className="mt-3 text-sm text-ink/75">Masa nifas berlangsung sampai hari ke-42 setelah melahirkan.</p>}
      {penanda && (
        <div className="mt-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-brand-soft">
            <motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${Math.round(t.progres * 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            {penanda.slice(1).map((p) => (
              <span key={p.label} className="absolute inset-y-0 w-0.5 bg-surface" style={{ left: `${p.posisi * 100}%` }} aria-hidden />
            ))}
          </div>
          <div className="relative mt-1.5 h-4 text-[11px] font-medium text-muted">
            {penanda.map((p) => (
              <span key={p.label} className="absolute top-0" style={{ left: `${p.posisi * 100}%` }}>
                {p.label}
              </span>
            ))}
            <span className="absolute right-0 top-0">{hamil ? "HPL" : "Hari 42"}</span>
          </div>
        </div>
      )}
    </>
  );
  const kelas = "block rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]";
  return href ? (
    <Link href={href} className={cn(kelas, "transition active:scale-[0.99]")}>
      {isi}
    </Link>
  ) : (
    <div className={kelas}>{isi}</div>
  );
}

const TITIK: Record<Kunjungan["status"], string> = {
  selesai: "size-3 bg-hijau ring-4 ring-surface",
  sekarang: "size-3.5 bg-brand ring-4 ring-brand-soft",
  terlambat: "size-3 bg-kuning ring-4 ring-surface",
  "akan datang": "size-3 border-2 border-[#c3ccd8] bg-surface ring-4 ring-surface",
};

const tgl = (d: Date | string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

/** Jadwal kunjungan sebagai garis waktu: titik hijau sudah, biru sekarang, kuning terlambat, kosong nanti. */
export function DaftarJadwal({ js, ringkas }: { js: Kunjungan[]; ringkas?: boolean }) {
  const tampil = ringkas ? js.filter((k) => k.status !== "selesai").slice(0, 4) : js;
  return (
    <ol className="relative rounded-2xl bg-surface px-4 py-1.5 shadow-[var(--shadow-kartu)]">
      {tampil.length > 1 && <span className="absolute bottom-7 left-[22px] top-7 w-0.5 rounded-full bg-line" aria-hidden />}
      {tampil.map((k) => (
        <li key={k.kode} className="relative flex items-start gap-3.5 py-2.5">
          <span className="grid h-5 w-3.5 shrink-0 place-items-center">
            <span className={cn("block rounded-full", TITIK[k.status])} />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-[15px] font-semibold leading-snug", k.status === "selesai" && "text-ink/60")}>{k.nama}</span>
            <span className="block text-xs text-muted">
              {k.status === "selesai" && k.tanggalSelesai ? `Selesai ${tgl(k.tanggalSelesai)}` : `${tgl(k.mulai)} – ${tgl(k.selesai)}`} · {k.oleh}
              {!ringkas && ` · hlm. ${k.halamanCetak}`}
            </span>
          </span>
          {k.status === "sekarang" && <span className="mt-0.5 shrink-0 rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">Sekarang</span>}
          {k.status === "terlambat" && <span className="mt-0.5 shrink-0 text-xs font-bold text-kuning">Terlambat</span>}
        </li>
      ))}
    </ol>
  );
}
