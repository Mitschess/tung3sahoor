"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { useState } from "react";
import { KepalaHalaman } from "@/components/kepala";
import { Lencana, Memuat, Tab } from "@/components/ui";
import { MATERI, materiUntuk, type Materi } from "@/data/edukasi";
import { useRingkasan } from "@/lib/hooks";
import { urlHalamanCetak } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";

export default function Edukasi() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const [mode, setMode] = useState<"tahap" | "semua">("tahap");
  if (!r) return <Memuat />;
  const untukTahap = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? MATERI : materiUntuk(r.tahap.kode);
  const daftar = mode === "tahap" ? untukTahap : MATERI;
  return (
    <div className="space-y-4 px-4">
      <KepalaHalaman judul="Edukasi" sub="Ringkasan dari Buku KIA 2024, lengkap dengan halamannya" kembali="/ibu" />
      <Tab
        nilai={mode}
        setNilai={setMode}
        pilihan={[
          { nilai: "tahap", label: `Untuk Ibu sekarang (${untukTahap.length})` },
          { nilai: "semua", label: "Semua tahap" },
        ]}
      />
      <div className="space-y-3">
        {daftar.map((m) => (
          <KartuMateri key={m.slug} m={m} />
        ))}
      </div>
      <a href={urlHalamanCetak(3)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-4 text-sm font-semibold text-brand">
        <BookOpen className="size-4" /> Buka seluruh Buku KIA 2024 (PDF)
      </a>
    </div>
  );
}

function KartuMateri({ m }: { m: Materi }) {
  return (
    <article id={m.slug} className="scroll-mt-20 rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <Lencana warna="brand">{m.kategori}</Lencana>
        <span className="text-xs text-muted">Buku KIA hlm. {m.halaman}</span>
      </div>
      <h2 className="mt-2 text-lg font-bold leading-snug">{m.judul}</h2>
      <ul className="mt-3 space-y-2">
        {m.ringkas.map((b) => (
          <li key={b} className="flex gap-2 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            {b}
          </li>
        ))}
      </ul>
      <a href={urlHalamanCetak(m.halaman)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
        Baca lengkap di Buku KIA <ExternalLink className="size-3.5" />
      </a>
    </article>
  );
}
