"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/util";

const DURASI = 0.62;
const LENTUR = [0.32, 0.08, 0.22, 1] as const;

/** Balik halaman seperti buku: halaman lama berputar pada tepi kiri, halaman baru sudah menunggu di bawahnya. */
const BALIK: Variants = {
  masuk: (arah: number) => (arah > 0 ? { rotateY: 0, zIndex: 1 } : { rotateY: -105, zIndex: 3 }),
  tengah: { rotateY: 0, zIndex: 2, opacity: 1, pointerEvents: "auto", transition: { duration: DURASI, ease: LENTUR } },
  keluar: (arah: number) =>
    arah > 0
      ? { rotateY: -105, zIndex: 3, pointerEvents: "none", transition: { duration: DURASI, ease: LENTUR } }
      : { rotateY: 0, zIndex: 1, opacity: 0.999, pointerEvents: "none", transition: { duration: DURASI } },
};

/** Bayangan di atas halaman yang sedang dibalik. */
const BAYANGAN: Variants = {
  masuk: (arah: number) => ({ opacity: arah > 0 ? 0 : 0.5 }),
  tengah: { opacity: 0, transition: { duration: DURASI, ease: LENTUR } },
  keluar: (arah: number) => ({ opacity: arah > 0 ? 0.5 : 0, transition: { duration: DURASI, ease: LENTUR } }),
};

const PUDAR: Variants = {
  masuk: { opacity: 0 },
  tengah: { opacity: 1, zIndex: 2, transition: { duration: 0.2 } },
  keluar: { opacity: 0, zIndex: 1, transition: { duration: 0.2 } },
};

export interface FlipbookProps {
  jumlah: number;
  awal?: number;
  /** Isi tiap lembar; `ke(i)` untuk melompat dari dalam lembar (misalnya "Ulangi"). */
  render: (i: number, ke: (i: number) => void) => ReactNode;
  judul: string;
  label?: string;
  /** Kelas warna untuk label, segmen kemajuan, dan tombol Lanjut. */
  warna?: { teks: string; isi: string };
  onUbah?: (i: number) => void;
  onTutup: () => void;
}

export function Flipbook({ jumlah, awal = 0, render, judul, label, warna = { teks: "text-brand", isi: "bg-brand" }, onUbah, onTutup }: FlipbookProps) {
  const [[i, arah], setPosisi] = useState<[number, number]>([Math.min(Math.max(awal, 0), jumlah - 1), 1]);
  const kurangiGerak = useReducedMotion();

  const ke = useCallback(
    (tujuan: number) => {
      setPosisi(([lama]) => {
        const t = Math.min(Math.max(tujuan, 0), jumlah - 1);
        return t === lama ? [lama, 1] : [t, t > lama ? 1 : -1];
      });
    },
    [jumlah],
  );

  useEffect(() => {
    onUbah?.(i);
  }, [i, onUbah]);

  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ke(i + 1);
      else if (e.key === "ArrowLeft") ke(i - 1);
    };
    window.addEventListener("keydown", tombol);
    return () => window.removeEventListener("keydown", tombol);
  }, [i, ke]);

  const terakhir = i === jumlah - 1;

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 px-2 pt-2">
        <button type="button" onClick={onTutup} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-black/5" aria-label="Tutup buku">
          <ArrowLeft className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          {label && <p className={cn("truncate text-[11px] font-bold uppercase tracking-wider", warna.teks)}>{label}</p>}
          <h1 className="truncate text-[17px] font-bold leading-tight">{judul}</h1>
        </div>
        <span className="mr-2 shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-semibold tabular-nums shadow-[var(--shadow-kartu)]" aria-live="polite">
          {i + 1}/{jumlah}
        </span>
      </header>

      {jumlah <= 16 ? (
        <div className="flex gap-1 px-4 pt-3" aria-hidden>
          {Array.from({ length: jumlah }, (_, k) => (
            <button key={k} type="button" tabIndex={-1} onClick={() => ke(k)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.08]">
              <span className={cn("block h-full rounded-full transition-all duration-300", warna.isi, k <= i ? "w-full" : "w-0")} />
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 pt-3" aria-hidden>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
            <div className={cn("h-full rounded-full transition-all duration-300", warna.isi)} style={{ width: `${((i + 1) / jumlah) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 px-4 pb-3 pt-4">
        <div className="relative h-full [perspective:2200px]">
          {/* Tebal buku: lembar-lembar berikutnya mengintip di tepi kanan bawah. */}
          {!terakhir && (
            <>
              <div className="absolute inset-0 translate-x-[7px] translate-y-[7px] rounded-[26px] bg-[#e9eef5]" />
              <div className="absolute inset-0 translate-x-[3.5px] translate-y-[3.5px] rounded-[26px] bg-[#f3f6fa] shadow-sm" />
            </>
          )}
          <AnimatePresence initial={false} custom={arah}>
            <motion.article
              key={i}
              custom={arah}
              variants={kurangiGerak ? PUDAR : BALIK}
              initial="masuk"
              animate="tengah"
              exit="keluar"
              onPanEnd={(_, info) => {
                if (info.offset.x < -50 || info.velocity.x < -450) ke(i + 1);
                else if (info.offset.x > 50 || info.velocity.x > 450) ke(i - 1);
              }}
              style={{ transformOrigin: "left center", backfaceVisibility: "hidden", touchAction: "pan-y" }}
              className="absolute inset-0 overflow-hidden rounded-[26px] bg-surface shadow-[0_18px_40px_-20px_rgb(23_60_110/0.45),0_0_0_1px_rgb(23_60_110/0.05)]"
              aria-roledescription="lembar"
              aria-label={`Lembar ${i + 1} dari ${jumlah}`}
            >
              <div className="h-full overflow-y-auto overscroll-contain">{render(i, ke)}</div>
              {/* Lipatan tengah buku. */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/[0.06] to-transparent" />
              {!kurangiGerak && <motion.div variants={BAYANGAN} custom={arah} className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent" />}
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <footer className="flex items-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
        <button
          type="button"
          onClick={() => ke(i - 1)}
          disabled={i === 0}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-surface shadow-[var(--shadow-kartu)] transition active:scale-95 disabled:opacity-40"
          aria-label="Lembar sebelumnya"
        >
          <ChevronLeft className="size-6" />
        </button>
        <p className="flex-1 text-center text-xs leading-tight text-muted">{i === 0 ? "Geser halaman atau tekan Lanjut" : terakhir ? "Sudah selesai dibaca" : "Geser untuk membalik"}</p>
        <button
          type="button"
          onClick={() => (terakhir ? onTutup() : ke(i + 1))}
          className={cn("inline-flex h-14 shrink-0 items-center gap-1.5 rounded-full px-6 text-[17px] font-semibold text-white shadow-[0_10px_22px_-12px_rgb(0_0_0/0.5)] transition active:scale-95", warna.isi)}
        >
          {terakhir ? (
            <>
              Selesai
            </>
          ) : (
            <>
              {i === 0 ? "Buka" : "Lanjut"} <ChevronRight className="size-5" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
