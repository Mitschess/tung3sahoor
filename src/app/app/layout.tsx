"use client";

import { BellRing, Camera, ChevronDown, Home, LogOut, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Memuat, Modal, Tombol } from "@/components/ui";
import { LABEL_PERAN, bolehOcr } from "@/lib/akses";
import { useDaftarRingkasan, useSekarang, useSiap } from "@/lib/hooks";
import { useCatatJejak } from "@/lib/navigasi";
import { daftarPengingat } from "@/lib/pengingat";
import { MODE_AWAN, usePengguna, useStore } from "@/lib/store";
import type { Pengguna } from "@/lib/types";
import { cn, inisial } from "@/lib/util";

interface Menu {
  href: string;
  label: string;
  pendek: string;
  ikon: LucideIcon;
  /** Jumlah hal yang menunggu di halaman itu; merah berarti mendesak. */
  angka?: number;
  mendesak?: boolean;
}

function wilayah(u: Pengguna) {
  return u.posyandu ? `Posyandu ${u.posyandu.join(" & ")}` : "Seluruh wilayah puskesmas";
}

export default function LayoutStaf({ children }: { children: React.ReactNode }) {
  // Seluruh area ini dirender di klien (data lokal); Suspense diperlukan karena memakai URL (usePathname/useParams).
  return (
    <Suspense fallback={<Memuat />}>
      <LayoutStafIsi>{children}</LayoutStafIsi>
    </Suspense>
  );
}

function LayoutStafIsi({ children }: { children: React.ReactNode }) {
  const siap = useSiap();
  const u = usePengguna();
  const router = useRouter();
  useCatatJejak();

  useEffect(() => {
    if (siap && (!u || u.peran === "ibu")) router.replace(u ? "/ibu" : "/masuk");
  }, [siap, u, router]);

  if (!siap || !u || u.peran === "ibu") return <Memuat />;
  return <Kerangka u={u}>{children}</Kerangka>;
}

function Kerangka({ u, children }: { u: Pengguna; children: React.ReactNode }) {
  const keluar = useStore((s) => s.keluar);
  const jumlahDraf = useStore((s) => s.draf.length);
  const router = useRouter();
  const path = usePathname();
  const rs = useDaftarRingkasan();
  const now = useSekarang();
  const [akun, setAkun] = useState(false);

  const merah = rs.filter((r) => r.warna === "merah").length;
  const menu: Menu[] = [
    { href: "/app", label: "Beranda", pendek: "Beranda", ikon: Home },
    { href: "/app/ibu", label: "Daftar ibu", pendek: "Ibu", ikon: Users, angka: merah, mendesak: true },
    ...(bolehOcr(u) ? [{ href: "/app/foto", label: "Foto Buku KIA", pendek: "Foto", ikon: Camera, angka: jumlahDraf }] : []),
    ...(u.peran !== "dokter" ? [{ href: "/app/pengingat", label: "Pengingat", pendek: "Pengingat", ikon: BellRing, angka: daftarPengingat(rs, now).length }] : []),
  ];
  // Detail ibu (/app/ibu/…) dan pendaftaran ibu baru (/app/daftar) tetap menandai "Daftar ibu".
  const aktif = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href) || (href === "/app/ibu" && path.startsWith("/app/daftar")));
  const gantiAkun = () => {
    void keluar().then(() => router.push("/masuk"));
  };
  const labelKeluar = MODE_AWAN ? "Keluar" : "Ganti akun";

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-3 py-5 md:flex">
        <div className="px-2">
          <Logo href="/app" />
        </div>
        <nav aria-label="Menu utama" className="mt-7 flex flex-col gap-1">
          {menu.map(({ href, label, ikon: Ikon, angka, mendesak }) => (
            <Link
              key={href}
              href={href}
              aria-current={aktif(href) ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                aktif(href) ? "bg-brand-soft text-brand-ink" : "text-ink/70 hover:bg-bg hover:text-ink",
              )}
            >
              <Ikon className="size-[18px] shrink-0" strokeWidth={aktif(href) ? 2.3 : 1.9} />
              <span className="flex-1">{label}</span>
              {!!angka && <Angka n={angka} mendesak={mendesak} />}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-bg p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{inisial(u.nama)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{u.nama}</p>
              <p className="truncate text-xs text-muted">{LABEL_PERAN[u.peran]}</p>
              <p className="truncate text-xs text-muted">{wilayah(u)}</p>
            </div>
          </div>
          <button onClick={gantiAkun} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm font-semibold transition hover:bg-white">
            <LogOut className="size-4" /> {labelKeluar}
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur md:hidden">
          <Logo href="/app" />
          {/* Di HP, akun dibuka dulu sebagai lembar; ganti akun tidak terjadi dari satu ketukan yang tidak sengaja. */}
          <button onClick={() => setAkun(true)} className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 text-xs font-semibold" aria-label={`Akun: ${u.nama}, ${LABEL_PERAN[u.peran]}`}>
            <span className="grid size-8 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{inisial(u.nama)}</span>
            {LABEL_PERAN[u.peran]}
            <ChevronDown className="size-3.5 text-muted" />
          </button>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>
        <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${menu.length}, minmax(0, 1fr))` }}>
            {menu.map(({ href, pendek, ikon: Ikon, angka, mendesak }) => (
              <Link key={href} href={href} aria-current={aktif(href) ? "page" : undefined} className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition", aktif(href) ? "text-brand" : "text-[#8a94a3]")}>
                <span className="relative">
                  <Ikon className={cn("size-6", aktif(href) && "fill-brand/15")} strokeWidth={aktif(href) ? 2.3 : 1.8} />
                  {!!angka && <Angka n={angka} mendesak={mendesak} className="absolute -right-2.5 -top-1.5 ring-2 ring-surface" />}
                </span>
                {pendek}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <Modal buka={akun} setBuka={setAkun} judul="Akun">
        <div className="flex items-center gap-3 rounded-2xl bg-bg p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{inisial(u.nama)}</span>
          <div className="min-w-0">
            <p className="truncate font-bold">{u.nama}</p>
            <p className="text-sm text-muted">{LABEL_PERAN[u.peran]}</p>
            <p className="text-sm text-muted">{wilayah(u)}</p>
          </div>
        </div>
        <Tombol varian="garis" className="mt-4 w-full" onClick={gantiAkun}>
          <LogOut className="size-4" /> {labelKeluar}
        </Tombol>
      </Modal>
    </div>
  );
}

function Angka({ n, mendesak, className }: { n: number; mendesak?: boolean; className?: string }) {
  return (
    <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold leading-none", mendesak ? "bg-merah text-white" : "bg-brand-soft text-brand-ink", className)}>
      {n > 99 ? "99+" : n}
    </span>
  );
}
