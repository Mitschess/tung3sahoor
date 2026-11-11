"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Ringkasan } from "@/lib/hooks";
import { cn, inisial } from "@/lib/util";
import { Lencana, TitikLevel } from "./ui";

const LATAR = { merah: "bg-merah-soft text-merah", kuning: "bg-kuning-soft text-kuning", hijau: "bg-hijau-soft text-hijau" } as const;

export function BarisIbu({ r, catatan }: { r: Ringkasan; catatan?: string }) {
  const atas = r.peringatan[0];
  return (
    <Link href={`/app/ibu/${r.ibu.id}`} className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition hover:border-brand/30 hover:shadow-md">
      <div className={cn("relative grid size-11 shrink-0 place-items-center rounded-full text-sm font-extrabold", LATAR[r.warna])}>
        {inisial(r.ibu.profil.nama)}
        <TitikLevel level={r.warna} className="absolute -right-0.5 -top-0.5 ring-2 ring-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="truncate font-bold">{String(r.ibu.profil.nama)}</p>
          <span className="text-xs text-muted">{r.tahap.label}</span>
        </div>
        <p className={cn("truncate text-sm", atas ? (atas.level === "merah" ? "font-semibold text-merah" : "text-kuning") : "text-muted")}>
          {catatan ?? (atas ? `${atas.judul}${r.peringatan.length > 1 ? ` +${r.peringatan.length - 1}` : ""}` : r.berikut ? `Berikutnya: ${r.berikut.nama}` : "Sesuai jadwal")}
        </p>
      </div>
      <Lencana className="hidden sm:inline-flex">Posyandu {String(r.ibu.profil.wilayah_posyandu)}</Lencana>
      <ChevronRight className="size-5 text-muted transition group-hover:translate-x-0.5" />
    </Link>
  );
}
