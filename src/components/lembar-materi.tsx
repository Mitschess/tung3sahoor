"use client";

import { BookOpen, ChevronRight, Hand, RotateCcw, Siren, X } from "lucide-react";
import Link from "next/link";
import { TEMA, WARNA_TINJA, jumlahLembar, type ItemGambar, type Lembar, type Materi } from "@/data/edukasi";
import { urlHalamanCetak } from "@/lib/kamus";
import { cn } from "@/lib/util";
import { GambarKia, rasio } from "./gambar-kia";

/** Lembar pertama: sampul buku. */
export function LembarSampul({ m }: { m: Materi }) {
  const t = TEMA[m.tema];
  const tegak = rasio(m.sampul) < 1;
  return (
    <div className="flex min-h-full flex-col">
      <div className={cn("h-2.5 shrink-0", t.pita)} />
      <div className={cn("mx-4 mt-4 grid shrink-0 place-items-center overflow-hidden rounded-2xl", t.lembut)}>
        <GambarKia nama={m.sampul} alt="" preload className={cn(tegak ? "h-[32dvh] w-auto" : "max-h-[34dvh] object-contain")} />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <span className={cn("text-xs font-bold uppercase tracking-wider", t.teks)}>
          {t.bab} · {m.kategori}
        </span>
        <h2 className="mt-1 text-[27px] font-extrabold leading-[1.15] tracking-tight">{m.judul}</h2>
        <p className="mt-2 text-[15px] leading-snug text-muted">{m.sub}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-3 py-1.5">
            <BookOpen className="size-3.5" /> {jumlahLembar(m)} lembar
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-3 py-1.5">Buku KIA hlm. {m.halaman}</span>
        </div>
        <p className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-muted">
          <Hand className="size-5 animate-[geser_1.8s_ease-in-out_infinite]" /> Geser ke kiri untuk membuka
        </p>
      </div>
    </div>
  );
}

