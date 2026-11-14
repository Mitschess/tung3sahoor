"use client";

import { BellRing, ChevronRight, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/util";
import { Modal } from "./ui";

/** Tombol SOS: jalan pintas ke 119 dan daftar tanda bahaya. Rangkul bukan layanan gawat darurat. */
export function TombolSos({ className, tandaBahaya = true }: { className?: string; tandaBahaya?: boolean }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className={cn("inline-flex h-9 items-center gap-1.5 rounded-full bg-rose px-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_-8px_var(--rose)]", className)}
      >
        <BellRing className="size-4" /> SOS
      </button>
      <Modal buka={buka} setBuka={setBuka} judul="Butuh bantuan segera?" deskripsi="Jika ada tanda bahaya, jangan menunggu jadwal periksa.">
        <div className="space-y-3">
          <a href="tel:119" className="flex items-center gap-3 rounded-2xl bg-merah p-4 text-white">
            <span className="grid size-11 place-items-center rounded-full bg-white/20">
              <Phone className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-bold">Telepon 119</span>
              <span className="text-sm text-white/85">Layanan gawat darurat nasional</span>
            </span>
            <ChevronRight className="size-5" />
          </a>
          {tandaBahaya && (
          <Link href="/ibu/tanda-bahaya" onClick={() => setBuka(false)} className="flex items-center gap-3 rounded-2xl bg-merah-soft p-4">
            <span className="grid size-11 place-items-center rounded-full bg-white text-merah">
              <ShieldAlert className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-merah">Lihat tanda bahaya</span>
              <span className="text-sm text-ink/70">Kehamilan, nifas, dan bayi baru lahir</span>
            </span>
            <ChevronRight className="size-5 text-merah" />
          </Link>
          )}
          <p className="text-center text-xs text-muted">Rangkul bukan layanan gawat darurat. Segera ke Puskesmas atau Rumah Sakit terdekat.</p>
        </div>
      </Modal>
    </>
  );
}
