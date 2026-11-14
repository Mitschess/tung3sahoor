// Membuat musik latar sintetis (bebas hak cipta) untuk video Rangkul.
//   node scripts/buat-musik.mjs <detik_total> <detik_pindah_ke_solusi>
// Bagian 1 (masalah): La minor, lembut dan sendu. Bagian 2 (solusi): Do mayor, cerah.
import fs from "node:fs";
import path from "node:path";

const SR = 44100;
const TOTAL = Number(process.argv[2] ?? 262);
const PINDAH = Number(process.argv[3] ?? 78);
const N = Math.ceil(TOTAL * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function tambah(buf, i, v) {
  if (i >= 0 && i < N) buf[i] += v;
}

/** Nada mirip piano: harmonik dengan peluruhan eksponensial. */
function piano(t0, midi, dur, vol, pan = 0) {
  const f = hz(midi);
  const n = Math.floor((dur + 1.5) * SR);
  const s0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.005) * Math.exp(-t * 2.2) * (t > dur ? Math.exp(-(t - dur) * 6) : 1);
    const v =
      (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t * 3) + 0.2 * Math.sin(2 * Math.PI * 3 * f * t) * Math.exp(-t * 5)) *
      env *
      vol;
    tambah(L, s0 + k, v * (1 - pan) * 0.7);
    tambah(R, s0 + k, v * (1 + pan) * 0.7);
  }
}

/** Pad lembut: dua osilator sedikit berbeda nada, serangan pelan. */
function pad(t0, midis, dur, vol) {
  const n = Math.floor(dur * SR);
  const s0 = Math.floor(t0 * SR);
  for (const m of midis) {
    const f = hz(m);
    for (let k = 0; k < n; k++) {
      const t = k / SR;
      const env = Math.min(1, t / 1.2) * Math.min(1, (dur - t) / 1.2);
      const a = Math.sin(2 * Math.PI * f * 1.003 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
      const b = Math.sin(2 * Math.PI * f * 0.997 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.004 * t);
      tambah(L, s0 + k, a * env * vol);
      tambah(R, s0 + k, b * env * vol);
    }
  }
}

/** Bass bulat. */
function bass(t0, midi, dur, vol) {
  const f = hz(midi);
  const n = Math.floor(dur * SR);
  const s0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.02) * Math.exp(-t * 1.2) * Math.min(1, (dur - t) / 0.05);
    const v = Math.sin(2 * Math.PI * f * t) * env * vol;
    tambah(L, s0 + k, v);
    tambah(R, s0 + k, v);
  }
}

