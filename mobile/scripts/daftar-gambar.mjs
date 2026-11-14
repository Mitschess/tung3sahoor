// Membuat src/ui/sumber-gambar.ts: Metro hanya bisa memaketkan gambar lewat require() statis,
// jadi setiap ilustrasi Buku KIA di ../public/kia didaftarkan di sini. Jalankan lagi bila ada gambar baru.
import { readdirSync, writeFileSync } from "node:fs";

const nama = readdirSync(new URL("../../public/kia", import.meta.url)).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)).sort();
const isi = `// Dibuat oleh scripts/daftar-gambar.mjs. Jangan diubah manual.
/* eslint-disable */
import type { NamaGambar } from "@/data/gambar-kia";

export const SUMBER_GAMBAR: Partial<Record<NamaGambar, number>> = {
${nama.map((n) => `  ${JSON.stringify(n)}: require("../../../public/kia/${n}.webp"),`).join("\n")}
};
`;
writeFileSync(new URL("../src/ui/sumber-gambar.ts", import.meta.url), isi);
console.log(`${nama.length} gambar`);
