"use client";

import { ChevronDown, Pencil, ScanLine } from "lucide-react";
import Link from "next/link";
import { namaPengguna } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { tampil, tampilWaktu } from "@/lib/tanggal";
import type { Catatan } from "@/lib/types";
import { TampilCatatan } from "./kamus-form";
import { Lencana, TautanBuku } from "./ui";

function judulCatatan(c: Catatan): string {
  const d = c.data;
  switch (c.tabel) {
    case "anc":
      return `K${d.kunjungan_ke ?? "?"} · ${tampil(d.tanggal)}`;
    case "kf":
      return `KF${d.kf_ke ?? "?"} · ${tampil(d.tanggal)}`;
    case "kn":
      return `${d.kn_ke ?? "KN"} · ${tampilWaktu(d.tanggal_jam)}`;
    case "pemantauan_hamil":
      return `Minggu ke-${d.minggu_kehamilan}`;
    case "pemantauan_nifas":
    case "pemantauan_bayi":
      return `Hari ke-${d.hari_ke}`;
    case "persalinan":
      return tampilWaktu(d.tanggal_jam);
    case "bayi_lahir":
      return `${d.nama_anak ?? "Bayi"} · ${d.berat_lahir_g ?? "?"} g`;
    case "rujukan":
      return `${tampil(d.tanggal_rujuk)} → ${d.tujuan ?? ""}`;
    default:
      return tampil(d.tanggal ?? c.meta.dibuat_pada);
  }
}

export function RiwayatTabel({ tabel, catatan, hrefUbah }: { tabel: string; catatan: Catatan[]; hrefUbah?: (c: Catatan) => string | null }) {
  const def = kamus.tabel[tabel];
  if (!catatan.length) return null;
  const hlmCetak = def.halaman_pdf[0] ? (def.halaman_pdf[0] - 2) * 2 : undefined;
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{def.judul}</h3>
        {hlmCetak && hlmCetak > 0 && <TautanBuku halaman={hlmCetak} label={`hlm. ${hlmCetak}`} />}
      </div>
      {[...catatan].reverse().map((c) => {
        const ubah = hrefUbah?.(c);
        return (
          <details key={c.id} className="group rounded-2xl border border-line bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
              <span className="flex-1 text-sm font-semibold">{judulCatatan(c)}</span>
              {c.meta.sumber === "foto (OCR)" && (
                <Lencana warna="brand">
                  <ScanLine className="size-3" /> foto
                </Lencana>
              )}
              <ChevronDown className="size-4 text-muted transition group-open:rotate-180" />
            </summary>
            <div className="border-t border-line px-4 pb-4 pt-2">
              <TampilCatatan tabel={tabel} data={c.data} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                <span>
                  Diisi {namaPengguna(c.meta.dibuat_oleh)} · {c.meta.sumber}
                  {c.meta.dikonfirmasi_oleh && ` · dikonfirmasi ${namaPengguna(c.meta.dikonfirmasi_oleh)} ${tampilWaktu(c.meta.dikonfirmasi_pada)}`}
                  {c.meta.diubah_terakhir?.length ? ` · diubah ${c.meta.diubah_terakhir.length}×` : ""}
                </span>
                {ubah && (
                  <Link href={ubah} className="inline-flex items-center gap-1 font-semibold text-brand">
                    <Pencil className="size-3" /> Ubah
                  </Link>
                )}
              </div>
            </div>
          </details>
        );
      })}
    </section>
  );
}
