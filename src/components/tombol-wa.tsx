"use client";

import { Check, MessageCircle } from "lucide-react";
import type { Ringkasan } from "@/lib/hooks";
import { pesanKunjungan, pesanMerah } from "@/lib/pesan";
import { useStore } from "@/lib/store";
import { cn, tautanWa } from "@/lib/util";

/** True bila dua waktu jatuh pada hari kalender yang sama. */
const hariSama = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Ibu punya tanda bahaya (Merah) yang boleh disampaikan lewat pesan. Peringatan sensitif tidak dihitung,
 * supaya keluarga tidak menerima kabar yang berasal dari hasil tes sensitif.
 */
export function perluSegera(r: Ringkasan) {
  return r.peringatan.some((p) => p.level === "merah" && !p.sensitif);
}

/**
 * Tombol kirim pesan WhatsApp. Setelah dikirim hari ini, tombol menampilkan jamnya supaya tidak terkirim dua kali.
 * `jenis="otomatis"`: pesan ajakan segera periksa bila ibu berstatus Merah, selain itu pengingat jadwal.
 */
export function TombolWa({ r, ke, jenis = "jadwal", className }: { r: Ringkasan; ke: "ibu" | "pendamping"; jenis?: "jadwal" | "otomatis"; className?: string }) {
  const catat = useStore((s) => s.catatPengingat);
  const terakhir = useStore((s) => s.pengingat.find((l) => l.ibuId === r.ibu.id && l.ke === ke));
  const tel = ke === "ibu" ? r.ibu.profil.telepon : r.ibu.keluarga.telepon_pendamping;
  const pesan = jenis === "otomatis" && perluSegera(r) ? pesanMerah(r, ke) : pesanKunjungan(r, ke);
  const url = tautanWa(tel, pesan);
  if (!url) return null;
  const siapa = ke === "ibu" ? "ibu" : String(r.ibu.keluarga.hubungan ?? "keluarga").toLowerCase();
  const pada = terakhir ? new Date(terakhir.pada) : null;
  const terkirim = pada && hariSama(pada, new Date());
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={() => catat({ ibuId: r.ibu.id, ke, telepon: String(tel), pesan })}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition",
        terkirim ? "border-hijau/30 bg-hijau-soft text-hijau hover:brightness-95" : "border-line bg-surface hover:bg-bg",
        className,
      )}
      title={pesan}
    >
      {terkirim ? <Check className="size-4" /> : <MessageCircle className="size-4 text-hijau" />}
      {terkirim ? `Terkirim ke ${siapa} ${pada.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : `WA ${siapa}`}
    </a>
  );
}
