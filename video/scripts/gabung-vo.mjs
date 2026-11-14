// Menggabungkan voice over ke video hasil render. Musik & efek suara otomatis dikecilkan saat VO berbunyi.
//   node scripts/gabung-vo.mjs [video_masuk] [video_keluar] [--subtitle] [--vo-volume=1.0]
// Bawaan: out/rangkul-demo.mp4 -> out/rangkul-demo-vo.mp4, VO dari public/vo/vo-lengkap.mp3.
// --subtitle menyisipkan vo/subtitle.srt sebagai trek subtitle (bisa dinyalakan/dimatikan di pemutar).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.slice(2);
const pakaiSubtitle = arg.includes("--subtitle");
const volumeVo = Number(arg.find((a) => a.startsWith("--vo-volume="))?.split("=")[1] ?? 1);
const [masuk = "out/rangkul-demo.mp4", keluar = "out/rangkul-demo-vo.mp4"] = arg.filter((a) => !a.startsWith("--")).map((p) => path.resolve(AKAR, p));
const vo = path.join(AKAR, "public/vo/vo-lengkap.mp3");
const srt = path.join(AKAR, "vo/subtitle.srt");

const wajib = [
  [masuk, "Render dulu videonya: npm run render"],
  [vo, "Buat dulu VO-nya: npm run vo"],
  ...(pakaiSubtitle ? [[srt, "Buat dulu VO-nya: npm run vo"]] : []),
];
for (const [f, saran] of wajib) {
  if (!fs.existsSync(f)) {
    console.error(`Tidak ditemukan: ${f}\n${saran}`);
    process.exit(1);
  }
}

const durasi = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const dVideo = durasi(masuk);
const dVo = durasi(vo);
if (Math.abs(dVideo - dVo) > 0.5) {
  console.warn(
    `PERINGATAN: video ${dVideo.toFixed(1)}s, VO ${dVo.toFixed(1)}s. Durasi adegan mungkin berubah sejak VO dibuat; jalankan ulang npm run vo.`,
  );
}

// VO dipecah dua: satu untuk didengar, satu sebagai pemicu peredam (sidechain) musik.
const filter = [
  `[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=${volumeVo},asplit=2[vo][pemicu]`,
  `[0:a]aresample=48000,aformat=channel_layouts=stereo[latar]`,
  `[latar][pemicu]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=350[redam]`,
  `[redam][vo]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`,
].join(";");

fs.mkdirSync(path.dirname(keluar), { recursive: true });
execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-stats", "-y",
    "-i", masuk,
    "-i", vo,
    ...(pakaiSubtitle ? ["-i", srt] : []),
    "-filter_complex", filter,
    "-map", "0:v", "-map", "[a]",
    ...(pakaiSubtitle ? ["-map", "2:s", "-c:s", "mov_text", "-metadata:s:s:0", "language=ind"] : []),
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    keluar,
  ],
  { stdio: "inherit" },
);
console.log(`Selesai -> ${keluar}`);
