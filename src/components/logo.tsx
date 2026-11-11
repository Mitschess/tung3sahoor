import Link from "next/link";
import { cn } from "@/lib/util";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-extrabold tracking-tight text-ink", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-rose text-white shadow-[0_6px_16px_-6px_var(--brand)]">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
          <path d="M9.5 11.5h5M12 9v5" />
        </svg>
      </span>
      <span className="text-lg">
        MOM<span className="text-brand">CARE</span>
      </span>
    </Link>
  );
}
