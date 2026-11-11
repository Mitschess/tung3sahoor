"use client";

import { MessageCircle } from "lucide-react";
import type { Ringkasan } from "@/lib/hooks";
import { pesanKunjungan } from "@/lib/pesan";
import { useStore } from "@/lib/store";
import { cn, tautanWa } from "@/lib/util";

export function TombolWa({ r, ke, className }: { r: Ringkasan; ke: "ibu" | "pendamping"; className?: string }) {
  const catat = useStore((s) => s.catatPengingat);
  const tel = ke === "ibu" ? r.ibu.profil.telepon : r.ibu.keluarga.telepon_pendamping;
  const pesan = pesanKunjungan(r, ke);
  const url = tautanWa(tel, pesan);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={() => catat({ ibuId: r.ibu.id, ke, telepon: String(tel), pesan })}
      className={cn("inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold hover:bg-bg", className)}
      title={pesan}
    >
      <MessageCircle className="size-4 text-hijau" /> {ke === "ibu" ? "WA ibu" : `WA ${String(r.ibu.keluarga.hubungan ?? "keluarga").toLowerCase()}`}
    </a>
  );
}
