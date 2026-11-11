/**
 * OCR tabel Buku KIA → draf isian kamus data.
 * - Dengan GEMINI_API_KEY: foto dibaca model Gemini (vision) dengan keluaran JSON terstruktur.
 * - Tanpa kunci: mode demo mengembalikan contoh hasil (ditandai jelas "demo") agar alur tetap bisa diuji.
 * Hasil SELALU berupa draf; data baru tersimpan setelah kader/nakes mengonfirmasi di aplikasi.
 * Kolom sensitif (tripel eliminasi, kesehatan jiwa) sengaja tidak diekstrak.
 */
import { GoogleGenAI } from "@google/genai";
import { KOLOM_SENSITIF, kamus, validasiNilai, type Kolom } from "@/lib/kamus";

export const maxDuration = 60;

const TABEL_BOLEH = new Set(["anc", "kf", "kn"]);
const MAKS_BYTE = 6 * 1024 * 1024;
const JENDELA_MS = 60_000;
const MAKS_PER_MENIT = 12;
const jejak = new Map<string, number[]>();

function kolomOcr(tabel: string): [string, Kolom][] {
  return Object.entries(kamus.tabel[tabel].kolom).filter(
    ([k, kol]) => !kol.otomatis && !["ref", "object", "list"].includes(kol.tipe) && !KOLOM_SENSITIF.has(k),
  );
}

function skemaJson(tabel: string) {
  const props: Record<string, unknown> = {};
  const yakin: Record<string, unknown> = {};
  for (const [k, kol] of kolomOcr(tabel)) {
    const desc = `${kol.label}${kol.satuan ? ` (${kol.satuan})` : ""}`;
    let s: Record<string, unknown>;
    switch (kol.tipe) {
      case "number":
        s = { type: ["number", "null"], description: desc };
        break;
      case "boolean":
        s = { type: ["boolean", "null"], description: `${desc}. Centang/✓/ya = true` };
        break;
      case "enum":
        s = kol.pilihan ? { type: ["string", "null"], enum: [...kol.pilihan, null], description: desc } : { type: ["string", "null"], description: desc };
        break;
      case "enum_multi":
        s = { type: ["array", "null"], items: { type: "string", enum: kol.pilihan }, description: desc };
        break;
      case "date":
        s = { type: ["string", "null"], description: `${desc}, format YYYY-MM-DD` };
        break;
      case "datetime":
        s = { type: ["string", "null"], description: `${desc}, format ISO 8601` };
        break;
      default:
        s = { type: ["string", "null"], description: desc };
    }
    props[k] = s;
    yakin[k] = { type: "number", minimum: 0, maximum: 1 };
  }
  return {
    type: "object",
    properties: {
      hasil: { type: "object", properties: props },
      yakin: { type: "object", properties: yakin, description: "Tingkat keyakinan 0–1 per kolom yang terbaca" },
    },
    required: ["hasil", "yakin"],
  };
}

function bersihkan(tabel: string, hasil: Record<string, unknown>, yakin: Record<string, unknown>) {
  const outH: Record<string, unknown> = {};
  const outY: Record<string, number> = {};
  for (const [k, kol] of kolomOcr(tabel)) {
    let v = hasil?.[k];
    if (v === null || v === undefined || v === "") continue;
    if (kol.tipe === "number") v = Number(String(v).replace(",", "."));
    if (kol.tipe === "number" && Number.isNaN(v)) continue;
    outH[k] = v;
    const y = Number(yakin?.[k]);
    // Nilai di luar rentang wajar tetap dikirim tetapi keyakinannya diturunkan agar disorot.
    const valid = validasiNilai(kol, v).ok;
    outY[k] = Math.max(0, Math.min(1, Number.isFinite(y) ? y : 0.5)) * (valid ? 1 : 0.3);
  }
  return { hasil: outH, yakin: outY };
}

