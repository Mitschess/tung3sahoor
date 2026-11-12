"use client";

import { ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Ilustrasi, type NamaIlustrasi } from "@/components/ilustrasi";
import { Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";

interface Fitur {
  label: string;
  teks: string;
  href: string;
  gambar: NamaIlustrasi;
  untuk?: SetMenu[];
  luar?: boolean;
}

/** Satu baris = satu tujuan. Catatan dan Profil sudah ada di menu bawah, jadi tidak diulang di sini. */
const FITUR: Fitur[] = [
  { label: "Pantau mingguan", teks: "Ketuk gambar keluhan yang Ibu alami", href: "/ibu/pantau", gambar: "pantau", untuk: ["hamil"] },
  { label: "Pantau nifas", teks: "Kondisi Ibu setiap hari sampai hari ke-42", href: "/ibu/pantau?lembar=nifas", gambar: "pantau-nifas", untuk: ["nifas"] },
  { label: "Pantau bayi", teks: "Kondisi bayi setiap hari sampai 28 hari", href: "/ibu/pantau?lembar=bayi", gambar: "bayi", untuk: ["nifas"] },
  { label: "Jadwal & grafik", teks: "Jadwal periksa dan grafik berat badan", href: "/ibu/hasil", gambar: "jadwal", untuk: ["hamil"] },
  { label: "Jadwal kunjungan", teks: "Kunjungan nifas dan kunjungan bayi", href: "/ibu/hasil", gambar: "jadwal", untuk: ["nifas"] },
  { label: "Persiapan melahirkan", teks: "10 hal yang disiapkan bersama keluarga", href: "/ibu/persiapan", gambar: "persiapan", untuk: ["hamil"] },
  { label: "Keluarga berencana", teks: "Pilih KB sebelum hari ke-42", href: "/ibu/kb", gambar: "kb", untuk: ["nifas"] },
  { label: "Tanda bahaya", teks: "Kenali lewat gambar, lalu segera periksa", href: "/ibu/tanda-bahaya", gambar: "bahaya" },
  { label: "Buku edukasi", teks: "Materi bergambar sesuai tahap Ibu", href: "/ibu/edukasi", gambar: "buku" },
  { label: "Buku KIA 2024", teks: "Buku asli dari Kemenkes (PDF)", href: kamus.url_pdf, gambar: "bukuKia", luar: true },
];

export default function HalamanFitur() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;

  const daftar = FITUR.filter((f) => !f.untuk || f.untuk.includes(r.tahap.set));

  return (
    <div className="px-4 pt-5">
      <h1 className="mb-4 text-xl font-bold">Fitur</h1>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
        {daftar.map((f) => (
          <li key={f.label}>
            <ItemFitur f={f} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemFitur({ f }: { f: Fitur }) {
  const isi = (
    <>
      <Ilustrasi nama={f.gambar} className="size-14 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold leading-snug">{f.label}</span>
        <span className="block text-sm text-muted">{f.teks}</span>
      </span>
      {f.luar ? <ExternalLink className="size-[18px] shrink-0 text-muted" /> : <ChevronRight className="size-5 shrink-0 text-muted" />}
    </>
  );
  const kelas = "flex items-center gap-3.5 px-4 py-3 transition active:bg-bg";
  return f.luar ? (
    <a href={f.href} target="_blank" rel="noreferrer" className={kelas}>
      {isi}
    </a>
  ) : (
    <Link href={f.href} className={kelas}>
      {isi}
    </Link>
  );
}
