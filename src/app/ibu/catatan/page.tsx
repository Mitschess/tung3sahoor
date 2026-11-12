"use client";

import { ChevronRight, Lock, ScanLine } from "lucide-react";
import { useState } from "react";
import { TampilCatatan } from "@/components/kamus-form";
import { KepalaHalaman } from "@/components/kepala";
import { Ilustrasi } from "@/components/ilustrasi";
import { judulCatatan } from "@/components/riwayat";
import { Kosong, Memuat, Modal, Tab, TautanBuku } from "@/components/ui";
import { TEMA, type Tema } from "@/data/edukasi";
import { BAB_TABEL, halamanCetakTabel, keteranganCatatan, tanggalCatatan } from "@/lib/bab";
import { namaPengguna, useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";
import { tampilWaktu } from "@/lib/tanggal";
import type { Catatan as TCatatan } from "@/lib/types";
import { cn } from "@/lib/util";

/** Catatan: semua riwayat Ibu dari seluruh tahap, dikelompokkan per bab Buku KIA. */
export default function Catatan() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const [bab, setBab] = useState<Tema | "semua">("semua");
  const [buka, setBuka] = useState<TCatatan | null>(null);
  if (!r) return <Memuat />;

  const grup = BAB_TABEL.map((b) => ({ ...b, isi: b.tabel.filter((t) => kamus.tabel[t]).map((t) => ({ tabel: t, catatan: r.cari(t) })).filter((x) => x.catatan.length) })).filter((b) => b.isi.length);
  const total = grup.reduce((a, b) => a + b.isi.reduce((x, y) => x + y.catatan.length, 0), 0);
  const tampilkan = bab === "semua" ? grup : grup.filter((g) => g.tema === bab);

  return (
    <div className="space-y-5 px-4">
      <KepalaHalaman judul="Catatan" sub={total ? `${total} catatan dari Buku KIA Ibu` : "Buku KIA digital milik Ibu"} kembali="/ibu" />

      {grup.length === 0 ? (
        <Kosong ikon={<Ilustrasi nama="catatan" className="size-20" />} judul="Belum ada catatan" teks="Catatan muncul setelah kader atau bidan mengisi hasil periksa Ibu." />
      ) : (
        <>
          {grup.length > 1 && (
            <Tab
              nilai={bab}
              setNilai={setBab}
              pilihan={[{ nilai: "semua" as const, label: "Semua" }, ...grup.map((g) => ({ nilai: g.tema, label: g.judul }))]}
            />
          )}
          {tampilkan.map((g) => (
            <section key={g.tema} className="space-y-3">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <span className={cn("h-4 w-1.5 rounded-full", TEMA[g.tema].pita)} />
                {g.judul}
              </h2>
              {g.isi.map(({ tabel, catatan }) => {
                const hlm = halamanCetakTabel(tabel);
                const urut = [...catatan].sort((a, b) => tanggalCatatan(b).localeCompare(tanggalCatatan(a)));
                return (
                  <div key={tabel} className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
                    <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-3.5">
                      <h3 className="text-sm font-bold leading-snug">{kamus.tabel[tabel].judul}</h3>
                      {hlm && <TautanBuku halaman={hlm} label={`hlm. ${hlm}`} />}
                    </div>
                    <ul className="divide-y divide-line">
                      {urut.map((c) => (
                        <li key={c.id}>
                          <button type="button" onClick={() => setBuka(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                            <span className={cn("size-2.5 shrink-0 rounded-full", TEMA[g.tema].titik)} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-semibold">{judulCatatan(c)}</span>
                              <span className="block truncate text-xs text-muted">
                                {keteranganCatatan(c, judulCatatan(c), namaPengguna(c.meta.dibuat_oleh))}
                              </span>
                            </span>
                            {c.meta.sumber === "foto (OCR)" && <ScanLine className="size-4 shrink-0 text-brand" aria-label="Dari foto Buku KIA" />}
                            <ChevronRight className="size-5 shrink-0 text-muted" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}

      {grup.length > 0 && (
        <p className="flex items-start gap-2 rounded-2xl bg-black/[0.03] p-4 text-xs text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" />
          Hasil tripel eliminasi dan skrining kesehatan jiwa tidak ditampilkan di aplikasi untuk menjaga privasi Ibu. Bidan akan menjelaskannya langsung.
        </p>
      )}

      <Modal buka={!!buka} setBuka={() => setBuka(null)} judul={buka ? kamus.tabel[buka.tabel].judul : ""} deskripsi={buka ? judulCatatan(buka) : undefined}>
        {buka && (
          <>
            <TampilCatatan tabel={buka.tabel} data={buka.data} ringkas />
            <p className="mt-3 text-[11px] text-muted">
              Diisi {namaPengguna(buka.meta.dibuat_oleh)} · {buka.meta.sumber}
              {buka.meta.dikonfirmasi_oleh && ` · dikonfirmasi ${namaPengguna(buka.meta.dikonfirmasi_oleh)} ${tampilWaktu(buka.meta.dikonfirmasi_pada)}`}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
