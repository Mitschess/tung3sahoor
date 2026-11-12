"use client";

import { ArrowLeft } from "lucide-react";
import { useKembali } from "@/lib/navigasi";
import type { ReactNode } from "react";

/** Judul halaman dengan tombol kembali. `kembali` hanya dipakai bila halaman dibuka langsung tanpa halaman sebelumnya. */
export function KepalaHalaman({ judul, sub, aksi, kembali }: { judul: string; sub?: ReactNode; aksi?: ReactNode; kembali?: string }) {
  const keKembali = useKembali(kembali);
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 bg-[#f8fafd]/90 px-2 py-2.5 backdrop-blur">
      <button onClick={keKembali} className="grid size-11 shrink-0 place-items-center rounded-full text-ink hover:bg-black/5" aria-label="Kembali">
        <ArrowLeft className="size-6" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold leading-tight">{judul}</h1>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
      {aksi}
    </div>
  );
}