function demo(tabel: string, ke?: string) {
  const hariIni = new Date().toISOString().slice(0, 10);
  const dua = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  if (tabel === "kf")
    return {
      hasil: { kf_ke: Number(ke ?? 2), tanggal: hariIni, tempat: "Puskesmas Sukamaju", kondisi_umum: true, td_sistolik: 120, td_diastolik: 80, suhu_c: 36.9, nadi: 82, napas: 18, lokhia_perdarahan: "Normal", jalan_lahir: "Normal", kontraksi_tfu: "Normal", payudara_asi: "tidak normal", vit_a: true, konseling: true },
      yakin: { kf_ke: 0.97, tanggal: 0.9, tempat: 0.8, kondisi_umum: 0.95, td_sistolik: 0.92, td_diastolik: 0.71, suhu_c: 0.88, nadi: 0.66, napas: 0.83, lokhia_perdarahan: 0.9, jalan_lahir: 0.9, kontraksi_tfu: 0.86, payudara_asi: 0.74, vit_a: 0.95, konseling: 0.93 },
    };
  if (tabel === "kn")
    return {
      hasil: { kn_ke: ke ?? "KN2", tanggal_jam: new Date().toISOString(), tempat: "Puskesmas Sukamaju", bb_g: 3150, pb_cm: 50, lk_cm: 34.5, menyusu: true, tali_pusat: "Baik", tanda_bahaya: false, kuning: false, vit_k1: true, salep_mata: true, hb0: true, shk: true },
      yakin: { kn_ke: 0.96, tanggal_jam: 0.82, tempat: 0.8, bb_g: 0.91, pb_cm: 0.77, lk_cm: 0.69, menyusu: 0.94, tali_pusat: 0.88, tanda_bahaya: 0.9, kuning: 0.87, vit_k1: 0.95, salep_mata: 0.95, hb0: 0.95, shk: 0.8 },
    };
  return {
    hasil: { kunjungan_ke: Number(ke ?? 5), tanggal: hariIni, tempat: "Posyandu Melati", bb_kg: 61.5, lila_cm: 24, td_sistolik: 130, td_diastolik: 85, tfu_cm: 30, letak_janin: "Kepala", djj: 142, status_imunisasi_td: "T4", konseling: true, ttd_mms: true, protein_urine: "Negatif", catatan: "Keluhan pegal punggung, edukasi posisi tidur miring kiri", tanggal_kembali: dua },
    yakin: { kunjungan_ke: 0.98, tanggal: 0.93, tempat: 0.81, bb_kg: 0.95, lila_cm: 0.9, td_sistolik: 0.91, td_diastolik: 0.72, tfu_cm: 0.64, letak_janin: 0.86, djj: 0.88, status_imunisasi_td: 0.79, konseling: 0.94, ttd_mms: 0.94, protein_urine: 0.83, catatan: 0.7, tanggal_kembali: 0.89 },
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokal";
  const now = Date.now();
  const riwayat = (jejak.get(ip) ?? []).filter((t) => now - t < JENDELA_MS);
  if (riwayat.length >= MAKS_PER_MENIT) return Response.json({ pesan: "Terlalu banyak permintaan. Coba lagi sebentar." }, { status: 429 });
  jejak.set(ip, [...riwayat, now]);

  let body: { tabel?: string; gambar?: string; kunjungan?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ pesan: "Format permintaan tidak valid." }, { status: 400 });
  }
  const { tabel, gambar, kunjungan } = body;
  if (!tabel || !TABEL_BOLEH.has(tabel)) return Response.json({ pesan: "Tabel tidak didukung untuk OCR." }, { status: 400 });
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(gambar ?? "");
  if (!m) return Response.json({ pesan: "Gambar harus JPEG/PNG/WebP." }, { status: 400 });
  if (m[2].length * 0.75 > MAKS_BYTE) return Response.json({ pesan: "Gambar terlalu besar (maks 6 MB)." }, { status: 413 });

  const kunci = process.env.GEMINI_API_KEY;
  if (!kunci) {
    return Response.json({ mode: "demo", ...demo(tabel, kunjungan) });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const def = kamus.tabel[tabel];
  const target =
    tabel === "anc" ? `kolom kunjungan K${kunjungan ?? "?"} (kunjungan_ke = ${kunjungan ?? "?"})` : tabel === "kf" ? `kunjungan nifas KF${kunjungan ?? "?"}` : `kunjungan neonatal ${kunjungan ?? "?"}`;
  const prompt = [
    `Ini foto halaman Buku KIA (Kemenkes RI 2024): tabel "${def.judul}".`,
    `Ekstrak isian tulisan tangan untuk ${target} saja.`,
    "Aturan: jangan menebak. Jika sel kosong/tidak terbaca, isi null dan keyakinan rendah.",
    "Tanggal tulis sebagai YYYY-MM-DD (tahun 2-digit → 20xx). Tekanan darah '120/80' → sistolik 120, diastolik 80.",
    "Centang (✓) atau 'ya' → true; silang/'tidak' → false. Untuk pilihan, gunakan salah satu nilai enum persis.",
    "Beri keyakinan 0–1 per kolom berdasarkan kejelasan tulisan.",
  ].join("\n");

  try {
    const ai = new GoogleGenAI({ apiKey: kunci });
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: m[1], data: m[2] } }, { text: prompt }] }],
      config: { responseMimeType: "application/json", responseJsonSchema: skemaJson(tabel), temperature: 0 },
    });
    const teks = res.text ?? "{}";
    const json = JSON.parse(teks) as { hasil?: Record<string, unknown>; yakin?: Record<string, unknown> };
    const bersih = bersihkan(tabel, json.hasil ?? {}, json.yakin ?? {});
    return Response.json({ mode: "gemini", model, ...bersih });
  } catch (e) {
    console.error("OCR gagal:", (e as Error).message);
    return Response.json({ pesan: "Layanan AI sedang tidak tersedia. Silakan isi manual." }, { status: 502 });
  }
}
