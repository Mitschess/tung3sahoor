"use client";

import { AlertOctagon, Baby, BookOpen, Brain, ChevronRight, ClipboardCheck, FileHeart, HeartHandshake, Milk, PackageCheck, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { KartuTahap, DaftarJadwal } from "@/components/tahap";
import { JudulBagian, Kartu, Kosong, Memuat, TitikLevel } from "@/components/ui";
import { useRingkasan, useSekarang } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";
import { tugasHariIni } from "@/lib/tugas";
import { cn } from "@/lib/util";

interface Kotak {
  href: string;
  label: string;
  sub: string;
  ikon: typeof Baby;
}

/** Tiga set kotak ungu (spesifikasi bagian 3): isinya diambil dari bagian Buku KIA sesuai tahap. */
function kotakUntuk(set: SetMenu, ukMinggu = 0): Kotak[] {
  if (set === "hamil") {
    const k: Kotak[] = [
      { href: "/ibu/pantau", label: "Pantau", sub: "Lembar mingguan", ikon: ClipboardCheck },
      { href: "/ibu/hasil", label: "Hasil periksa", sub: "K1–K6, dokter, lab", ikon: FileHeart },
      { href: "/ibu/tanda-bahaya", label: "Tanda bahaya", sub: "Kenali & bertindak", ikon: ShieldAlert },
      { href: "/ibu/edukasi#jiwa-hamil", label: "Kesehatan jiwa", sub: "Cemas itu wajar", ikon: Brain },
      { href: "/ibu/edukasi", label: "Edukasi", sub: "Sesuai usia hamil", ikon: BookOpen },
    ];
    if (ukMinggu > 12) k.splice(2, 0, { href: "/ibu/persiapan", label: "Persiapan melahirkan", sub: "Ceklis P4K", ikon: PackageCheck });
    return k;
  }
  if (set === "nifas")
    return [
      { href: "/ibu/pantau?lembar=nifas", label: "Pantau ibu", sub: "Harian, hari 1–42", ikon: ClipboardCheck },
      { href: "/ibu/pantau?lembar=bayi", label: "Pantau bayi", sub: "Harian, 0–28 hari", ikon: Baby },
      { href: "/ibu/hasil", label: "Hasil periksa", sub: "KF, KN, persalinan", ikon: FileHeart },
      { href: "/ibu/tanda-bahaya", label: "Tanda bahaya", sub: "Ibu & bayi", ikon: ShieldAlert },
      { href: "/ibu/edukasi#menyusui", label: "Menyusui", sub: "Posisi & pelekatan", ikon: Milk },
      { href: "/ibu/kb", label: "KB", sub: "Pilih metode", ikon: HeartHandshake },
      { href: "/ibu/edukasi#baby-blues", label: "Kesehatan jiwa", sub: "Baby blues", ikon: Brain },
      { href: "/ibu/edukasi", label: "Edukasi", sub: "Nifas & bayi", ikon: BookOpen },
    ];
  return [{ href: "/ibu/edukasi", label: "Edukasi", sub: "Informasi umum", ikon: BookOpen }];
}

export default function BerandaIbu() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const now = useSekarang();
  if (!r) return <Memuat />;
  const tugas = tugasHariIni(r, now);
  const kotak = kotakUntuk(r.tahap.set, r.tahap.ukMinggu);
  const merah = r.peringatan.filter((p) => p.level === "merah");

  return (
    <div className="space-y-6 px-4 pt-5">
      <KartuTahap t={r.tahap} nama={String(r.ibu.profil.nama)} />

      {merah.length > 0 && (
        <Link href="/ibu/tanda-bahaya" className="flex items-center gap-3 rounded-2xl border border-merah/30 bg-merah-soft p-4">
          <AlertOctagon className="size-6 shrink-0 text-merah" />
          <div className="flex-1 text-sm">
            <p className="font-bold text-merah">Perlu diperiksa bidan hari ini</p>
            <p className="text-ink/80">{merah.map((m) => m.judul).join(" · ")}</p>
          </div>
          <ChevronRight className="size-5 text-merah" />
        </Link>
      )}

      <section>
        <JudulBagian>Hari ini</JudulBagian>
        {tugas.length === 0 ? (
          <Kosong ikon={<Sparkles className="size-7 text-brand" />} judul="Semua beres untuk hari ini" teks="Tetap minum tablet tambah darah dan istirahat cukup ya, Bu." />
        ) : (
          <div className="space-y-2">
            {tugas.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link
                  href={t.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-surface p-4 transition hover:shadow-md",
                    t.nada === "merah" ? "border-merah/30" : t.nada === "kuning" ? "border-kuning/40" : "border-line",
                  )}
                >
                  <TitikLevel level={t.nada === "merah" ? "merah" : t.nada === "kuning" ? "kuning" : "hijau"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{t.judul}</p>
                    <p className="text-sm text-muted">{t.teks}</p>
                  </div>
                  <ChevronRight className="size-5 text-muted" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <JudulBagian>Mau buka apa lagi?</JudulBagian>
        <div className="grid grid-cols-2 gap-3">
          {kotak.map(({ href, label, sub, ikon: Ikon }, i) => (
            <motion.div key={href} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
              <Link href={href} className="group flex h-full flex-col justify-between gap-6 rounded-3xl bg-brand-soft p-4 transition hover:bg-[#e6dcfd]">
                <span className="grid size-10 place-items-center rounded-2xl bg-brand text-white shadow-[0_8px_16px_-8px_var(--brand)] transition group-hover:scale-105">
                  <Ikon className="size-5" />
                </span>
                <span>
                  <span className="block font-bold leading-tight text-brand-ink">{label}</span>
                  <span className="text-xs text-brand-ink/70">{sub}</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {r.jadwal.length > 0 && (
        <section>
          <JudulBagian aksi={<Link href="/ibu/hasil" className="text-sm font-semibold text-brand">Semua</Link>}>Jadwal periksa berikutnya</JudulBagian>
          <DaftarJadwal js={r.jadwal} ringkas />
        </section>
      )}

      <Kartu className="bg-surface/70 text-xs text-muted">
        MOMCARE tidak menggantikan Buku KIA dan pemeriksaan bidan. Bila ada tanda bahaya, segera ke fasilitas kesehatan terdekat.
      </Kartu>
    </div>
  );
}