/** Ketukan lembut (kick + hi-hat halus). */
function kick(t0, vol) {
  const s0 = Math.floor(t0 * SR);
  for (let k = 0; k < SR * 0.25; k++) {
    const t = k / SR;
    const f = 50 + 70 * Math.exp(-t * 30);
    const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 14) * vol;
    tambah(L, s0 + k, v);
    tambah(R, s0 + k, v);
  }
}
let acak = 12345;
const rnd = () => ((acak = (acak * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
function hat(t0, vol) {
  const s0 = Math.floor(t0 * SR);
  let prev = 0;
  for (let k = 0; k < SR * 0.05; k++) {
    const t = k / SR;
    const x = rnd();
    const hp = x - prev;
    prev = x;
    const v = hp * Math.exp(-t * 90) * vol;
    tambah(L, s0 + k, v * 0.8);
    tambah(R, s0 + k, v);
  }
}

/* ---------- Bagian 1: masalah (Am F C G), 72 bpm ---------- */
{
  const bpm = 72;
  const ketuk = 60 / bpm;
  const bar = ketuk * 4;
  const akor = [
    [57, 60, 64], // Am
    [53, 57, 60], // F
    [48, 52, 55], // C
    [55, 59, 62], // G
  ];
  const akar = [45, 41, 48, 43];
  const melodi = [
    [76, 74, 72, 71],
    [72, 69, 72, 74],
    [76, 79, 76, 72],
    [74, 71, 67, 71],
  ];
  for (let b = 0; b * bar < PINDAH + 2; b++) {
    const t = b * bar;
    const c = b % 4;
    pad(t, akor[c].map((m) => m - 12), bar + 1.2, 0.035);
    bass(t, akar[c] - 12, bar, 0.16);
    // Arpeggio pelan
    [0, 1, 2, 1].forEach((n, i) => piano(t + i * ketuk, akor[c][n] + 12, ketuk * 0.9, 0.05, i % 2 ? 0.3 : -0.3));
    // Melodi muncul setelah 16 detik
    if (t > 16) melodi[c].forEach((m, i) => (i % 2 === 0 || b % 2 === 1 ? piano(t + i * ketuk + ketuk * 0.5, m, ketuk * 1.2, 0.07, 0.1) : null));
  }
}

/* ---------- Bagian 2: solusi (C G Am F), 96 bpm ---------- */
{
  const bpm = 96;
  const ketuk = 60 / bpm;
  const bar = ketuk * 4;
  const mulai = PINDAH;
  const akor = [
    [60, 64, 67], // C
    [55, 59, 62], // G
    [57, 60, 64], // Am
    [53, 57, 60], // F
  ];
  const akar = [48, 43, 45, 41];
  const melodi = [
    [79, 76, 72, 76, 79, 81, 79, 76],
    [74, 71, 74, 79, 74, 71, 67, 71],
    [76, 72, 69, 72, 76, 79, 76, 72],
    [77, 72, 69, 72, 74, 72, 69, 67],
  ];
  for (let b = 0; mulai + b * bar < TOTAL; b++) {
    const t = mulai + b * bar;
    const c = b % 4;
    const intro = b < 2;
    pad(t, akor[c].map((m) => m - 12), bar + 1, 0.03);
    bass(t, akar[c] - 12, ketuk * 2, 0.17);
    bass(t + ketuk * 2.5, akar[c] - 12, ketuk * 1.5, 0.12);
    // Arpeggio 8 per bar
    for (let i = 0; i < 8; i++) piano(t + i * ketuk * 0.5, akor[c][[0, 1, 2, 1, 2, 1, 0, 1][i]] + 12, ketuk * 0.45, 0.04, i % 2 ? 0.35 : -0.35);
    if (!intro) {
      for (let i = 0; i < 4; i++) {
        kick(t + i * ketuk, i % 2 === 0 ? 0.32 : 0.18);
        hat(t + i * ketuk + ketuk * 0.5, 0.05);
      }
    }
    // Melodi pada 8 bar, istirahat 4 bar, berulang
    if (!intro && b % 12 < 8) melodi[c].forEach((m, i) => (i % 3 !== 2 ? piano(t + i * ketuk * 0.5, m, ketuk * 0.6, 0.06, 0.05) : null));
  }
  // Riser lembut menjelang solusi
  const s0 = Math.floor((mulai - 3) * SR);
  for (let k = 0; k < 3 * SR; k++) {
    const t = k / SR;
    const v = rnd() * Math.pow(t / 3, 2) * 0.05;
    tambah(L, s0 + k, v);
    tambah(R, s0 + k, v);
  }
}

/* ---------- Gema sederhana (Schroeder) + normalisasi ---------- */
function gema(buf) {
  const out = new Float32Array(N);
  const comb = [1557, 1617, 1491, 1422].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of comb) {
      const y = c.b[c.i];
      c.b[c.i] = buf[n] + y * 0.78;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    out[n] = buf[n] + s * 0.07;
  }
  return out;
}
const L2 = gema(L);
const R2 = gema(R);
let puncak = 0;
for (let n = 0; n < N; n++) puncak = Math.max(puncak, Math.abs(L2[n]), Math.abs(R2[n]));
const skala = 0.89 / puncak;

const data = Buffer.alloc(44 + N * 4);
data.write("RIFF", 0);
data.writeUInt32LE(36 + N * 4, 4);
data.write("WAVEfmt ", 8);
data.writeUInt32LE(16, 16);
data.writeUInt16LE(1, 20);
data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24);
data.writeUInt32LE(SR * 4, 28);
data.writeUInt16LE(4, 32);
data.writeUInt16LE(16, 34);
data.write("data", 36);
data.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L2[n] * skala)) * 32767), 44 + n * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R2[n] * skala)) * 32767), 46 + n * 4);
}
const keluar = path.resolve("public/musik/latar.wav");
// Ubah ke MP3 sesudahnya: ffmpeg -i public/musik/latar.wav -b:a 192k public/musik/latar.mp3
fs.mkdirSync(path.dirname(keluar), { recursive: true });
fs.writeFileSync(keluar, data);
console.log(`Musik ${TOTAL}s (pindah ke solusi di ${PINDAH}s) -> ${keluar}`);
