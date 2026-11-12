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

export function KartuTahap({ t, href }: { t: Tahap; href?: string }) {
  const hamil = t.set === "hamil";
  const buah = hamil ? ukuranBayi(t.ukMinggu ?? 0) : null;
  const isi = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold">{hamil ? "Kehamilan Ibu" : t.set === "nifas" ? "Masa Nifas & Bayi" : "Tahap Ibu"}</p>
        {href && <ArrowRight className="size-5 text-brand" />}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-extrabold leading-tight tracking-tight">{t.label}</p>
          <p className="mt-0.5 text-sm text-muted">
            {t.sublabel}
            {buah && ` · bayi sebesar ${buah.nama}`}
          </p>
        </div>
        {hamil && (
          <div className="size-[72px] shrink-0 overflow-hidden rounded-full bg-[#fbebee]">
            <GambarKia nama={gambarJanin(t.ukMinggu ?? 0)} alt="Gambaran janin di dalam kandungan" sizes="72px" className="h-full w-full object-cover" />
          </div>
        )}
        {t.set === "nifas" && (
          <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-rose-soft text-rose">
            <Baby className="size-6" />
            <span className="text-[10px] font-bold">{t.umurBayiHari} hari</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-brand-soft">
          <motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${Math.round(t.progres * 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-medium text-muted">
          {hamil ? (
            <>
              <span>T1</span>
              <span>T2</span>
              <span>T3</span>
              <span>HPL{t.sumberHpl === "USG T1" ? " (USG)" : ""}</span>
            </>
          ) : (
            <>
              <span>Melahirkan</span>
              <span>KF2</span>
              <span>KF3</span>
              <span>Hari 42</span>
            </>
          )}
        </div>
      </div>
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
