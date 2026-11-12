"use client";

import { BookOpen, ChevronRight, RotateCcw, Siren, X } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { TEMA, WARNA_TINJA, jumlahLembar, type ItemGambar, type Lembar, type Materi, type Tema } from "@/data/edukasi";
import type { NamaGambar } from "@/data/gambar-kia";
import { urlHalamanCetak } from "@/lib/kamus";
import { tandaiGanti } from "@/lib/navigasi";
import { cn } from "@/lib/util";
import { GambarKia, rasio } from "./gambar-kia";

/** Warna huruf besar pembuka paragraf, per bab (ditulis lengkap supaya terbaca Tailwind). */
const HURUF_AWAL: Record<Tema, string> = {
  rose: "first-letter:text-rose",
  brand: "first-letter:text-brand",
  ungu: "first-letter:text-ungu",
  hijau: "first-letter:text-hijau",
  teal: "first-letter:text-teal",
};

/** Urutan bab untuk letak penanda tepi (seperti indeks jempol di kamus). */
const URUTAN_BAB: Tema[] = ["rose", "brand", "ungu", "hijau", "teal"];

/** Batas terkecil pengecilan halaman; di bawah ini tulisan terlalu kecil untuk dibaca. */
const SKALA_MIN = 0.78;

/**
 * Lembar buku tidak pernah digulir. Gambar sudah menyusut mengikuti ruang yang tersisa;
 * bila tulisan tetap tidak muat (layar sangat pendek), seluruh lembar diperkecil sampai pas.
 */
