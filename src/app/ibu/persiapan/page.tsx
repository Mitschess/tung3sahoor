"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { KepalaHalaman } from "@/components/kepala";
import { Kartu, Memuat, TautanBuku } from "@/components/ui";
import { kamus } from "@/lib/kamus";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { terakhir } from "@/lib/tahap";
import { cn } from "@/lib/util";

export default function Persiapan() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const simpan = useStore((s) => s.simpan);
  if (!r) return <Memuat />;
  const rec = terakhir(r.cari, "persiapan");
  const data = rec?.data ?? {};
  const kolom = Object.entries(kamus.tabel.persiapan.kolom);
  const sudah = kolom.filter(([k]) => data[k] === true).length;
  const minggu = r.tahap.ukMinggu ?? 0;

  const toggle = (k: string) => {
    try {
      simpan("persiapan", r.ibu.id, { ...data, [k]: !(data[k] === true) }, rec ? { catatanId: rec.id } : {});
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="px-4">
      <KepalaHalaman judul="Persiapan melahirkan" sub="Ceklis P4K · diisi oleh ibu" kembali="/ibu" />
      <Kartu className="mb-4 flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--brand-soft)" strokeWidth="4" />
            <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" strokeDasharray="97.4" initial={{ strokeDashoffset: 97.4 }} animate={{ strokeDashoffset: 97.4 * (1 - sudah / kolom.length) }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-sm font-extrabold">
            {sudah}/{kolom.length}
          </span>
        </div>
        <div className="text-sm">
          <p className="font-bold">Persiapan dimulai sejak trimester 2</p>
          <p className="text-muted">
            {minggu >= 36 ? "Sudah minggu ke-36: penolong, donor darah, dan kendaraan sebaiknya sudah siap." : "Centang yang sudah Ibu lakukan. Kader dan suami ikut melihat kemajuannya."}
          </p>
        </div>
      </Kartu>
      <div className="space-y-2">
        {kolom.map(([k, kol]) => {
          const v = data[k] === true;
          const penting = /minggu ke-36/.test(kol.peringatan ?? "");
          return (
            <button key={k} onClick={() => toggle(k)} aria-pressed={v} className={cn("flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition", v ? "border-hijau/40 bg-hijau-soft" : "border-line bg-surface hover:bg-bg")}>
              <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2", v ? "border-hijau bg-hijau text-white" : "border-line")}>{v && <Check className="size-4" strokeWidth={3} />}</span>
              <span className="flex-1 text-sm font-medium">
                {kol.label}
                {penting && !v && minggu >= 30 && <span className="mt-1 block text-xs font-semibold text-kuning">Penting sebelum minggu ke-36</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <TautanBuku halaman={18} label="Persiapan melahirkan di Buku KIA hlm. 18" />
      </div>
    </div>
  );
}
