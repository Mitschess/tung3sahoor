import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadTangan } from "@remotion/google-fonts/Kalam";
import { Easing } from "remotion";

// Warna sama dengan src/app/globals.css aplikasi Rangkul.
export const W = {
  bg: "#f4f7fb",
  surface: "#ffffff",
  ink: "#1f2a37",
  muted: "#6b7686",
  line: "#e6ebf2",
  brand: "#2f8af5",
  brandInk: "#1765c7",
  brandSoft: "#e8f2fe",
  rose: "#e84d8a",
  roseSoft: "#fde8f1",
  teal: "#10a99a",
  tealSoft: "#e0f6f3",
  ungu: "#7c5cf0",
  merah: "#d92d3a",
  merahSoft: "#fdecee",
  kuning: "#b86e00",
  kuningCerah: "#f2a900",
  kuningSoft: "#fff4dc",
  hijau: "#0f8a5f",
  hijauSoft: "#e3f6ee",
  // Sampul Buku KIA (merah muda) dan kertas.
  sampul: "#e85a92",
  sampulGelap: "#c23d73",
  kertas: "#fbf6ea",
  malam: "#0f1a2b",
};

export const { fontFamily: FONT } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: FONT_TANGAN } = loadTangan("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const FPS = 30;
export const detik = (s: number) => Math.round(s * FPS);

export const halus = Easing.bezier(0.16, 1, 0.3, 1);
export const masukKeluar = Easing.bezier(0.65, 0, 0.35, 1);

export const jepit = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
