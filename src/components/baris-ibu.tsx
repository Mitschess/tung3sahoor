"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Ringkasan } from "@/lib/hooks";
import type { Level } from "@/lib/types";
import { cn } from "@/lib/util";
import { LABEL_LEVEL, Lencana } from "./ui";

const TITIK = { merah: "bg-merah", kuning: "bg-kuning", hijau: "bg-hijau" } as const;

/** Kolom baris di layar lebar: ibu, hal yang perlu diperhatikan, status. Dipakai juga oleh kepala tabel. */
export const KOLOM_BARIS = "md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_6.5rem]";

/** Satu alasan ibu ini perlu diperhatikan. Tanpa `level`, titiknya abu-abu (bukan peringatan, mis. rujukan). */
export interface Alasan {
  teks: string;
  level?: Level;
  /** Jumlah peringatan lain yang tidak ditulis. */
  lain?: number;
}

/** Tahap singkat untuk daftar: "Hamil 34 mgg" atau "Nifas hari ke-6". */
export function tahapSingkat(r: Ringkasan): string {
  const t = r.tahap;
  if (t.set === "hamil") return `Hamil ${t.ukMinggu} mgg`;
  if (t.set === "nifas") return `Nifas hari ke-${t.hariNifas}`;
  return t.label;
}

/** Wadah daftar: satu kartu berisi baris-baris yang dipisah garis, seperti tabel. */
export function KotakDaftar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]", className)}>{children}</div>;
}

/**
 * Satu ibu sebagai baris daftar: siapa, tahapnya, dan hal yang perlu ditindaklanjuti.
 * Tanpa `alasan`, yang tampil adalah peringatan teratas ibu itu (atau kunjungan berikutnya).
 * `level` disembunyikan bila alasan di baris sudah menjelaskan statusnya.
 */
export function BarisIbu({ r, alasan, level = true }: { r: Ringkasan; alasan?: Alasan[]; level?: boolean }) {
  const atas = r.peringatan[0];
  const baris: Alasan[] = alasan ?? (atas ? [{ teks: atas.judul, level: atas.level, lain: r.peringatan.length - 1 }] : []);
  return (
    <Link
      href={`/app/ibu/${r.ibu.id}`}
      className={cn("group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 transition hover:bg-bg focus-visible:bg-bg focus-visible:outline-none", KOLOM_BARIS)}
    >
      <span className="min-w-0">
        <span className="block truncate font-bold leading-snug">{String(r.ibu.profil.nama)}</span>
        <span className="block truncate text-xs text-muted">
          {tahapSingkat(r)} · Posyandu {String(r.ibu.profil.wilayah_posyandu)}
        </span>
      </span>
      {/* Di HP alasan boleh dua baris supaya tidak terpotong; di layar lebar satu baris seperti tabel. */}
      <span className="col-start-1 row-start-2 min-w-0 space-y-1 text-sm leading-snug md:col-start-2 md:row-start-1">
        {baris.length === 0 && <span className="block truncate text-muted">{r.berikut ? `Berikutnya: ${r.berikut.nama}` : "Sesuai jadwal"}</span>}
        {baris.map((a) => (
          <span key={a.teks} className="flex min-w-0 items-start gap-2">
            <span className={cn("mt-[6px] size-2 shrink-0 rounded-full", a.level ? TITIK[a.level] : "bg-[#b6bfcb]")} aria-hidden />
            <span className="min-w-0 max-md:line-clamp-2 md:truncate">{a.teks}</span>
            {!!a.lain && <span className="mt-0.5 shrink-0 text-xs text-muted">+{a.lain} lainnya</span>}
          </span>
        ))}
      </span>
      <span className="col-start-2 row-span-2 row-start-1 flex items-center justify-end gap-2 md:col-start-3 md:row-span-1">
        {/* Level ditulis dengan kata, tidak hanya warna, supaya terbaca juga bagi yang sulit membedakan warna. */}
        {level && <Lencana warna={r.warna}>{LABEL_LEVEL[r.warna]}</Lencana>}
        <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
