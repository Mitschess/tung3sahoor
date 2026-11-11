"use client";

import { useRouter } from "next/navigation";
import { Flipbook } from "@/components/flipbook";
import { TampilCatatan } from "@/components/kamus-form";
import { Ilustrasi } from "@/components/ilustrasi";
import { judulCatatan } from "@/components/riwayat";
import { Memuat } from "@/components/ui";
import { TEMA, type Tema } from "@/data/edukasi";
import { BAB_TABEL, halamanCetakTabel, keteranganCatatan, tanggalCatatan } from "@/lib/bab";
import { namaPengguna, useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";
import { tampil } from "@/lib/tanggal";
import type { Catatan } from "@/lib/types";
import { cn } from "@/lib/util";

/** Seluruh catatan Ibu dibaca seperti Buku KIA: satu catatan per lembar, urut per bab lalu tanggal. */
export default function BukuCatatan() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const router = useRouter();
  if (!r) return <Memuat />;

  const lembar: { c: Catatan; tema: Tema; bab: string }[] = BAB_TABEL.flatMap((b) =>
    b.tabel
      .filter((t) => kamus.tabel[t])
      .flatMap((t) => [...r.cari(t)].sort((x, y) => tanggalCatatan(x).localeCompare(tanggalCatatan(y))).map((c) => ({ c, tema: b.tema, bab: b.judul }))),
  );
  const p = r.ibu.profil;
  const total = lembar.length + 2;

  return (
    <Flipbook
      jumlah={total}
      judul="Buku KIA Saya"
      label={String(p.nama)}
      warna={{ teks: "text-rose", isi: "bg-rose" }}
      onTutup={() => router.push("/ibu/catatan")}
      render={(i) => {
        if (i === 0)
          return (
            <div className="flex min-h-full flex-col">
              <div className="h-2.5 bg-rose" />
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
                <Ilustrasi nama="bukuKia" className="size-28" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-rose">Buku KIA Saya</p>
                <h2 className="mt-2 text-[26px] font-extrabold uppercase leading-tight">{String(p.nama)}</h2>
                <p className="mt-1 text-sm text-muted">Posyandu {String(p.wilayah_posyandu ?? "–")}</p>
                <dl className="mt-6 grid w-full grid-cols-2 gap-2 text-left">
                  <div className="rounded-2xl bg-rose-soft p-3">
                    <dt className="text-xs text-ink/60">Tahap</dt>
                    <dd className="font-bold">{r.tahap.label}</dd>
                  </div>
                  <div className="rounded-2xl bg-brand-soft p-3">
                    <dt className="text-xs text-ink/60">{r.tahap.set === "hamil" ? "Perkiraan lahir" : "Isi buku"}</dt>
                    <dd className="font-bold">{r.tahap.set === "hamil" && r.tahap.hpl ? tampil(r.tahap.hpl) : `${lembar.length} catatan`}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-xs text-muted">Salinan digital dari Buku KIA. Buku kertas tetap dibawa setiap periksa.</p>
              </div>
            </div>
          );
        if (i === total - 1)
          return (
            <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
              <Ilustrasi nama="catatan" className="size-24" />
              <h2 className="mt-4 text-[22px] font-extrabold">Akhir catatan</h2>
              <p className="mt-2 text-[15px] text-muted">Catatan baru ditambahkan oleh kader atau bidan setiap Ibu periksa, atau dari foto halaman Buku KIA.</p>
            </div>
          );
        const { c, tema, bab } = lembar[i - 1];
        const t = TEMA[tema];
        const hlm = halamanCetakTabel(c.tabel);
        return (
          <div className="flex min-h-full flex-col">
            <div className={cn("flex items-center justify-between gap-2 px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-white", t.pita)}>
              <span className="truncate">{bab}</span>
              {hlm && <span className="shrink-0">hlm. {hlm}</span>}
            </div>
            <div className="px-5 pb-6 pt-4">
              <p className={cn("text-xs font-bold uppercase tracking-wider", t.teks)}>{kamus.tabel[c.tabel].judul}</p>
              <h2 className="mt-1 text-[22px] font-extrabold leading-tight">{judulCatatan(c)}</h2>
              <p className="mt-1 text-xs text-muted">
                {keteranganCatatan(c, judulCatatan(c), namaPengguna(c.meta.dibuat_oleh))} · {c.meta.sumber}
              </p>
              <div className="mt-3">
                <TampilCatatan tabel={c.tabel} data={c.data} ringkas />
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
