"use client";

import { Camera, FileCheck2, Fingerprint, Lock, ShieldCheck, Stethoscope, User, Users, UsersRound, type LucideIcon } from "lucide-react";
import { KepalaHalaman } from "@/components/kepala";
import { Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";
import { tampil } from "@/lib/tanggal";
import { cn } from "@/lib/util";

/** Privasi data: siapa yang bisa melihat, bagaimana data dijaga, dan persetujuan Ibu. */
export default function Privasi() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;
  const posyandu = String(r.ibu.profil.wilayah_posyandu);

  return (
    <div className="space-y-6 px-4 pb-6">
      <KepalaHalaman judul="Privasi data" kembali="/ibu/profil" />

      <section className="flex items-center gap-4 rounded-2xl bg-brand-soft p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface text-brand shadow-sm">
          <ShieldCheck className="size-7" />
        </span>
        <div>
          <p className="text-lg font-bold leading-tight text-brand-ink">Data Ibu dijaga</p>
          <p className="mt-0.5 text-sm text-ink/75">Hanya petugas yang melayani Ibu yang bisa melihat catatan Ibu.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-muted">Siapa yang bisa melihat</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
          <Peran ikon={User} siapa="Ibu sendiri" apa="Catatan dan jadwal Ibu. Hasil tes sensitif dijelaskan langsung oleh bidan." />
          <Peran ikon={Users} siapa={`Kader Posyandu ${posyandu}`} apa="Jadwal, hasil periksa umum, dan tanda bahaya. Tidak melihat data sensitif." />
          <Peran ikon={Stethoscope} siapa="Bidan dan dokter Puskesmas" apa="Semua catatan, termasuk data sensitif, untuk merawat Ibu." sensitif />
          <Peran ikon={UsersRound} siapa="Suami / keluarga" apa="Hanya pesan pengingat jadwal. Tidak melihat isi catatan." />
        </ul>
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-muted">Cara data Ibu dijaga</h2>
        <div className="space-y-2.5">
          <Jaga ikon={Lock} judul="Data sensitif dibatasi" teks="Tes HIV, sifilis, hepatitis B, dan skrining kesehatan jiwa hanya untuk bidan dan dokter, dan tidak pernah dikirim ke keluarga." />
          <Jaga ikon={Fingerprint} judul="NIK disamarkan" teks={`Yang tampil hanya 4 digit terakhir: ${r.ibu.nikSamaran}.`} />
          <Jaga ikon={Camera} judul="Foto Buku KIA tidak disimpan" teks="Foto dihapus setelah isinya dicek dan disimpan petugas." />
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-muted">Persetujuan Ibu</h2>
        <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
          <div className="flex items-center gap-3">
            <FileCheck2 className="size-6 shrink-0 text-hijau" />
            <p className="min-w-0 text-[15px]">
              Ibu menyetujui pada <b>{tampil(r.ibu.persetujuan.tanggal)}</b>
              <span className="block text-xs text-muted">Teks persetujuan {r.ibu.persetujuan.versi}</span>
            </p>
          </div>
          <p className="mt-3 border-t border-line pt-3 text-sm text-muted">Ibu boleh berhenti kapan saja tanpa memengaruhi pelayanan. Sampaikan ke bidan atau kader.</p>
        </div>
      </section>
    </div>
  );
}

function Peran({ ikon: Ikon, siapa, apa, sensitif }: { ikon: LucideIcon; siapa: string; apa: string; sensitif?: boolean }) {
  return (
    <li className="flex gap-3.5 px-4 py-3.5">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", sensitif ? "bg-ungu-soft text-ungu" : "bg-brand-soft text-brand")}>
        <Ikon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{siapa}</p>
        <p className="text-sm text-muted">{apa}</p>
      </div>
    </li>
  );
}

function Jaga({ ikon: Ikon, judul, teks }: { ikon: LucideIcon; judul: string; teks: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
      <Ikon className="mt-0.5 size-5 shrink-0 text-brand" />
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{judul}</p>
        <p className="text-sm text-muted">{teks}</p>
      </div>
    </div>
  );
}
