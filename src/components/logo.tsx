import Link from "next/link";
import { cn } from "@/lib/util";

/**
 * LOGO SEMENTARA (dummy). Ganti isi komponen ini dengan logo final tim;
 * seluruh aplikasi (splash, header, layar masuk) memakai komponen ini.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-[32%] bg-brand text-white", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
        <path d="M9.5 11.5h5M12 9v5" />
      </svg>
    </span>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-extrabold tracking-tight text-ink", className)}>
      <LogoMark className="size-8" />
      <span className="text-lg">
        MOM<span className="text-brand">CARE</span>
      </span>
    </Link>
  );
}
