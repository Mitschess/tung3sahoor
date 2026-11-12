"use client";

import { ClipboardList, Home, LayoutGrid, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Memuat } from "@/components/ui";
import { useSiap } from "@/lib/hooks";
import { useCatatJejak } from "@/lib/navigasi";
import { usePengguna } from "@/lib/store";
import { cn } from "@/lib/util";

const MENU = [
  { href: "/ibu", label: "Beranda", ikon: Home },
  { href: "/ibu/fitur", label: "Fitur", ikon: LayoutGrid },
  { href: "/ibu/catatan", label: "Catatan", ikon: ClipboardList },
  { href: "/ibu/profil", label: "Profil", ikon: UserRound },
];

export default function LayoutIbu({ children }: { children: React.ReactNode }) {
  // Seluruh area ini dirender di klien (data lokal); Suspense diperlukan karena memakai URL (usePathname/useParams).
  return (
    <Suspense fallback={<Memuat />}>
      <LayoutIbuIsi>{children}</LayoutIbuIsi>
    </Suspense>
  );
}

function LayoutIbuIsi({ children }: { children: React.ReactNode }) {
  const siap = useSiap();
  const u = usePengguna();
  const router = useRouter();
  const path = usePathname();
  useCatatJejak();

  useEffect(() => {
    if (siap && (!u || u.peran !== "ibu")) router.replace(u ? "/app" : "/masuk");
  }, [siap, u, router]);

  if (!siap || !u || u.peran !== "ibu") return <Memuat penuh />;

  // Saat membaca flipbook edukasi, layar dipakai penuh tanpa menu bawah.
  const baca = /^\/ibu\/edukasi\/[^/]+/.test(path);

  return (
    <div className={cn("latar-ibu mx-auto min-h-dvh max-w-md", !baca && "pb-24")}>
      {children}
      {!baca && (
      <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {MENU.map(({ href, label, ikon: Ikon }) => {
            const aktif = href === "/ibu" ? path === "/ibu" : path.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={aktif ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition", aktif ? "text-brand" : "text-[#9aa4b1]")}>
                <Ikon className={cn("size-6", aktif && "fill-brand/15")} strokeWidth={aktif ? 2.3 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}