/** Lembar isi: pita bab seperti di Buku KIA, gambar, judul, teks, kumpulan gambar, dan poin. */
export function LembarIsi({ m, l }: { m: Materi; l: Lembar }) {
  const t = TEMA[m.tema];
  return (
    <div className="flex min-h-full flex-col">
      <div className={cn("flex shrink-0 items-center justify-between gap-2 px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-white", t.pita)}>
        <span className="truncate">{t.bab}</span>
        {l.halaman && <span className="shrink-0">hlm. {l.halaman}</span>}
      </div>

      {l.nada === "bahaya" && (
        <p className="mx-4 mt-4 flex items-start gap-2.5 rounded-2xl bg-merah px-4 py-3 text-sm font-semibold leading-snug text-white">
          <Siren className="mt-px size-5 shrink-0" /> Kalau mengalami, segera ke Puskesmas atau Rumah Sakit.
        </p>
      )}

      {l.gambar && (
        <div className={cn("mx-4 mt-4 grid shrink-0 place-items-center overflow-hidden rounded-2xl", t.lembut)}>
          <GambarKia nama={l.gambar} alt={l.judul} className={cn(rasio(l.gambar) < 1.1 ? "h-[26dvh] w-auto" : "max-h-[28dvh] object-contain")} />
        </div>
      )}

      <div className="px-5 pb-6 pt-4">
        <h2 className="text-[22px] font-extrabold leading-tight tracking-tight">{l.judul}</h2>
        {l.teks && <p className="mt-2 text-[15.5px] leading-relaxed text-ink/80">{l.teks}</p>}
        {l.kisi && <KisiGambar isi={l.kisi} jangan={l.nada === "jangan"} />}
        {l.warnaTinja && <KartuTinja />}
        {l.poin && <DaftarPoin poin={l.poin} nada={l.nada} titik={t.titik} />}
        {l.aksi && (
          <Link href={l.aksi.href} className={cn("mt-5 flex items-center justify-between gap-2 rounded-2xl px-4 py-3.5 font-semibold", t.lembut, t.teks)}>
            {l.aksi.label} <ChevronRight className="size-5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Daftar poin bergaya Buku KIA, tanpa ikon centang:
 * "tips" = kotak kuning bernomor seperti kotak "Hal-hal yang perlu dilakukan",
 * "jangan"/"bahaya" = garis pendek merah, lainnya = titik kecil berwarna bab.
 */
function DaftarPoin({ poin, nada, titik }: { poin: string[]; nada?: Lembar["nada"]; titik: string }) {
  if (nada === "tips")
    return (
      <ol className="mt-4 rounded-2xl bg-[#fff7e1] px-4 py-1.5 ring-1 ring-[#f4dfa6]">
        {poin.map((p, i) => (
          <li key={p} className="flex gap-3 border-b border-dashed border-[#efd9a0] py-2.5 text-[15.5px] leading-snug last:border-0">
            <span className="w-4 shrink-0 text-right font-extrabold tabular-nums text-[#c27c00]">{i + 1}</span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
    );
  const merah = nada === "jangan" || nada === "bahaya";
  return (
    <ul className="mt-3 divide-y divide-line">
      {poin.map((p) => (
        <li key={p} className="flex gap-3 py-2.5 text-[15.5px] leading-snug">
          {merah ? <span className="mt-[0.6em] h-[3px] w-3 shrink-0 rounded-full bg-merah" /> : <span className={cn("mt-[0.5em] size-[7px] shrink-0 rounded-full", titik)} />}
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kumpulan gambar berlabel. Gambar tegak (orang berdiri) dibuat 3 kolom supaya muat satu layar. */
export function KisiGambar({ isi, jangan }: { isi: ItemGambar[]; jangan?: boolean }) {
  const r = isi.reduce((a, b) => a + rasio(b.gambar), 0) / isi.length;
  const kolom = isi.length > 2 && r < 0.8 ? 3 : 2;
  return (
    <div className={cn("mt-4 grid gap-2.5", kolom === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {isi.map((b) => (
        <figure key={b.gambar} className="overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_var(--line)]">
          <div className="relative overflow-hidden" style={{ aspectRatio: Math.min(Math.max(r, 0.55), 1.7) }}>
            <GambarKia nama={b.gambar} alt="" sizes={kolom === 3 ? "30vw" : "45vw"} className="h-full w-full object-cover" />
            {jangan && (
              <span className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-merah text-white shadow">
                <X className="size-3.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <figcaption className={cn("px-2.5 py-2 font-medium leading-tight", kolom === 3 ? "text-[12.5px]" : "text-[13.5px]")}>{b.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Kartu warna tinja bayi (Buku KIA hlm. 47). */
export function KartuTinja() {
  return (
    <div className="mt-4 rounded-2xl bg-black/[0.03] p-3">
      <div className="grid grid-cols-7 gap-1.5">
        {WARNA_TINJA.map((w, k) => (
          <div key={w} className="text-center">
            <span className={cn("block aspect-[3/4] rounded-lg", k < 3 ? "ring-2 ring-merah ring-offset-1" : "ring-1 ring-black/10")} style={{ background: w }} />
            <span className={cn("mt-1 block text-xs font-bold", k < 3 ? "text-merah" : "text-muted")}>{k + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5 text-[11px] font-semibold leading-tight">
        <span className="col-span-3 rounded-lg bg-merah-soft px-2 py-1 text-center text-merah">Pucat: ke dokter</span>
        <span className="col-span-4 rounded-lg bg-hijau-soft px-2 py-1 text-center text-hijau">Normal</span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted">Warna di layar bisa sedikit berbeda. Bandingkan juga dengan kartu di Buku KIA hlm. 47.</p>
    </div>
  );
}

/** Lembar terakhir: ringkasan, materi berikutnya, dan tautan ke halaman asli. */
export function LembarPenutup({ m, berikut, ulang }: { m: Materi; berikut?: Materi; ulang: () => void }) {
  const t = TEMA[m.tema];
  return (
    <div className="flex min-h-full flex-col">
      <div className={cn("h-2.5 shrink-0", t.pita)} />
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <p className={cn("text-[11px] font-bold uppercase tracking-[0.14em]", t.teks)}>Selesai dibaca</p>
        <h2 className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight">Yang perlu Ibu ingat</h2>
        <ol className="mt-4 rounded-2xl bg-[#fffaf0] px-4 py-1 shadow-[0_1px_0_#efe2c4,0_0_0_1px_#f3e7cc]">
          {m.ringkas.map((p, i) => (
            <li key={p} className="flex gap-3.5 border-b border-dashed border-[#eadcb9] py-3 text-[15.5px] leading-snug last:border-0">
              <span className={cn("w-4 shrink-0 text-right text-lg font-extrabold leading-[1.15] tabular-nums", t.teks)}>{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto space-y-2.5 pt-6">
          {berikut && (
            <Link href={`/ibu/edukasi/${berikut.slug}`} className="flex items-center gap-3 rounded-2xl p-2.5 shadow-[0_0_0_1px_var(--line)]">
              <span className={cn("grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl", TEMA[berikut.tema].lembut)}>
                <GambarKia nama={berikut.sampul} alt="" sizes="56px" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted">Materi berikutnya</span>
                <span className="block truncate font-semibold">{berikut.judul}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted" />
            </Link>
          )}
          <a href={urlHalamanCetak(m.halaman)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-brand shadow-[0_0_0_1px_var(--line)]">
            <BookOpen className="size-4" /> Baca halaman aslinya (PDF)
          </a>
          <button type="button" onClick={ulang} className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-semibold text-muted">
            <RotateCcw className="size-4" /> Ulangi dari awal
          </button>
        </div>
      </div>
    </div>
  );
}
