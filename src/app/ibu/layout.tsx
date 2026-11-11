"use client";

import { BookOpen, ClipboardList, Home, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Memuat } from "@/components/ui";
import { useSiap } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";
import { cn } from "@/lib/util";

const MENU = [
  { href: "/ibu", label: "Beranda", ikon: Home },
  { href: "/ibu/catatan", label: "Catatan", ikon: ClipboardList },
  { href: "/ibu/edukasi", label: "Edukasi", ikon: BookOpen },
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

  useEffect(() => {
    if (siap && (!u || u.peran !== "ibu")) router.replace(u ? "/app" : "/masuk");
  }, [siap, u, router]);

  if (!siap || !u || u.peran !== "ibu") return <Memuat />;

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-bg pb-28">
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex items-center justify-around rounded-[1.6rem] border border-line bg-surface/90 px-2 py-2 shadow-[0_10px_40px_-12px_rgba(29,21,48,0.25)] backdrop-blur">
          {MENU.map(({ href, label, ikon: Ikon }) => {
            const aktif = href === "/ibu" ? path === "/ibu" : path.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] font-semibold transition", aktif ? "bg-brand-soft text-brand-ink" : "text-muted")}>
                <Ikon className="size-5" strokeWidth={aktif ? 2.4 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
