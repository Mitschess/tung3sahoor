import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  const r = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${r}`;
}

/** NIK tidak disimpan mentah: hash SHA-256 + tampilan tersamar (kode etik bagian 6). */
export async function hashNik(nik: string): Promise<string> {
  const bytes = new TextEncoder().encode(nik.trim());
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function samarkanNik(nik: string): string {
  const s = nik.replace(/\D/g, "");
  if (s.length < 4) return "****";
  return `${"•".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}

/** 0812… → 62812… untuk tautan wa.me */
export function nomorWa(tel: unknown): string | null {
  if (!tel) return null;
  let s = String(tel).replace(/\D/g, "");
  if (s.startsWith("0")) s = "62" + s.slice(1);
  if (!s.startsWith("62")) return null;
  return s;
}

export function tautanWa(tel: unknown, pesan: string): string | null {
  const n = nomorWa(tel);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(pesan)}` : null;
}

export function inisial(nama: unknown): string {
  return String(nama ?? "?")
    .replace(/^(dr\.|bidan|kader)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function namaDepan(nama: unknown): string {
  return String(nama ?? "").split(/\s+/)[0] ?? "";
}
