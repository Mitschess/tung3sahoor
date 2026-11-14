"use client";

import { AlertOctagon, Baby, CalendarClock, ChevronRight, ClipboardList, HeartPulse, Luggage, Phone, ShieldAlert, Stethoscope, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Ilustrasi } from "@/components/ilustrasi";
import { TombolSos } from "@/components/sos";
import { DaftarJadwal, KartuTahap } from "@/components/tahap";
import { Memuat } from "@/components/ui";
import { useRingkasan, useSekarang } from "@/lib/hooks";
import { hitungStatus, type StatusKesehatan } from "@/lib/status-ibu";
import { usePengguna } from "@/lib/store";
import { tugasHariIni, type Tugas } from "@/lib/tugas";
import { cn, namaDepan } from "@/lib/util";

const JUDUL = "text-[17px] font-bold";

/** Ikon tiap jenis tugas, supaya Ibu langsung tahu jenisnya tanpa membaca. */
const IKON_TUGAS: Record<string, LucideIcon> = {
  pantau: ClipboardList,
  "pantau-nifas": HeartPulse,
  "pantau-bayi": Baby,
  kembali: CalendarClock,
  jadwal: Stethoscope,
  persiapan: Luggage,
};

export default function BerandaIbu() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const now = useSekarang();
  if (!r) return <Memuat />;

  const tugas = tugasHariIni(r, now);
  const merah = [...new Set(r.peringatan.filter((p) => p.level === "merah").map((p) => p.judul))];
  const status = hitungStatus(r);

  return (
    <div className="space-y-5 px-4 pt-5">
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold leading-tight">Halo, Bu {namaDepan(r.ibu.profil.nama)}</p>
          <p className="truncate text-sm text-muted">Posyandu {String(r.ibu.profil.wilayah_posyandu)}</p>
        </div>
        <TombolSos />
      </header>

      {/* Hal mendesak tampil paling atas, sebelum informasi kehamilan. */}
      {merah.length > 0 && <KotakMerah judul={merah} faskes={String(r.ibu.profil.faskes_tk1 ?? "Puskesmas")} />}

      <KartuTahap t={r.tahap} href="/ibu/hasil" />

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className={JUDUL}>Hari ini</h2>
          <p className="text-sm text-muted">{now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        {tugas.length === 0 ? (
          <div className="flex items-center gap-3 pt-3">
            <Ilustrasi nama="tanaman" className="size-14 shrink-0" />
            <p className="text-sm text-muted">
              <b className="block text-[15px] text-ink">Tidak ada tugas hari ini</b>
              Tetap minum tablet tambah darah ya, Bu.
            </p>
          </div>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {tugas.map((t) => (
              <li key={t.id}>
                <BarisTugas t={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {status.length > 0 && (
        <section>
          <h2 className={cn(JUDUL, "mb-3")}>Hasil periksa terakhir</h2>
          <div className="grid grid-cols-2 gap-3">
            {status.map((s) => (
              <KartuStatus key={s.id} s={s} />
            ))}
          </div>
        </section>
      )}

      {r.jadwal.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={JUDUL}>Jadwal periksa</h2>
            <Link href="/ibu/hasil" className="text-[15px] font-semibold text-brand">
              Semua
            </Link>
          </div>
          <DaftarJadwal js={r.jadwal} ringkas />
        </section>
      )}

      <p className="px-2 pb-2 text-center text-xs text-muted">Rangkul tidak menggantikan Buku KIA dan pemeriksaan bidan. Bila ada tanda bahaya, segera ke fasilitas kesehatan terdekat.</p>
    </div>
  );
}

/** Peringatan merah: apa yang ditemukan, ke mana harus pergi, dan jalan pintas bila darurat. */
function KotakMerah({ judul, faskes }: { judul: string[]; faskes: string }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)] ring-1 ring-merah/25">
      <div className="flex items-center gap-3 bg-merah px-4 py-3 text-white">
        <AlertOctagon className="size-6 shrink-0" />
        <div className="min-w-0">
          <p className="font-bold leading-tight">Segera periksa ke bidan hari ini</p>
          <p className="text-xs text-white/85">Ditemukan dari catatan Buku KIA Ibu</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <ul className="space-y-1.5 text-[15px] font-semibold leading-snug">
          {judul.map((j) => (
            <li key={j} className="flex gap-2.5">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-merah" aria-hidden />
              {j}
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-sm text-ink/75">
          Datang ke {faskes} atau hubungi bidan. Bila ada perdarahan, kejang, atau sesak napas, langsung telepon 119.
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <a href="tel:119" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-merah font-semibold text-white transition active:scale-[0.98]">
            <Phone className="size-4" /> Telepon 119
          </a>
          <Link href="/ibu/tanda-bahaya" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-merah-soft font-semibold text-merah transition active:scale-[0.98]">
            <ShieldAlert className="size-4" /> Tanda bahaya
          </Link>
        </div>
      </div>
    </section>
  );
}

function BarisTugas({ t }: { t: Tugas }) {
  const Ikon = IKON_TUGAS[t.id] ?? ClipboardList;
  return (
    <Link href={t.href} className="flex items-center gap-3 py-3">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", t.nada === "kuning" ? "bg-kuning-soft text-kuning" : "bg-brand-soft text-brand")}>
        <Ikon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug">{t.judul}</span>
        <span className="block text-sm text-muted">{t.teks}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted" />
    </Link>
  );
}

const WARNA_NADA: Record<StatusKesehatan["nada"], string> = {
  merah: "bg-merah-soft text-merah",
  kuning: "bg-kuning-soft text-kuning",
  hijau: "bg-hijau-soft text-hijau",
};

function KartuStatus({ s }: { s: StatusKesehatan }) {
  return (
    <Link href={s.href} className="flex flex-col rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)] transition active:scale-[0.99]">
      <p className="text-sm font-semibold text-muted">{s.judul}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">
        {s.nilai} <span className="text-sm font-semibold text-muted">{s.satuan}</span>
      </p>
      <div className="mt-2">
        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", WARNA_NADA[s.nada])}>{s.label}</span>
        <p className="mt-1 text-xs text-muted">{s.ket}</p>
      </div>
    </Link>
  );
}
