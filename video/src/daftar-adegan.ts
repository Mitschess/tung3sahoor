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

import { AdeganArsitektur } from "./adegan/arsitektur";
import durasi from "./durasi.json";

const D: Record<string, number> = durasi.adegan;

export type Adegan = { id: string; komponen: React.FC; durasi: number; transisi?: "fade" | "slide" | "wipe" };

/** Urutan adegan (durasi dalam frame, 30 fps). Transisi = cara masuk adegan ini. */
export const ADEGAN: Adegan[] = [
  // Babak 1: masalah Buku KIA kertas
  { id: "01-Pembuka", komponen: AdeganPembuka, durasi: D["01-Pembuka"] },
  { id: "02-IsiBuku", komponen: AdeganIsiBuku, durasi: D["02-IsiBuku"], transisi: "fade" },
  { id: "03-Dibawa", komponen: AdeganDibawa, durasi: D["03-Dibawa"], transisi: "slide" },
  { id: "04-Basah", komponen: AdeganBasah, durasi: D["04-Basah"], transisi: "fade" },
  { id: "05-Hilang", komponen: AdeganHilang, durasi: D["05-Hilang"], transisi: "slide" },
  { id: "06-Terpisah", komponen: AdeganTerpisah, durasi: D["06-Terpisah"], transisi: "slide" },
  { id: "07-Dampak", komponen: AdeganDampak, durasi: D["07-Dampak"], transisi: "fade" },
  { id: "08-Jembatan", komponen: AdeganJembatan, durasi: D["08-Jembatan"], transisi: "fade" },
  // Babak 2: Rangkul
  { id: "09-Logo", komponen: AdeganLogo, durasi: D["09-Logo"], transisi: "wipe" },
  { id: "10-SatuData", komponen: AdeganSatuData, durasi: D["10-SatuData"], transisi: "fade" },
  { id: "11-IbuMasuk", komponen: AdeganIbuMasuk, durasi: D["11-IbuMasuk"], transisi: "slide" },
  { id: "12-Beranda", komponen: AdeganBeranda, durasi: D["12-Beranda"], transisi: "fade" },
  { id: "13-Pantau", komponen: AdeganPantau, durasi: D["13-Pantau"], transisi: "slide" },
  { id: "14-Edukasi", komponen: AdeganEdukasi, durasi: D["14-Edukasi"], transisi: "slide" },
  { id: "15-Jadwal", komponen: AdeganJadwal, durasi: D["15-Jadwal"], transisi: "slide" },
  { id: "16-NakesJudul", komponen: AdeganNakesJudul, durasi: D["16-NakesJudul"], transisi: "wipe" },
  { id: "17-Dasbor", komponen: AdeganDasbor, durasi: D["17-Dasbor"], transisi: "fade" },
  { id: "18-Detail", komponen: AdeganDetail, durasi: D["18-Detail"], transisi: "slide" },
  { id: "19-Ocr", komponen: AdeganOcr, durasi: D["19-Ocr"], transisi: "slide" },
  { id: "20-Pengingat", komponen: AdeganPengingat, durasi: D["20-Pengingat"], transisi: "slide" },
  { id: "21-Terjawab", komponen: AdeganTerjawab, durasi: D["21-Terjawab"], transisi: "fade" },
  { id: "22-Arsitektur", komponen: AdeganArsitektur, durasi: D["22-Arsitektur"], transisi: "fade" },
  { id: "23-Privasi", komponen: AdeganPrivasi, durasi: D["23-Privasi"], transisi: "fade" },
  { id: "24-Penutup", komponen: AdeganPenutup, durasi: D["24-Penutup"], transisi: "fade" },
];

export const PANJANG_TRANSISI = durasi.transisi;

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
