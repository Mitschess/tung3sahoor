"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { GrafikBB, GrafikTfuDjj } from "@/components/grafik";
import { KepalaHalaman } from "@/components/kepala";
import { DaftarJadwal } from "@/components/tahap";
import { JudulBagian, Kartu, Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";

/** Jadwal kunjungan dan grafik. Isi tiap pemeriksaan dibaca di Catatan supaya tidak tampil dua kali. */
export default function Hasil() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;
  const hamil = r.tahap.set === "hamil";
  return (
    <div className="space-y-6 px-4">
      <KepalaHalaman judul={hamil ? "Jadwal & grafik" : "Jadwal kunjungan"} kembali="/ibu" />

      {r.jadwal.length > 0 && (
        <section>
          <JudulBagian>Jadwal kunjungan</JudulBagian>
          <DaftarJadwal js={r.jadwal} />
        </section>
      )}

      {hamil && (
        <>
          <Kartu id="grafik" className="scroll-mt-20">
            <JudulBagian>Kenaikan berat badan</JudulBagian>
            <GrafikBB r={r} />
          </Kartu>
          <Kartu>
            <JudulBagian>Tinggi rahim & denyut jantung bayi</JudulBagian>
            <GrafikTfuDjj r={r} />
          </Kartu>
        </>
      )}

      <Link href="/ibu/catatan" className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Lihat hasil tiap pemeriksaan</span>
          <span className="block text-sm text-muted">Semua catatan dari bidan dan kader ada di Catatan.</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted" />
      </Link>
    </div>
  );
}
