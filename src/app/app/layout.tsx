"use client";

import { BellRing, BookMarked, Camera, Home, LogOut, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Logo } from "@/components/logo";
import { Memuat } from "@/components/ui";
import { LABEL_PERAN, bolehIsi, bolehOcr } from "@/lib/akses";
import { useSiap } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import type { Pengguna } from "@/lib/types";
import { cn, inisial } from "@/lib/util";

function menu(u: Pengguna) {
  return [
    { href: "/app", label: "Beranda", ikon: Home, tampil: true },
    { href: "/app/ibu", label: "Daftar ibu", ikon: Users, tampil: true },
    { href: "/app/foto", label: "Foto Buku KIA", ikon: Camera, tampil: bolehOcr(u) },
    { href: "/app/daftar", label: "Daftarkan ibu", ikon: UserPlus, tampil: bolehIsi(u, "ibu") },
    { href: "/app/pengingat", label: "Pengingat", ikon: BellRing, tampil: u.peran !== "dokter" },
    { href: "/app/kamus", label: "Kamus data", ikon: BookMarked, tampil: true },
  ].filter((m) => m.tampil);
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
  const keluar = useStore((s) => s.keluar);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (siap && (!u || u.peran === "ibu")) router.replace(u ? "/ibu" : "/masuk");
  }, [siap, u, router]);

  if (!siap || !u || u.peran === "ibu") return <Memuat />;
  const m = menu(u);
  const aktif = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        <Logo href="/app" />
        <nav className="mt-8 flex flex-col gap-1">
          {m.map(({ href, label, ikon: Ikon }) => (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", aktif(href) ? "bg-brand-soft text-brand-ink" : "text-muted hover:bg-bg hover:text-ink")}>
              <Ikon className="size-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-bg p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">{inisial(u.nama)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{u.nama}</p>
              <p className="truncate text-xs text-muted">{LABEL_PERAN[u.peran]}{u.posyandu ? ` · ${u.posyandu.join(", ")}` : ""}</p>
            </div>
          </div>
          <button
            onClick={() => {
              keluar();
              router.push("/masuk");
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2 text-sm font-semibold hover:bg-white"
          >
            <LogOut className="size-4" /> Ganti akun
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo href="/app" />
          <button
            onClick={() => {
              keluar();
              router.push("/masuk");
            }}
            className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold"
          >
            {LABEL_PERAN[u.peran]} · ganti <LogOut className="size-3.5" />
          </button>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 backdrop-blur md:hidden">
          <div className="flex justify-around">
            {m.slice(0, 5).map(({ href, label, ikon: Ikon }) => (
              <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-semibold", aktif(href) ? "text-brand" : "text-muted")}>
                <Ikon className="size-5" />
                {label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
