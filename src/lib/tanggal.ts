import { addDays, differenceInCalendarDays, differenceInHours, format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function sekarang(): Date {
  return new Date();
}

export function iso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function isoWaktu(d: Date): string {
  return d.toISOString();
}

export function parse(s: unknown): Date | null {
  if (!s || typeof s !== "string") return null;
  const d = parseISO(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function tampil(s: unknown, pola = "d MMM yyyy"): string {
  const d = typeof s === "string" ? parse(s) : s instanceof Date ? s : null;
  return d ? format(d, pola, { locale: localeId }) : "–";
}

export function tampilWaktu(s: unknown): string {
  return tampil(s, "d MMM yyyy, HH.mm");
}

export function selisihHari(a: Date, b: Date): number {
  return differenceInCalendarDays(a, b);
}

export function selisihJam(a: Date, b: Date): number {
  return differenceInHours(a, b);
}

export function tambahHari(d: Date, n: number): Date {
  return addDays(d, n);
}

export function umurTahun(lahir: unknown, pada = sekarang()): number | null {
  const d = parse(lahir);
  if (!d) return null;
  let u = pada.getFullYear() - d.getFullYear();
  const m = pada.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && pada.getDate() < d.getDate())) u--;
  return u;
}

export function relatif(s: unknown, pada = sekarang()): string {
  const d = parse(s);
  if (!d) return "–";
  const h = differenceInCalendarDays(d, pada);
  if (h === 0) return "hari ini";
  if (h === 1) return "besok";
  if (h === -1) return "kemarin";
  return h > 0 ? `${h} hari lagi` : `${-h} hari lalu`;
}
