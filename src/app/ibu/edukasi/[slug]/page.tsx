"use client";

import { BookX } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Flipbook } from "@/components/flipbook";
import { LembarIsi, LembarPenutup, LembarSampul } from "@/components/lembar-materi";
import { Kosong, Memuat, TautanTombol } from "@/components/ui";
import { MATERI, TEMA, cariMateri, jumlahLembar, materiUntuk, type Materi } from "@/data/edukasi";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";

export default function BacaMateri() {
  const { slug } = useParams<{ slug: string }>();
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const m = cariMateri(slug);

  if (!r) return <Memuat />;
  if (!m)
    return (
      <div className="px-4 pt-16">
        <Kosong ikon={<BookX className="size-8" />} judul="Materi tidak ditemukan" aksi={<TautanTombol href="/ibu/edukasi">Kembali ke Edukasi</TautanTombol>} />
      </div>
    );

  const urutan = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? MATERI : materiUntuk(r.tahap.kode);
  const posisi = urutan.findIndex((x) => x.slug === m.slug);
  const berikut = posisi >= 0 ? urutan[posisi + 1] : MATERI[MATERI.findIndex((x) => x.slug === m.slug) + 1];
  return <Buku key={m.slug} m={m} berikut={berikut} />;
}

function Buku({ m, berikut }: { m: Materi; berikut?: Materi }) {
  const router = useRouter();
  const catat = useStore((s) => s.catatBacaan);
  const total = jumlahLembar(m);
  // Lanjutkan dari lembar terjauh yang sudah dibaca, kecuali materi sudah selesai.
  const [awal] = useState(() => {
    const sudah = useStore.getState().bacaan[m.slug] ?? 0;
    return sudah >= total - 1 ? 0 : sudah;
  });
  const onUbah = useCallback((i: number) => catat(m.slug, i), [catat, m.slug]);

  // Unduh semua gambar materi sejak awal supaya tidak berkedip saat halaman dibalik.
  useEffect(() => {
    for (const l of m.lembar) for (const g of [l.gambar, ...(l.kisi ?? []).map((k) => k.gambar)]) if (g) new window.Image().src = `/kia/${g}.webp`;
  }, [m]);

  const t = TEMA[m.tema];
  return (
    <Flipbook
      jumlah={total}
      awal={awal}
      judul={m.judul}
      label={`${t.bab} · Buku KIA`}
      warna={{ teks: t.teks, isi: t.pita }}
      onUbah={onUbah}
      onTutup={() => router.push("/ibu/edukasi")}
      render={(i, ke) => (i === 0 ? <LembarSampul m={m} /> : i === total - 1 ? <LembarPenutup m={m} berikut={berikut} ulang={() => ke(0)} /> : <LembarIsi m={m} l={m.lembar[i - 1]} nomor={i + 1} />)}
    />
  );
}
