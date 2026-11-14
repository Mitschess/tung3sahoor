import Link from "next/link";
import { cn } from "@/lib/util";

/**
 * Logo Rangkul "pelukan": lengkung ibu yang memeluk bayi (titik merah muda).
 * Seluruh aplikasi (splash, header, layar masuk) memakai komponen ini; padanannya di
 * aplikasi Android ada di mobile/src/ui/dasar.tsx dan ikon aplikasinya di mobile/assets.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-[32%] bg-brand text-white", className)} aria-hidden>
      <svg viewBox="0 0 96 96" className="size-full" fill="none">
        <path d="M66 27A27 27 0 1 0 74 60" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        <circle cx="51" cy="51" r="11" fill="#f48fb8" />
      </svg>
    </span>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-extrabold tracking-tight text-ink", className)}>
      <LogoMark className="size-8" />
      <span className="text-lg">Rangkul</span>
    </Link>
  );
}
