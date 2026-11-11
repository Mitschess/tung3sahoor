"use client";

import { Baby, CalendarCheck2, CalendarClock, CalendarX2, Clock3, HeartPulse, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import type { Kunjungan } from "@/lib/jadwal";
import type { Tahap } from "@/lib/tahap";
import { cn } from "@/lib/util";
import { Lencana, TautanBuku } from "./ui";

const BUAH = [
  { m: 4, nama: "biji beras", e: "🌾" },
  { m: 12, nama: "jeruk nipis", e: "🍋" },
  { m: 16, nama: "apel", e: "🍎" },
  { m: 24, nama: "jagung", e: "🌽" },
  { m: 30, nama: "pepaya", e: "🥭" },
  { m: 99, nama: "semangka", e: "🍉" },
];

/** Perbandingan ukuran bayi sesuai Buku KIA hlm. 4–19. */
export function ukuranBayi(minggu: number) {
  return BUAH.find((b) => minggu <= b.m) ?? BUAH[BUAH.length - 1];
}

export function KartuTahap({ t, nama }: { t: Tahap; nama?: string }) {
  const hamil = t.set === "hamil";
  const buah = hamil ? ukuranBayi(t.ukMinggu ?? 0) : null;
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#6d3fd8] via-[#7b4ae0] to-[#e5537a] p-5 text-white shadow-[0_20px_40px_-20px_#6d3fd8]">
      <div className="aurora-blob pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/25" />
      <div className="aurora-blob pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[#ffb3c7]/30 [animation-delay:-6s]" />
      <div className="relative">
        <p className="text-sm font-medium text-white/80">{nama ? `Halo, Bu ${nama.split(" ")[0]} 👋` : "Aku sedang di mana?"}</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">{t.label}</h1>
            <p className="mt-1 text-sm text-white/85">{t.sublabel}</p>
          </div>
          {buah && (
            <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur">
              <span className="text-3xl leading-none">{buah.e}</span>
              <span className="mt-1 text-[11px] font-semibold leading-tight">sebesar<br />{buah.nama}</span>
            </div>
          )}
          {t.set === "nifas" && (
            <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur">
              <Baby className="size-7" />
              <span className="mt-1 text-[11px] font-semibold">{t.umurBayiHari} hari</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${Math.round(t.progres * 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] font-medium text-white/80">
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
      </div>
    </div>
  );
}

const IKON_STATUS = {
  selesai: { ikon: CalendarCheck2, warna: "text-hijau bg-hijau-soft", label: "Selesai" },
  sekarang: { ikon: Clock3, warna: "text-brand-ink bg-brand-soft", label: "Jatuh tempo" },
  "akan datang": { ikon: CalendarClock, warna: "text-muted bg-black/5", label: "Akan datang" },
  terlambat: { ikon: CalendarX2, warna: "text-kuning bg-kuning-soft", label: "Terlambat" },
} as const;

export function DaftarJadwal({ js, ringkas }: { js: Kunjungan[]; ringkas?: boolean }) {
  const tampil = ringkas ? js.filter((k) => k.status !== "selesai").slice(0, 4) : js;
  return (
    <ol className="space-y-2">
      {tampil.map((k) => {
        const s = IKON_STATUS[k.status];
        const Ikon = k.oleh === "Dokter" ? Stethoscope : k.untuk === "bayi" ? Baby : k.jenis === "kf" ? HeartPulse : s.ikon;
        return (
          <li key={k.kode} className={cn("flex items-center gap-3 rounded-2xl border border-line bg-surface p-3", k.status === "sekarang" && "border-brand/40 ring-2 ring-brand/10")}>
            <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl", s.warna)}>
              <Ikon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{k.nama}</p>
              <p className="text-xs text-muted">
                {k.status === "selesai" && k.tanggalSelesai
                  ? `Selesai ${new Date(k.tanggalSelesai).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
                  : `${k.mulai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – ${k.selesai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`}{" "}
                · {k.oleh}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Lencana warna={k.status === "selesai" ? "hijau" : k.status === "terlambat" ? "kuning" : k.status === "sekarang" ? "brand" : "netral"}>{s.label}</Lencana>
              {!ringkas && <TautanBuku halaman={k.halamanCetak} label={`hlm. ${k.halamanCetak}`} />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
