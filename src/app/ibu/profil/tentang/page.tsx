"use client";

import { ExternalLink, TriangleAlert } from "lucide-react";
import { Ilustrasi, type NamaIlustrasi } from "@/components/ilustrasi";
import { KepalaHalaman } from "@/components/kepala";
import { LogoMark } from "@/components/logo";
import { kamus } from "@/lib/kamus";

const KEGUNAAN: { gambar: NamaIlustrasi; judul: string; teks: string }[] = [
  { gambar: "jadwal", judul: "Ingat jadwal periksa", teks: "K1–K6, kunjungan nifas, dan kunjungan bayi." },
  { gambar: "pantau", judul: "Pantau kondisi Ibu dan bayi", teks: "Cukup ketuk gambar keluhan yang dialami." },
  { gambar: "bahaya", judul: "Kenali tanda bahaya", teks: "Bergambar, dengan arahan kapan harus ke Puskesmas." },
  { gambar: "buku", judul: "Belajar dari buku bergambar", teks: "Materi Buku KIA sesuai tahap Ibu." },
];

/** Tentang MOMCARE: apa gunanya, dari mana isinya, dan batasannya. */
export default function Tentang() {
  return (
    <div className="space-y-6 px-4 pb-6">
      <KepalaHalaman judul="Tentang MOMCARE" kembali="/ibu/profil" />

      <section className="flex flex-col items-center rounded-2xl bg-surface px-5 py-6 text-center shadow-[var(--shadow-kartu)]">
        <LogoMark className="size-16" />
        <p className="mt-3 text-2xl font-extrabold tracking-tight">MOMCARE</p>
        <p className="text-sm text-muted">Buku KIA yang tidak berhenti di kertas</p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
          MOMCARE membantu Ibu, kader, bidan, dan dokter memakai isi Buku KIA setiap hari, dari masa hamil sampai bayi berusia 28 hari.
        </p>
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-muted">Yang bisa Ibu lakukan</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
          {KEGUNAAN.map((k) => (
            <li key={k.judul} className="flex items-center gap-3.5 px-4 py-3">
              <Ilustrasi nama={k.gambar} className="size-12 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{k.judul}</p>
                <p className="text-sm text-muted">{k.teks}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-muted">Sumber isi</h2>
        <a href={kamus.url_pdf} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
          <Ilustrasi nama="bukuKia" className="size-12 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-snug">Buku Kesehatan Ibu dan Anak 2024</span>
            <span className="block text-sm text-muted">Kementerian Kesehatan RI · buka PDF</span>
          </span>
          <ExternalLink className="size-[18px] shrink-0 text-muted" />
        </a>
      </section>

      <p className="flex items-start gap-3 rounded-2xl bg-kuning-soft p-4 text-sm text-ink/80">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-kuning" />
        MOMCARE tidak menggantikan Buku KIA dan pemeriksaan tenaga kesehatan. Bila ada tanda bahaya, segera ke fasilitas kesehatan terdekat.
      </p>

      <p className="text-center text-xs text-muted">Versi demo · semua data di aplikasi ini adalah data contoh</p>
    </div>
  );
}
