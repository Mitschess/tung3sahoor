"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Loader2, X } from "lucide-react";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { urlHalamanCetak } from "@/lib/kamus";
import { LogoMark } from "./logo";
import { cn } from "@/lib/util";
import type { Level } from "@/lib/types";

type Varian = "utama" | "kedua" | "hantu" | "bahaya" | "garis";
const VARIAN: Record<Varian, string> = {
  utama: "bg-brand text-white hover:bg-brand-ink",
  kedua: "bg-brand-soft text-brand-ink hover:bg-[#d6e8fd]",
  hantu: "text-ink hover:bg-black/5",
  bahaya: "bg-merah text-white hover:brightness-95",
  garis: "border border-line bg-surface text-ink hover:bg-bg",
};

export const Tombol = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { varian?: Varian; kecil?: boolean; memuat?: boolean }>(
  function Tombol({ className, varian = "utama", kecil, memuat, children, disabled, ...p }, ref) {
    return (
      <button
        ref={ref}
        disabled={disabled || memuat}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:bg-[#dfe4ea] disabled:text-[#9aa4b1] disabled:shadow-none",
          kecil ? "h-9 rounded-lg px-3.5 text-sm" : "h-12 rounded-xl px-5 text-[15px]",
          VARIAN[varian],
          className,
        )}
        {...p}
      >
        {memuat && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

export function TautanTombol({ href, varian = "utama", kecil, className, children }: { href: string; varian?: Varian; kecil?: boolean; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98]",
        kecil ? "h-9 rounded-lg px-3.5 text-sm" : "h-12 rounded-xl px-5 text-[15px]",
        VARIAN[varian],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Kartu({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl bg-surface p-5 shadow-[var(--shadow-kartu)]", className)} {...p}>
      {children}
    </div>
  );
}

export function JudulBagian({ children, aksi, className }: { children: ReactNode; aksi?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <h2 className="text-[15px] font-bold tracking-tight text-ink">{children}</h2>
      {aksi}
    </div>
  );
}

const WARNA_LEVEL = {
  merah: "bg-merah-soft text-merah",
  kuning: "bg-kuning-soft text-kuning",
  hijau: "bg-hijau-soft text-hijau",
  netral: "bg-black/5 text-muted",
  brand: "bg-brand-soft text-brand-ink",
} as const;

export function Lencana({ warna = "netral", children, className }: { warna?: keyof typeof WARNA_LEVEL; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", WARNA_LEVEL[warna], className)}>{children}</span>;
}

export function TitikLevel({ level, className }: { level: Level | "hijau"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full",
        level === "merah" ? "bg-merah pulse-merah" : level === "kuning" ? "bg-kuning" : "bg-hijau",
        className,
      )}
      aria-hidden
    />
  );
}

export const LABEL_LEVEL = { merah: "Merah", kuning: "Kuning", hijau: "Hijau" } as const;

export function Masukan({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-[#9aa4b1] focus:border-brand focus:ring-4 focus:ring-brand/10",
        className,
      )}
      {...p}
    />
  );
}

export function Pilihan({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full appearance-none rounded-xl border border-line bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7686%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat px-4 pr-10 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10",
        className,
      )}
      {...p}
    >
      {children}
    </select>
  );
}

export function TautanBuku({ halaman, className, label }: { halaman: number; className?: string; label?: string }) {
  return (
    <a
      href={urlHalamanCetak(halaman)}
      target="_blank"
      rel="noreferrer"
      className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand hover:underline", className)}
      title="Buka halaman ini di PDF Buku KIA 2024"
    >
      <BookOpen className="size-3.5" />
      {label ?? `Buku KIA hlm. ${halaman}`}
    </a>
  );
}

export function Kosong({ ikon, judul, teks, aksi }: { ikon?: ReactNode; judul: string; teks?: string; aksi?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface px-6 py-10 text-center shadow-[var(--shadow-kartu)]">
      {ikon && <div className="mb-1 text-muted">{ikon}</div>}
      <p className="font-semibold">{judul}</p>
      {teks && <p className="max-w-sm text-sm text-muted">{teks}</p>}
      {aksi && <div className="mt-2">{aksi}</div>}
    </div>
  );
}

/** Layar memuat bergaya splash: logo di tengah. */
export function Memuat({ penuh }: { penuh?: boolean }) {
  return (
    <div role="status" aria-label="Memuat" className={cn("flex items-center justify-center", penuh ? "min-h-dvh" : "min-h-[50dvh]")}>
      <LogoMark className="size-14 animate-pulse" />
    </div>
  );
}

export function Modal({ buka, setBuka, judul, deskripsi, children, lebar = "max-w-lg", tanpaTutup }: { buka: boolean; setBuka: (b: boolean) => void; judul: string; deskripsi?: string; children: ReactNode; lebar?: string; tanpaTutup?: boolean }) {
  return (
    <Dialog.Root open={buka} onOpenChange={(b) => (tanpaTutup && !b ? undefined : setBuka(b))}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-[1.75rem] bg-surface p-6 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
            lebar,
          )}
        >
          <div className="mx-auto -mt-1 mb-4 h-1.5 w-12 rounded-full bg-line sm:hidden" aria-hidden />
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold">{judul}</Dialog.Title>
              {deskripsi ? <Dialog.Description className="mt-0.5 text-sm text-muted">{deskripsi}</Dialog.Description> : <Dialog.Description className="sr-only">{judul}</Dialog.Description>}
            </div>
            {!tanpaTutup && (
              <Dialog.Close className="rounded-full p-1.5 text-muted hover:bg-black/5" aria-label="Tutup">
                <X className="size-5" />
              </Dialog.Close>
            )}
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Tab<T extends string>({ nilai, setNilai, pilihan, className }: { nilai: T; setNilai: (v: T) => void; pilihan: { nilai: T; label: ReactNode }[]; className?: string }) {
  return (
    <div role="tablist" className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-black/[0.04] p-1", className)}>
      {pilihan.map((p) => (
        <button
          key={p.nilai}
          role="tab"
          aria-selected={nilai === p.nilai}
          onClick={() => setNilai(p.nilai)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
            nilai === p.nilai ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function Baris({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 border-b border-line/70 py-2 text-sm last:border-0", className)}>
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{children}</span>
    </div>
  );
}
