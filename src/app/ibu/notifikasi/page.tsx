"use client";

import { AlertTriangle, CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Ilustrasi } from "@/components/ilustrasi";
import { KepalaHalaman } from "@/components/kepala";
import { Memuat } from "@/components/ui";
import { useRingkasan, useSekarang } from "@/lib/hooks";
import { daftarNotifikasi } from "@/lib/notifikasi";
import { usePengguna } from "@/lib/store";
import { cn } from "@/lib/util";

const GAYA = {
  merah: "bg-merah-soft text-merah",
  kuning: "bg-kuning-soft text-kuning",
  brand: "bg-brand-soft text-brand",
} as const;

export default function Notifikasi() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const now = useSekarang();
  if (!r) return <Memuat />;
  const daftar = daftarNotifikasi(r, now);

  return (
    <div className="px-4">
      <KepalaHalaman judul="Notifikasi" kembali="/ibu" />
      {daftar.length === 0 ? (
        <div className="flex min-h-[65dvh] flex-col items-center justify-center px-4 text-center">
          <Ilustrasi nama="lonceng" className="mb-6 size-40" />
          <p className="text-xl font-medium">Notifikasi MOMCARE akan muncul di sini</p>
          <p className="mt-3 text-[15px] text-muted">
            Ibu akan mendapat pemberitahuan untuk <b className="text-ink">jadwal periksa, kunjungan yang terlewat, dan hasil pemeriksaan yang perlu ditindaklanjuti.</b>
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 pb-4">
          {daftar.map((n) => {
            const Ikon = n.jenis === "jadwal" ? CalendarClock : AlertTriangle;
            return (
              <li key={n.id}>
                <Link href={n.href} className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", GAYA[n.nada])}>
                    <Ikon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block font-semibold leading-snug", n.nada === "merah" && "text-merah")}>{n.judul}</span>
                    <span className="mt-0.5 block text-sm text-muted">{n.teks}</span>
                  </span>
                  <ChevronRight className="mt-3 size-5 shrink-0 text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
