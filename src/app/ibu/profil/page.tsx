"use client";

import { ChevronRight, CreditCard, HeartHandshake, Info, LogOut, Phone, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { cn, inisial } from "@/lib/util";

export default function Profil() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const keluar = useStore((s) => s.keluar);
  const router = useRouter();
  if (!r) return <Memuat />;
  const p = r.ibu.profil;
  const k = r.ibu.keluarga;
  const pendamping = k.nama_pendamping ? `${String(k.nama_pendamping)} (${String(k.hubungan ?? "pendamping")})` : "Belum diisi";

  return (
    <div className="space-y-6 px-4 pt-5">
      <h1 className="text-xl font-bold">Profil</h1>

      <section className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand-ink" aria-hidden>
          {inisial(p.nama)}
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-[17px] font-bold leading-tight">{String(p.nama)}</p>
          <p className="text-sm text-muted">{r.tahap.label}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Phone className="size-3.5" /> {String(p.telepon ?? "–")}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CreditCard className="size-3.5" /> NIK {r.ibu.nikSamaran}
          </p>
        </div>
      </section>

      <Grup judul="Data Ibu">
        <Baris2 ikon={Users} label="Suami / Keluarga" sub={pendamping} href="/ibu/profil/keluarga" />
        <Baris2 ikon={HeartHandshake} label={`Posyandu ${String(p.wilayah_posyandu)}`} sub={String(p.puskesmas_domisili ?? p.faskes_tk1 ?? "")} />
        <Baris2 ikon={ShieldCheck} label="Privasi data" sub="Siapa saja yang bisa melihat data Ibu" href="/ibu/profil/privasi" />
      </Grup>

      <Grup judul="Lainnya">
        <Baris2 ikon={Info} label="Tentang MOMCARE" sub="Kegunaan, sumber isi, dan batasan" href="/ibu/profil/tentang" />
        <Baris2
          ikon={LogOut}
          label="Keluar"
          onClick={() => {
            keluar();
            router.push("/masuk");
          }}
        />
      </Grup>
    </div>
  );
}

function Grup({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-sm font-semibold text-muted">{judul}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">{children}</div>
    </section>
  );
}

function Baris2({ ikon: Ikon, label, sub, onClick, href }: { ikon: LucideIcon; label: string; sub?: string; onClick?: () => void; href?: string }) {
  const isi = (
    <>
      <Ikon className="size-6 shrink-0 text-brand" strokeWidth={1.8} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px]">{label}</span>
        {sub && <span className="block truncate text-xs text-muted">{sub}</span>}
      </span>
      {(onClick || href) && <ChevronRight className="size-5 shrink-0 text-muted" />}
    </>
  );
  const kelas = "flex w-full items-center gap-4 px-4 py-4 text-left";
  if (href)
    return (
      <Link href={href} className={cn(kelas, "transition active:bg-bg")}>
        {isi}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cn(kelas, "transition active:bg-bg")}>
        {isi}
      </button>
    );
  return <div className={kelas}>{isi}</div>;
}
