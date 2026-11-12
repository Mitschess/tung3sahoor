"use client";

import { BookOpen, ChevronRight, Siren } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GambarKia } from "@/components/gambar-kia";
import { KepalaHalaman } from "@/components/kepala";
import { Memuat, Tab } from "@/components/ui";
import { MATERI, TEMA, jumlahLembar, materiUntuk, type Materi, type Tema } from "@/data/edukasi";
import type { NamaGambar } from "@/data/gambar-kia";
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

/**
 * Cara tiap ilustrasi dipasang di sampul. Gambar tegak (buah, depresi) diperbesar pada bendanya
 * supaya tulisan di bawah gambar tidak ikut; gambar yang sangat lebar digeser ke tokoh utamanya.
 */
const POTONG: Partial<Record<NamaGambar, { gambar: string; latar?: string }>> = {
  "buah-jeruk-nipis": { gambar: "object-contain scale-[1.8] origin-[50%_48%]", latar: "bg-[#fbebee]" },
  "buah-jagung": { gambar: "object-contain scale-[1.6] origin-[50%_38%]", latar: "bg-[#fbebee]" },
  "buah-semangka": { gambar: "object-contain scale-[1.45] origin-[50%_38%]", latar: "bg-[#fbebee]" },
  depresi: { gambar: "object-contain scale-[1.2] origin-[50%_46%]", latar: "bg-[#ece8f0]" },
  nifas: { gambar: "object-cover object-[41%_50%]" },
  "bayi-baru-lahir": { gambar: "object-cover object-[36%_50%]" },
  melahirkan: { gambar: "object-cover object-[35%_50%]" },
};

function Rak({ daftar, bacaan }: { daftar: Materi[]; bacaan: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-6 pr-1.5">
      {daftar.map((m) => (
        <SampulBuku key={m.slug} m={m} dibaca={bacaan[m.slug]} />
      ))}
    </div>
  );
}

/**
 * Buku di rak: sampul tegak dengan panel judul berwarna bab, ilustrasi Buku KIA di bawahnya,
 * punggung buku di kiri, tepi halaman di kanan, dan pita pembatas bila sudah selesai dibaca.
 */
function SampulBuku({ m, dibaca }: { m: Materi; dibaca?: number }) {
  const t = TEMA[m.tema];
  const total = jumlahLembar(m);
  const selesai = dibaca !== undefined && dibaca >= total - 1;
  const sedang = !selesai && !!dibaca;
  const potong = POTONG[m.sampul];
  return (
    <Link href={`/ibu/edukasi/${m.slug}`} className="group block">
      <span className="relative block aspect-[3/4.1] transition duration-200 group-hover:-translate-y-1 group-active:scale-[0.97]">
        {/* Tepi halaman yang terlihat dari samping kanan buku. */}
        <span className="absolute inset-y-[6px] -right-[5px] w-[10px] rounded-r-[4px] bg-[repeating-linear-gradient(to_right,#ffffff_0,#ffffff_1.5px,#d5dbe4_1.5px,#d5dbe4_2.5px)] shadow-[1px_2px_4px_rgb(23_60_110/0.18)]" />

        <span className={cn("absolute inset-0 flex flex-col overflow-hidden rounded-l-[5px] rounded-r-[11px] shadow-[0_14px_22px_-14px_rgb(23_60_110/0.6),0_1px_3px_rgb(23_60_110/0.22)]", t.pita)}>
          <span className="flex flex-1 flex-col pb-2 pl-[22px] pr-3 pt-3.5">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.13em] text-white/75">{m.kategori}</span>
            <span className="mt-1 line-clamp-3 text-[15px] font-extrabold leading-[1.18] text-white">{m.judul}</span>
          </span>
          <span className={cn("relative block h-[55%] shrink-0 overflow-hidden", potong?.latar ?? "bg-white")}>
            <GambarKia nama={m.sampul} alt="" sizes="45vw" className={cn("h-full w-full", potong?.gambar ?? "object-cover")} />
          </span>
          {/* Punggung buku: bidang lebih gelap, garis lipatan, dan bayangan lekukan. */}
          <span className="absolute inset-y-0 left-0 w-[11px] bg-black/[0.17]" />
          <span className="absolute inset-y-0 left-[11px] w-px bg-white/30" />
          <span className="absolute inset-y-0 left-3 w-1.5 bg-gradient-to-r from-black/[0.14] to-transparent" />
        </span>

        {selesai && <span className="absolute -top-[3px] right-4 h-10 w-[18px] bg-[#f5b50f] shadow-[0_2px_3px_rgb(0_0_0/0.22)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_76%,0_100%)]" />}
      </span>

      <span className="mt-3 block pl-0.5">
        {selesai ? (
          <span className="text-xs font-semibold text-hijau">Sudah dibaca</span>
        ) : sedang ? (
          <>
            <span className="text-xs font-semibold text-ink">
              Lembar {dibaca + 1} dari {total}
            </span>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-black/[0.08]">
              <span className={cn("block h-full rounded-full", t.pita)} style={{ width: `${Math.round(((dibaca + 1) / total) * 100)}%` }} />
            </span>
          </>
        ) : (
          <span className="text-xs text-muted">
            {total} lembar · hlm. {m.halaman}
          </span>
        )}
      </span>
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
