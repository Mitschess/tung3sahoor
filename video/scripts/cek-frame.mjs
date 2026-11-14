// Render beberapa frame contoh (skala 0,5) untuk pemeriksaan visual.
//   node scripts/cek-frame.mjs <folder-keluar> <id:frame> [id:frame ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [keluar, ...daftar] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const item of daftar) {
  const [id, frame] = item.split(":");
  const composition = await selectComposition({ serveUrl, id });
  const file = path.join(keluar, `${id}-${frame}.png`);
  await renderStill({ serveUrl, composition, frame: Number(frame), output: file, scale: 0.5, timeoutInMilliseconds: 120000 });
  console.log("✓", file);
}
