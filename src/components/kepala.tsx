"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function KepalaHalaman({ judul, sub, aksi, kembali }: { judul: string; sub?: ReactNode; aksi?: ReactNode; kembali?: string }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-3 bg-bg/85 px-4 py-3 backdrop-blur">
      <button onClick={() => (kembali ? router.push(kembali) : router.back())} className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface" aria-label="Kembali">
        <ArrowLeft className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-extrabold leading-tight">{judul}</h1>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
      {aksi}
    </div>
  );
}
