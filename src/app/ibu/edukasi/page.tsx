"use client";

import { BookOpen, ChevronRight, Siren } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GambarKia, rasio } from "@/components/gambar-kia";
import { KepalaHalaman } from "@/components/kepala";
import { Memuat, Tab } from "@/components/ui";
import { MATERI, TEMA, jumlahLembar, materiUntuk, type Materi, type Tema } from "@/data/edukasi";
import { useRingkasan } from "@/lib/hooks";
import { urlHalamanCetak } from "@/lib/kamus";
import { usePengguna, useStore } from "@/lib/store";
import { cn } from "@/lib/util";

const URUTAN_BAB: Tema[] = ["rose", "brand", "ungu", "hijau", "teal"];

export default function Edukasi() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const bacaan = useStore((s) => s.bacaan);
  const router = useRouter();
  const [mode, setMode] = useState<"tahap" | "semua">("tahap");

  // Tautan lama berbentuk /ibu/edukasi#slug langsung dibuka sebagai buku.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && MATERI.some((m) => m.slug === id)) router.replace(`/ibu/edukasi/${id}`);
  }, [router]);

  if (!r) return <Memuat />;
  const untukTahap = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? MATERI : materiUntuk(r.tahap.kode);
  const lanjut = MATERI.find((m) => (bacaan[m.slug] ?? 0) > 0 && (bacaan[m.slug] ?? 0) < jumlahLembar(m) - 1);

  return (
    <div className="space-y-5 px-4">
      <KepalaHalaman judul="Edukasi" sub="Buku bergambar dari Buku KIA 2024" kembali="/ibu" />

      {lanjut && <KartuLanjut m={lanjut} dibaca={bacaan[lanjut.slug] ?? 0} />}

      <Link href="/ibu/tanda-bahaya" className="flex items-center gap-3 rounded-2xl bg-merah-soft p-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-merah text-white">
          <Siren className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-merah">Tanda bahaya bergambar</span>
          <span className="block text-xs text-ink/70">Kenali dengan melihat gambarnya</span>
        </span>
        <ChevronRight className="size-5 text-merah" />
      </Link>

      <Tab
        nilai={mode}
        setNilai={setMode}
        pilihan={[
          { nilai: "tahap", label: `Untuk Ibu sekarang (${untukTahap.length})` },
          { nilai: "semua", label: `Semua (${MATERI.length})` },
        ]}
      />

      {mode === "tahap" ? (
        <Rak daftar={untukTahap} bacaan={bacaan} />
      ) : (
        URUTAN_BAB.map((tema) => {
          const isi = MATERI.filter((m) => m.tema === tema);
          return (
            <section key={tema} className="space-y-3">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <span className={cn("h-4 w-1.5 rounded-full", TEMA[tema].pita)} />
                {TEMA[tema].bab}
              </h2>
              <Rak daftar={isi} bacaan={bacaan} />
            </section>
          );
        })
      )}

      <a href={urlHalamanCetak(3)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-4 text-sm font-semibold text-brand">
        <BookOpen className="size-4" /> Buka seluruh Buku KIA 2024 (PDF)
      </a>
      <p className="pb-2 text-center text-[11px] text-muted">Ilustrasi dan isi: Buku Kesehatan Ibu dan Anak, Kementerian Kesehatan RI, 2024.</p>
    </div>
  );
}

function Rak({ daftar, bacaan }: { daftar: Materi[]; bacaan: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {daftar.map((m) => (
        <SampulBuku key={m.slug} m={m} dibaca={bacaan[m.slug]} />
      ))}
    </div>
  );
}

/** Sampul buku di rak: punggung buku berwarna sesuai bab, gambar dari Buku KIA, dan kemajuan baca. */
function SampulBuku({ m, dibaca }: { m: Materi; dibaca?: number }) {
  const t = TEMA[m.tema];
  const total = jumlahLembar(m);
  const selesai = dibaca !== undefined && dibaca >= total - 1;
  const persen = dibaca ? Math.round(((dibaca + 1) / total) * 100) : 0;
  return (
    <Link href={`/ibu/edukasi/${m.slug}`} className="group relative flex flex-col overflow-hidden rounded-[18px] rounded-l-[6px] bg-surface shadow-[var(--shadow-kartu)] transition active:scale-[0.98]">
      <span className={cn("absolute inset-y-0 left-0 z-10 w-2", t.pita)} />
      <span className="absolute inset-y-0 left-2 z-10 w-px bg-black/10" />
      <div className={cn("ml-2 grid h-28 place-items-center overflow-hidden", t.lembut)}>
        <GambarKia nama={m.sampul} alt="" sizes="45vw" className={cn(rasio(m.sampul) < 1 ? "h-28 w-auto" : "h-28 w-full object-cover")} />
      </div>
      <div className="ml-2 flex flex-1 flex-col p-3">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", t.teks)}>{m.kategori}</span>
        <span className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug">{m.judul}</span>
        <span className={cn("mt-auto pt-2 text-xs", selesai ? "font-semibold text-hijau" : "text-muted")}>{selesai ? "Sudah dibaca" : `${total} lembar · hlm. ${m.halaman}`}</span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-black/[0.07]">
          <span className={cn("block h-full rounded-full", selesai ? "bg-hijau" : t.pita)} style={{ width: `${selesai ? 100 : persen}%` }} />
        </span>
      </div>
      {selesai && (
        <span className="absolute right-3 top-0 z-10 h-9 w-6 bg-hijau shadow-sm [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" title="Sudah dibaca">
          <span className="sr-only">Sudah dibaca</span>
        </span>
      )}
    </Link>
  );
}

function KartuLanjut({ m, dibaca }: { m: Materi; dibaca: number }) {
  const t = TEMA[m.tema];
  const total = jumlahLembar(m);
  return (
    <Link href={`/ibu/edukasi/${m.slug}`} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-kartu)]">
      <span className={cn("grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl", t.lembut)}>
        <GambarKia nama={m.sampul} alt="" sizes="64px" className="h-full w-full object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-muted">Lanjutkan membaca</span>
        <span className="block truncate font-bold">{m.judul}</span>
        <span className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          <span className="block h-1 flex-1 overflow-hidden rounded-full bg-black/[0.07]">
            <span className={cn("block h-full rounded-full", t.pita)} style={{ width: `${Math.round(((dibaca + 1) / total) * 100)}%` }} />
          </span>
          {dibaca + 1}/{total}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted" />
    </Link>
  );
}
