"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Ilustrasi, type NamaIlustrasi } from "@/components/ilustrasi";
import { Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";

interface Fitur {
  label: string;
  href: string;
  gambar: NamaIlustrasi;
  luar?: boolean;
}
interface Kategori {
  judul: string;
  untuk: SetMenu[] | "semua";
  item: Fitur[];
}

const KATEGORI: Kategori[] = [
  {
    judul: "Kehamilan",
    untuk: ["hamil"],
    item: [
      { label: "Pantau Mingguan", href: "/ibu/pantau", gambar: "pantau" },
      { label: "Hasil Periksa", href: "/ibu/hasil", gambar: "hasil" },
      { label: "Persiapan Melahirkan", href: "/ibu/persiapan", gambar: "persiapan" },
      { label: "Grafik Berat Badan", href: "/ibu/hasil#grafik", gambar: "grafik" },
      { label: "Jadwal Periksa", href: "/ibu/hasil", gambar: "jadwal" },
      { label: "Gerak Janin", href: "/ibu/pantau", gambar: "gerak" },
    ],
  },
  {
    judul: "Nifas & Bayi Baru Lahir",
    untuk: ["nifas"],
    item: [
      { label: "Pantau Nifas", href: "/ibu/pantau?lembar=nifas", gambar: "pantau-nifas" },
      { label: "Pantau Bayi", href: "/ibu/pantau?lembar=bayi", gambar: "bayi" },
      { label: "Hasil Periksa", href: "/ibu/hasil", gambar: "hasil" },
      { label: "Menyusui", href: "/ibu/edukasi/menyusui", gambar: "asi" },
      { label: "Keluarga Berencana", href: "/ibu/kb", gambar: "kb" },
      { label: "Jadwal KF & KN", href: "/ibu/hasil", gambar: "jadwal" },
    ],
  },
  {
    judul: "Deteksi Risiko",
    untuk: "semua",
    item: [
      { label: "Tanda Bahaya", href: "/ibu/tanda-bahaya", gambar: "bahaya" },
      { label: "Kesehatan Jiwa", href: "/ibu/edukasi/jiwa-hamil", gambar: "jiwa" },
      { label: "Baby Blues", href: "/ibu/edukasi/baby-blues", gambar: "awan" },
    ],
  },
  {
    judul: "Edukasi",
    untuk: "semua",
    item: [
      { label: "Buku Edukasi Bergambar", href: "/ibu/edukasi", gambar: "buku" },
      { label: "Proses Melahirkan", href: "/ibu/edukasi/melahirkan", gambar: "rs" },
      { label: "Bayi Baru Lahir", href: "/ibu/edukasi/bayi-baru-lahir", gambar: "bedong" },
      { label: "Merawat Bayi", href: "/ibu/edukasi/perawatan-bayi", gambar: "mandi" },
      { label: "ASI Perah", href: "/ibu/edukasi/asi-perah", gambar: "toples" },
      { label: "Buku KIA 2024 (PDF)", href: kamus.url_pdf, gambar: "bukuKia", luar: true },
    ],
  },
  {
    judul: "Layanan",
    untuk: "semua",
    item: [
      { label: "Telepon Darurat 119", href: "tel:119", gambar: "telepon", luar: true },
      { label: "Buku KIA Saya", href: "/ibu/catatan", gambar: "catatan" },
      { label: "Profil & Keluarga", href: "/ibu/profil", gambar: "keluarga" },
    ],
  },
];

export default function HalamanFitur() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const [q, setQ] = useState("");
  if (!r) return <Memuat />;

  const qq = q.trim().toLowerCase();
  const daftar = KATEGORI.filter((k) => k.untuk === "semua" || k.untuk.includes(r.tahap.set))
    .map((k) => ({ ...k, item: k.item.filter((f) => !qq || f.label.toLowerCase().includes(qq) || k.judul.toLowerCase().includes(qq)) }))
    .filter((k) => k.item.length);

  return (
    <div className="px-4 pt-5">
      <h1 className="mb-4 text-xl font-bold">Fitur</h1>
      <label className="relative block">
        <span className="sr-only">Cari fitur</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari Fitur"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-4 pr-11 text-[15px] outline-none placeholder:text-[#9aa4b1] focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
      </label>

      <div className="mt-6 space-y-7">
        {daftar.map((k) => (
          <section key={k.judul}>
            <h2 className="mb-3 text-[17px] font-bold">{k.judul}</h2>
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {k.item.map((f) => (
                <ItemFitur key={f.label} f={f} />
              ))}
            </div>
          </section>
        ))}
        {daftar.length === 0 && <p className="py-10 text-center text-sm text-muted">Fitur &ldquo;{q}&rdquo; tidak ditemukan.</p>}
      </div>
    </div>
  );
}

function ItemFitur({ f }: { f: Fitur }) {
  const isi = (
    <>
      <Ilustrasi nama={f.gambar} className="size-[60px] transition duration-150 group-hover:-translate-y-0.5 group-active:scale-95" />
      <span className="text-center text-xs leading-tight text-ink">{f.label}</span>
    </>
  );
  const kelas = "group flex flex-col items-center gap-1.5";
  return f.luar ? (
    <a href={f.href} target={f.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={kelas}>
      {isi}
    </a>
  ) : (
    <Link href={f.href} className={kelas}>
      {isi}
    </Link>
  );
}