function PasLembar({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const luar = useRef<HTMLDivElement>(null);
  const isi = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = isi.current;
    const wadah = luar.current;
    if (!el || !wadah) return;
    const pasang = (z: number) => {
      el.style.width = `${100 / z}%`;
      el.style.height = `${100 / z}%`;
      el.style.transform = z === 1 ? "" : `scale(${z})`;
      el.dataset.skala = z.toFixed(3);
    };
    const ukur = () => {
      let z = 1;
      pasang(1);
      for (let n = 0; n < 4; n++) {
        const r = el.clientHeight / el.scrollHeight;
        if (r >= 0.998) break;
        z = Math.max(z * r * 0.995, SKALA_MIN);
        pasang(z);
        if (z === SKALA_MIN) break;
      }
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(wadah);
    document.fonts?.ready.then(ukur);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={luar} className="relative h-full overflow-hidden">
      <div ref={isi} className={cn("flex h-full origin-top-left flex-col overflow-hidden", className)} style={style}>
        {children}
      </div>
    </div>
  );
}

/** Punggung buku di tepi kiri sampul: bidang gelap, garis lipatan, dan bayangan lekukan. */
function Punggung() {
  return (
    <>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-black/[0.16]" />
      <span className="pointer-events-none absolute inset-y-0 left-4 w-px bg-white/30" />
      <span className="pointer-events-none absolute inset-y-0 left-[17px] w-3 bg-gradient-to-r from-black/[0.12] to-transparent" />
    </>
  );
}

/** Lembar pertama: sampul berwarna bab, sama seperti buku di rak Edukasi. */
export function LembarSampul({ m }: { m: Materi }) {
  const t = TEMA[m.tema];
  return (
    <PasLembar className={cn("relative text-white", t.pita)}>
      <Punggung />
      <div className="relative flex min-h-0 flex-1 flex-col pb-5 pl-10 pr-6 pt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
          {t.bab} · {m.kategori}
        </p>
        <h2 className="mt-2 text-[30px] font-extrabold leading-[1.08] tracking-tight">{m.judul}</h2>
        <p className="mt-2.5 text-[15px] leading-snug text-white/85">{m.sub}</p>

        <div className="my-6 flex min-h-0 flex-1 items-center justify-center">
          <div className="max-w-full rounded-[20px] bg-white p-2 shadow-[0_20px_34px_-18px_rgb(0_0_0/0.55)]">
            <GambarKia nama={m.sampul} alt="" preload className="max-h-[31dvh] w-auto max-w-full rounded-[13px]" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-white/25 pt-3 text-xs text-white/80">
          <span className="leading-snug">
            <b className="block font-semibold text-white">Buku KIA 2024</b>
            Halaman {m.halaman}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <BookOpen className="size-4" /> {jumlahLembar(m)} lembar
          </span>
        </div>
      </div>
    </PasLembar>
  );
}

/** Kertas halaman isi: putih hangat dengan bayangan halus di tepi, dan penanda bab di tepi kanan. */
function Kertas({ tema, children }: { tema: Tema; children: ReactNode }) {
  const t = TEMA[tema];
  return (
    <PasLembar className="relative bg-[#fffdf8] shadow-[inset_0_0_48px_rgb(120_90_40/0.06)]">
      <span
        className={cn("pointer-events-none absolute right-0 h-14 w-[5px] rounded-l-full", t.pita)}
        style={{ top: `${16 + URUTAN_BAB.indexOf(tema) * 13}%` }}
        aria-hidden
      />
      {children}
    </PasLembar>
  );
}

/** Kepala halaman seperti buku cetak: nama bab di kiri, keterangan di kanan. */
function KepalaLembar({ m, kanan }: { m: Materi; kanan?: string }) {
  const t = TEMA[m.tema];
  return (
    <div className="mx-6 flex shrink-0 items-center justify-between gap-3 border-b border-[#ece4d4] pb-2.5 pt-4 text-[10.5px] font-bold uppercase tracking-[0.14em]">
      <span className={cn("flex min-w-0 items-center gap-2", t.teks)}>
        <span className={cn("size-1.5 shrink-0 rounded-full", t.pita)} />
        <span className="truncate">{t.bab}</span>
      </span>
      {kanan && <span className="shrink-0 text-[#a39a88]">{kanan}</span>}
    </div>
  );
}

/** Judul lembar dengan garis aksen berwarna bab. */
function JudulLembar({ judul, tema, besar }: { judul: string; tema: Tema; besar?: boolean }) {
  return (
    <div className="shrink-0">
      <h2 className={cn("font-extrabold leading-[1.15] tracking-tight", besar ? "text-[26px]" : "text-[21px]")}>{judul}</h2>
      <span className={cn("mt-2 block h-1 w-10 rounded-full", TEMA[tema].pita)} />
    </div>
  );
}

/**
 * Gambar yang mengisi ruang tersisa di lembar: menyusut di layar pendek,
 * dan tidak melebihi ukuran aslinya (lebar penuh) di layar tinggi.
 */
function GambarPas({ nama, alt }: { nama: NamaGambar; alt: string }) {
  return (
    <div className="relative mt-3.5 min-h-[88px] flex-1" style={{ maxHeight: `calc(100cqw / ${rasio(nama).toFixed(3)})` }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <GambarKia nama={nama} alt={alt} className="max-h-full w-auto max-w-full rounded-[18px] ring-1 ring-black/[0.05]" />
      </div>
    </div>
  );
}

/** Kumpulan gambar berlabel yang mengisi ruang tersisa di lembar. */
function KisiPas({ isi, jangan }: { isi: ItemGambar[]; jangan?: boolean }) {
  const r = isi.reduce((a, b) => a + rasio(b.gambar), 0) / isi.length;
  const kolom = isi.length > 2 && r < 0.8 ? 3 : 2;
  const baris = Math.ceil(isi.length / kolom);
  const rTampil = Math.min(Math.max(r, 0.55), 1.7);
  const keterangan = kolom === 3 ? 40 : 38;
  // Tinggi terbesar = tinggi alami tiap gambar pada lebar kolom, ditambah keterangan dan jarak antarbaris.
  const tinggiMaks = `calc(${baris} * ((100cqw - ${(kolom - 1) * 10}px) / ${kolom} / ${rTampil.toFixed(3)} + ${keterangan}px) + ${(baris - 1) * 10}px)`;
  return (
    <div
      className={cn("mt-3.5 grid min-h-[150px] flex-1 gap-2.5", kolom === 3 ? "grid-cols-3" : "grid-cols-2")}
      style={{ gridTemplateRows: `repeat(${baris}, minmax(0, 1fr))`, maxHeight: tinggiMaks }}
    >
      {isi.map((b) => (
        <figure key={b.gambar} className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#ece4d4]">
          <div className="relative min-h-0 flex-1">
            <GambarKia nama={b.gambar} alt="" sizes={kolom === 3 ? "30vw" : "45vw"} className="absolute inset-0 h-full w-full object-cover" />
            {jangan && (
              <span className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-merah text-white shadow">
                <X className="size-3.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <figcaption className={cn("shrink-0 px-2.5 py-1.5 font-medium leading-tight", kolom === 3 ? "text-[12px]" : "text-[13px]")}>{b.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Lembar isi: kepala halaman, judul, gambar atau kumpulan gambar, teks, poin, lalu nomor halaman. */
export function LembarIsi({ m, l, nomor }: { m: Materi; l: Lembar; nomor: number }) {
  const t = TEMA[m.tema];
  const bergambar = !!(l.gambar || l.kisi);
  // Lembar yang hanya berisi tulisan dibuat seperti halaman pembuka bab: huruf besar dan teks lebih lega.
  const hanyaTeks = !bergambar && !l.poin && !l.warnaTinja;
  return (
    <Kertas tema={m.tema}>
      <KepalaLembar m={m} kanan={l.halaman ? `Buku KIA hlm. ${l.halaman}` : undefined} />

      <div className={cn("flex min-h-0 flex-1 flex-col px-6 pt-4 [container-type:inline-size]", !bergambar && "pb-4")}>
        {/* Lembar tanpa gambar diletakkan di tengah dengan margin otomatis (bukan justify-center),
            supaya tulisan yang panjang meluber ke bawah dan terukur untuk diperkecil, bukan terpotong di atas. */}
        <div className={cn("flex flex-col", bergambar ? "min-h-0 flex-1" : "my-auto")}>
          {l.nada === "bahaya" && (
            <p className="mb-3.5 flex shrink-0 items-start gap-2.5 rounded-2xl bg-merah px-4 py-3 text-sm font-semibold leading-snug text-white">
              <Siren className="mt-px size-5 shrink-0" /> Kalau mengalami, segera ke Puskesmas atau Rumah Sakit.
            </p>
          )}

          <JudulLembar judul={l.judul} tema={m.tema} besar={hanyaTeks} />

          {l.gambar && <GambarPas nama={l.gambar} alt={l.judul} />}

          {l.teks &&
            (hanyaTeks ? (
              <p
                className={cn(
                  "mt-5 shrink-0 text-[18px] leading-[1.65] text-ink/85",
                  "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[58px] first-letter:font-extrabold first-letter:leading-[0.8]",
                  HURUF_AWAL[m.tema],
                )}
              >
                {l.teks}
              </p>
            ) : (
              <p className="mt-3 shrink-0 text-[15.5px] leading-relaxed text-ink/80">{l.teks}</p>
            ))}
          {l.kisi && <KisiPas isi={l.kisi} jangan={l.nada === "jangan"} />}
          {l.warnaTinja && <KartuTinja />}
          {l.poin && <DaftarPoin poin={l.poin} nada={l.nada} titik={t.titik} />}
          {l.aksi && (
            <Link href={l.aksi.href} className={cn("mt-4 flex shrink-0 items-center justify-between gap-2 rounded-2xl px-4 py-3 font-semibold", t.lembut, t.teks)}>
              {l.aksi.label} <ChevronRight className="size-5" />
            </Link>
          )}
        </div>
      </div>

      <NomorHalaman nomor={nomor} />
    </Kertas>
  );
}

/** Nomor halaman di kaki lembar, diapit garis tipis. */
function NomorHalaman({ nomor }: { nomor: number }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-3 px-6 pb-3.5 pt-3 text-xs font-semibold tabular-nums text-[#a39a88]" aria-hidden>
      <span className="h-px w-6 bg-[#e6dccb]" />
      {nomor}
      <span className="h-px w-6 bg-[#e6dccb]" />
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
      <ol className="mt-4 shrink-0 rounded-2xl bg-[#fff6dd] px-4 py-1 ring-1 ring-[#f1dfaa]">
        {poin.map((p, i) => (
          <li key={p} className="flex gap-3 border-b border-dashed border-[#ecd79c] py-2.5 text-[15.5px] leading-snug last:border-0">
            <span className="w-4 shrink-0 text-right font-extrabold tabular-nums text-[#c27c00]">{i + 1}</span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
    );
  const merah = nada === "jangan" || nada === "bahaya";
  return (
    <ul className="mt-3 shrink-0 divide-y divide-[#efe7d8]">
      {poin.map((p) => (
        <li key={p} className="flex gap-3 py-2.5 text-[15.5px] leading-snug">
          {merah ? <span className="mt-[0.6em] h-[3px] w-3 shrink-0 rounded-full bg-merah" /> : <span className={cn("mt-[0.5em] size-[7px] shrink-0 rounded-full", titik)} />}
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kumpulan gambar berlabel (dipakai halaman Tanda bahaya). Gambar tegak dibuat 3 kolom. */
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
    <div className="mt-4 shrink-0 rounded-2xl bg-black/[0.03] p-3">
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
    <Kertas tema={m.tema}>
      <KepalaLembar m={m} kanan="Selesai dibaca" />
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-5 pt-4">
        <JudulLembar judul="Yang perlu Ibu ingat" tema={m.tema} />
        <ol className="mt-4 shrink-0 rounded-2xl bg-[#fff6dd] px-4 py-1 ring-1 ring-[#f1dfaa]">
          {m.ringkas.map((p, i) => (
            <li key={p} className="flex gap-3.5 border-b border-dashed border-[#ecd79c] py-2.5 text-[15.5px] leading-snug last:border-0">
              <span className={cn("w-4 shrink-0 text-right text-lg font-extrabold leading-[1.15] tabular-nums", t.teks)}>{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto shrink-0 space-y-2 pt-5">
          {/* replace: buku berikutnya menggantikan buku ini, jadi tombol tutup tetap kembali ke halaman sebelum buku pertama. */}
          {berikut && (
            <Link href={`/ibu/edukasi/${berikut.slug}`} replace onClick={tandaiGanti} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-[#ece4d4]">
              <span className={cn("grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl", TEMA[berikut.tema].lembut)}>
                <GambarKia nama={berikut.sampul} alt="" sizes="48px" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted">Materi berikutnya</span>
                <span className="block truncate font-semibold">{berikut.judul}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted" />
            </Link>
          )}
          <a href={urlHalamanCetak(m.halaman)} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white font-semibold text-brand ring-1 ring-[#ece4d4]">
            <BookOpen className="size-4" /> Baca halaman aslinya (PDF)
          </a>
          <button type="button" onClick={ulang} className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-semibold text-muted">
            <RotateCcw className="size-4" /> Ulangi dari awal
          </button>
        </div>
      </div>
    </Kertas>
  );
}
