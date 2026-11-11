"use client";

import { BookOpen, ChevronDown, Lock, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { KepalaHalaman } from "@/components/kepala";
import { Kartu, Lencana, Masukan } from "@/components/ui";
import { KOLOM_SENSITIF, kamus, levelDariPeringatanYa, ringkasKamus, urlHalaman } from "@/lib/kamus";
import { cn } from "@/lib/util";

export default function HalamanKamus() {
  const [q, setQ] = useState("");
  const [buka, setBuka] = useState<string | null>(null);
  const ring = ringkasKamus();
  const qq = q.toLowerCase();
  const daftar = Object.entries(kamus.tabel).filter(
    ([n, t]) => !qq || n.includes(qq) || t.judul.toLowerCase().includes(qq) || Object.entries(t.kolom).some(([k, kol]) => k.includes(qq) || kol.label.toLowerCase().includes(qq)),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <KepalaHalaman judul="Kamus data" sub={`${ring.jumlahTabel} tabel · ${ring.jumlahKolom} kolom · versi ${kamus.versi}. Semua form, validasi, dan sebagian aturan peringatan dibangkitkan dari sini.`} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Masukan placeholder="Cari tabel atau kolom (mis. djj, lila, nifas)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
      </div>
      <div className="space-y-2">
        {daftar.map(([n, t]) => {
          const terbuka = buka === n || (!!qq && daftar.length <= 3);
          const kolom = Object.entries(t.kolom);
          return (
            <Kartu key={n} className="p-0">
              <button type="button" onClick={() => setBuka(terbuka ? null : n)} className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={terbuka}>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {t.judul} <code className="ml-1 text-xs font-normal text-muted">{n}</code>
                  </p>
                  <p className="text-xs text-muted">
                    {kolom.length} kolom · diisi {t.diisi_oleh.toLowerCase()}
                  </p>
                </div>
                <Lencana warna={t.prioritas === "Wajib demo" ? "brand" : "netral"}>{t.prioritas}</Lencana>
                <ChevronDown className={cn("size-4 text-muted transition", terbuka && "rotate-180")} />
              </button>
              {terbuka && (
                <div className="border-t border-line px-4 pb-4 pt-2">
                  {t.halaman_pdf.length > 0 && (
                    <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <BookOpen className="size-3.5" /> Buku KIA hlm. PDF:
                      {t.halaman_pdf.map((h) => (
                        <a key={h} href={urlHalaman(h)} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
                          {h}
                        </a>
                      ))}
                    </p>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="text-xs text-muted">
                        <tr>
                          <th className="py-2 pr-3 font-semibold">Kolom</th>
                          <th className="py-2 pr-3 font-semibold">Tipe</th>
                          <th className="py-2 font-semibold">Aturan / pilihan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {kolom.map(([k, kol]) => {
                          const lv = levelDariPeringatanYa(kol);
                          return (
                            <tr key={k} className="align-top">
                              <td className="py-2 pr-3">
                                <p className="font-medium">{kol.label}</p>
                                <code className="text-[11px] text-muted">{k}</code>
                              </td>
                              <td className="py-2 pr-3 text-xs">
                                <span className="inline-flex flex-wrap items-center gap-1">
                                  {kol.tipe}
                                  {kol.satuan ? ` · ${kol.satuan}` : ""}
                                  {kol.otomatis && (
                                    <span className="inline-flex items-center gap-0.5 text-brand">
                                      <Sparkles className="size-3" /> otomatis
                                    </span>
                                  )}
                                  {KOLOM_SENSITIF.has(k) && (
                                    <span className="inline-flex items-center gap-0.5 text-rose">
                                      <Lock className="size-3" /> sensitif
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="py-2 text-xs text-muted">
                                {kol.rentang && <span className="mr-2">rentang {kol.rentang[0]}–{kol.rentang[1]}</span>}
                                {kol.pilihan && <span className="mr-2">{kol.pilihan.join(" · ")}</span>}
                                {kol.peringatan && (
                                  <span className={cn("block", lv === "merah" ? "text-merah" : lv === "kuning" ? "text-kuning" : "")}>⚑ {kol.peringatan}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Kartu>
          );
        })}
      </div>
    </div>
  );
}
