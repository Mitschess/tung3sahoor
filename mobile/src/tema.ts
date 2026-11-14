/** Warna dan huruf aplikasi Ibu, sama dengan token di src/app/globals.css (web). */
import type { Tema } from "@/data/edukasi";
import type { Level } from "@/lib/types";

export const W = {
  bg: "#f4f7fb",
  latar: "#f8fafd",
  surface: "#ffffff",
  ink: "#1f2a37",
  muted: "#6b7686",
  pudar: "#9aa4b1",
  line: "#e6ebf2",
  brand: "#2f8af5",
  brandInk: "#1765c7",
  brandSoft: "#e8f2fe",
  rose: "#e84d8a",
  roseSoft: "#fde8f1",
  teal: "#10a99a",
  tealSoft: "#e0f6f3",
  ungu: "#7c5cf0",
  unguSoft: "#efebfe",
  merah: "#d92d3a",
  merahSoft: "#fdecee",
  kuning: "#b86e00",
  kuningSoft: "#fff4dc",
  hijau: "#0f8a5f",
  hijauSoft: "#e3f6ee",
  kertas: "#fffdf9",
} as const;

/** Plus Jakarta Sans per ketebalan (font kustom di React Native dipilih lewat nama, bukan fontWeight). */
export const HURUF = {
  400: "PlusJakartaSans_400Regular",
  500: "PlusJakartaSans_500Medium",
  600: "PlusJakartaSans_600SemiBold",
  700: "PlusJakartaSans_700Bold",
  800: "PlusJakartaSans_800ExtraBold",
} as const;
export type Tebal = keyof typeof HURUF;

/** Bayangan kartu, sama dengan --shadow-kartu di web. */
export const BAYANGAN = "0px 2px 14px -6px rgba(23, 60, 110, 0.14), 0px 0px 0px 1px rgba(23, 60, 110, 0.04)";

/** Warna bab Buku KIA (pengganti kelas Tailwind di TEMA web). */
export const WARNA_TEMA: Record<Tema, { pita: string; lembut: string }> = {
  rose: { pita: W.rose, lembut: W.roseSoft },
  brand: { pita: W.brand, lembut: W.brandSoft },
  ungu: { pita: W.ungu, lembut: W.unguSoft },
  hijau: { pita: W.hijau, lembut: W.hijauSoft },
  teal: { pita: W.teal, lembut: W.tealSoft },
};

export const WARNA_NADA: Record<Level | "hijau", { latar: string; teks: string }> = {
  merah: { latar: W.merahSoft, teks: W.merah },
  kuning: { latar: W.kuningSoft, teks: W.kuning },
  hijau: { latar: W.hijauSoft, teks: W.hijau },
};
