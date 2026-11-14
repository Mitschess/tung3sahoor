import type React from "react";
import {
  AdeganBasah,
  AdeganDampak,
  AdeganDibawa,
  AdeganHilang,
  AdeganIsiBuku,
  AdeganJembatan,
  AdeganPembuka,
  AdeganTerpisah,
} from "./adegan/masalah";
import { AdeganBeranda, AdeganEdukasi, AdeganIbuMasuk, AdeganJadwal, AdeganLogo, AdeganPantau, AdeganSatuData } from "./adegan/solusi-ibu";
import {
  AdeganDasbor,
  AdeganDetail,
  AdeganNakesJudul,
  AdeganOcr,
  AdeganPengingat,
  AdeganPenutup,
  AdeganPrivasi,
  AdeganTerjawab,
} from "./adegan/solusi-nakes";

export type Adegan = { id: string; komponen: React.FC; durasi: number; transisi?: "fade" | "slide" | "wipe" };

/** Urutan adegan (durasi dalam frame, 30 fps). Transisi = cara masuk adegan ini. */
export const ADEGAN: Adegan[] = [
  // Babak 1: masalah Buku KIA kertas
  { id: "01-Pembuka", komponen: AdeganPembuka, durasi: 240 },
  { id: "02-IsiBuku", komponen: AdeganIsiBuku, durasi: 330, transisi: "fade" },
  { id: "03-Dibawa", komponen: AdeganDibawa, durasi: 360, transisi: "slide" },
  { id: "04-Basah", komponen: AdeganBasah, durasi: 330, transisi: "fade" },
  { id: "05-Hilang", komponen: AdeganHilang, durasi: 300, transisi: "slide" },
  { id: "06-Terpisah", komponen: AdeganTerpisah, durasi: 420, transisi: "slide" },
  { id: "07-Dampak", komponen: AdeganDampak, durasi: 300, transisi: "fade" },
  { id: "08-Jembatan", komponen: AdeganJembatan, durasi: 180, transisi: "fade" },
  // Babak 2: Rangkul
  { id: "09-Logo", komponen: AdeganLogo, durasi: 210, transisi: "wipe" },
  { id: "10-SatuData", komponen: AdeganSatuData, durasi: 360, transisi: "fade" },
  { id: "11-IbuMasuk", komponen: AdeganIbuMasuk, durasi: 300, transisi: "slide" },
  { id: "12-Beranda", komponen: AdeganBeranda, durasi: 450, transisi: "fade" },
  { id: "13-Pantau", komponen: AdeganPantau, durasi: 420, transisi: "slide" },
  { id: "14-Edukasi", komponen: AdeganEdukasi, durasi: 390, transisi: "slide" },
  { id: "15-Jadwal", komponen: AdeganJadwal, durasi: 390, transisi: "slide" },
  { id: "16-NakesJudul", komponen: AdeganNakesJudul, durasi: 150, transisi: "wipe" },
  { id: "17-Dasbor", komponen: AdeganDasbor, durasi: 480, transisi: "fade" },
  { id: "18-Detail", komponen: AdeganDetail, durasi: 510, transisi: "slide" },
  { id: "19-Ocr", komponen: AdeganOcr, durasi: 540, transisi: "slide" },
  { id: "20-Pengingat", komponen: AdeganPengingat, durasi: 450, transisi: "slide" },
  { id: "21-Terjawab", komponen: AdeganTerjawab, durasi: 420, transisi: "fade" },
  { id: "22-Privasi", komponen: AdeganPrivasi, durasi: 300, transisi: "fade" },
  { id: "23-Penutup", komponen: AdeganPenutup, durasi: 330, transisi: "fade" },
];

export const PANJANG_TRANSISI = 15;

export const DURASI_TOTAL = ADEGAN.reduce((n, a) => n + a.durasi, 0) - (ADEGAN.length - 1) * PANJANG_TRANSISI;

/** Frame mulai setiap adegan di video utama (untuk musik). */
export const MULAI: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let t = 0;
  ADEGAN.forEach((a, i) => {
    out[a.id] = t;
    t += a.durasi - (i < ADEGAN.length - 1 ? PANJANG_TRANSISI : 0);
  });
  return out;
})();
