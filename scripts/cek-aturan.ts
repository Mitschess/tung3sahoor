/** Uji cepat: jalankan mesin peringatan terhadap data demo. `npx tsx scripts/cek-aturan.ts` */
import { evaluasi, warnaIbu } from "../src/lib/aturan";
import { jadwal } from "../src/lib/jadwal";
import { buatSeed } from "../src/lib/seed";
import { buatPencari, hitungTahap } from "../src/lib/tahap";

const now = new Date();
const seed = buatSeed(now);
for (const ibu of seed.ibu) {
  const cari = buatPencari(seed.catatan, ibu.id);
  const t = hitungTahap(ibu, cari, now);
  const ps = evaluasi(ibu, cari, t, now);
  const js = jadwal(t, cari, now).map((k) => `${k.kode}:${k.status}`).join(" ");
  console.log(`\n${ibu.profil.nama} [${ibu.profil.wilayah_posyandu}] ${t.label} → ${warnaIbu(ps).toUpperCase()}`);
  console.log("  jadwal:", js);
  for (const p of ps) console.log(`  ${p.level === "merah" ? "🔴" : "🟡"} ${p.judul}${p.sensitif ? " (sensitif)" : ""} — ${p.detail}`);
}
