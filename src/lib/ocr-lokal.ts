/**
 * Pembaca foto Buku KIA di perangkat (Tesseract.js), dipakai bila server tidak punya kunci AI.
 * Foto tidak dikirim ke mana pun: mesin OCR berjalan di peramban.
 *
 * Cara kerja: Tesseract mengembalikan kata beserta posisinya. Kata-kata disusun ulang menjadi baris tabel,
 * lalu tiap baris dicocokkan dengan label cetak (mis. "Berat badan", "Tekanan darah") dan nilainya diambil
 * dari kolom kunjungan yang diminta. Tesseract dilatih untuk huruf cetak, jadi tulisan tangan sering meleset;
 * karena itu keyakinan setiap isian dibatasi di bawah ambang "yakin" sehingga semuanya wajib dicek petugas.
 */
import { KOLOM_SENSITIF, kamus, validasiNilai } from "./kamus";

/** Di bawah BATAS_YAKIN (0,85) supaya semua hasil Tesseract diberi kotak kuning. */
const YAKIN_MAKS = 0.8;

interface Kata {
  teks: string;
  yakin: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** Satu baris tabel: kata-katanya urut dari kiri, dengan posisi tiap kata di dalam teks baris. */
interface Baris {
  teks: string;
  kata: (Kata & { awal: number })[];
}

type Jenis = "angka" | "td" | "tanggal" | "pilihan" | "teks";
interface Aturan {
  kolom: string;
  label: RegExp;
  jenis: Jenis;
  /** Rentang wajar bila kamus tidak menyebutkannya. */
  rentang?: [number, number];
  /** Baris yang cocok dengan pola ini dilewati (mis. "Tanggal kembali" untuk "Tanggal periksa"). */
  kecuali?: RegExp;
}

const TANGGAL: Aturan = { kolom: "tanggal", label: /\btanggal\b|\btgl\b/i, jenis: "tanggal", kecuali: /kembali|lahir/i };
const TD: Aturan = { kolom: "td", label: /tekanan\s*darah|\btd\b|tensi/i, jenis: "td" };
const NORMAL = (kolom: string, label: RegExp): Aturan => ({ kolom, label, jenis: "pilihan" });

const ATURAN: Record<string, Aturan[]> = {
  anc: [
    { kolom: "tanggal_kembali", label: /kembali/i, jenis: "tanggal" },
    TANGGAL,
    { kolom: "tempat", label: /\btempat\b/i, jenis: "teks" },
    { kolom: "bb_kg", label: /berat\s*badan|\bbb\b|timbang/i, jenis: "angka" },
    { kolom: "tb_cm", label: /tinggi\s*badan|\btb\b/i, jenis: "angka" },
    { kolom: "lila_cm", label: /\blila\b|lingkar\s*lengan/i, jenis: "angka" },
    TD,
    { kolom: "tfu_cm", label: /\btfu\b|tinggi\s*rahim|fundus/i, jenis: "angka", rentang: [5, 45] },
    { kolom: "letak_janin", label: /letak|presentasi/i, jenis: "pilihan" },
    { kolom: "djj", label: /\bdjj\b|denyut\s*jantung/i, jenis: "angka", rentang: [60, 220] },
    { kolom: "status_imunisasi_td", label: /imunisasi|tetanus/i, jenis: "pilihan" },
    { kolom: "hb", label: /\bhb\b|hemoglobin/i, jenis: "angka" },
    { kolom: "golongan_darah", label: /gol(?:ongan)?\.?\s*darah/i, jenis: "pilihan" },
    { kolom: "protein_urine", label: /protein/i, jenis: "pilihan" },
    { kolom: "gula_darah", label: /gula\s*darah|\bgds?\b/i, jenis: "angka" },
  ],
  kf: [
    TANGGAL,
    { kolom: "tempat", label: /\btempat\b/i, jenis: "teks" },
    TD,
    { kolom: "suhu_c", label: /suhu/i, jenis: "angka" },
    { kolom: "nadi", label: /\bnadi\b/i, jenis: "angka", rentang: [40, 180] },
    { kolom: "napas", label: /napas|nafas|respirasi/i, jenis: "angka", rentang: [8, 60] },
    NORMAL("lokhia_perdarahan", /lok[hi]+a|perdarahan/i),
    NORMAL("jalan_lahir", /jalan\s*lahir/i),
    NORMAL("kontraksi_tfu", /kontraksi/i),
    NORMAL("payudara_asi", /payudara/i),
  ],
  kn: [
    { kolom: "tempat", label: /\btempat\b/i, jenis: "teks" },
    { kolom: "bb_g", label: /berat\s*badan|\bbb\b/i, jenis: "angka" },
    { kolom: "pb_cm", label: /panjang\s*badan|\bpb\b/i, jenis: "angka" },
    { kolom: "lk_cm", label: /lingkar\s*kepala|\blk\b/i, jenis: "angka" },
    NORMAL("tali_pusat", /tali\s*pusat/i),
  ],
};

/** Kolom kunjungan (K1–K6, KF1–KF4, KN1–KN3) yang diminta: nama kolom penanda, nilainya, kepala kolom, dan urutannya. */
function kunjungan(tabel: string, ke: string) {
  if (tabel === "anc") return { kolom: "kunjungan_ke", nilai: Number(ke) as number | string, kepala: new RegExp(`^K\\s?${ke}$`, "i"), urut: Number(ke) - 1 };
  if (tabel === "kf") return { kolom: "kf_ke", nilai: Number(ke) as number | string, kepala: new RegExp(`^KF\\s?${ke}$`, "i"), urut: Number(ke) - 1 };
  return { kolom: "kn_ke", nilai: ke as number | string, kepala: new RegExp(`^${ke}$`, "i"), urut: Math.max(0, ["KN1", "KN2", "KN3"].indexOf(ke)) };
}

/** Menyusun kata menjadi baris tabel berdasarkan posisi tegaknya (Tesseract sering memecah sel tabel menjadi blok terpisah). */
function susunBaris(kata: Kata[]): Baris[] {
  const urut = [...kata].sort((a, b) => (a.y0 + a.y1) / 2 - (b.y0 + b.y1) / 2);
  const grup: Kata[][] = [];
  for (const k of urut) {
    const tengah = (k.y0 + k.y1) / 2;
    const akhir = grup[grup.length - 1];
    const acuan = akhir?.[0];
    // Satu baris bila titik tengah kata masih berada di dalam tinggi kata pertama baris itu.
    if (acuan && tengah > acuan.y0 && tengah < acuan.y1) akhir.push(k);
    else grup.push([k]);
  }
  return grup.map((g) => {
    const urutX = g.sort((a, b) => a.x0 - b.x0);
    let teks = "";
    const kataBaris = urutX.map((k) => {
      const awal = teks.length;
      teks += k.teks + " ";
      return { ...k, awal };
    });
    return { teks, kata: kataBaris };
  });
}

interface Calon {
  nilai: unknown;
  /** Titik tengah mendatar, untuk mencocokkan dengan kepala kolom kunjungan. */
  x: number;
  yakin: number;
}

const angka = (s: string) => Number(s.replace(/[.,]+/, "."));

/** Huruf yang sering muncul sebagai salah baca angka pada tulisan tangan. */
const MIRIP: Record<string, string> = { S: "5", s: "5", O: "0", o: "0", I: "1", l: "1", i: "1", Z: "2", z: "2", B: "8" };

/**
 * Mengganti huruf yang mirip angka (S→5, O→0, l→1) di dalam potongan yang seluruhnya berupa angka/huruf mirip angka.
 * Panjang teks tidak berubah, jadi posisi tiap kata tetap cocok.
 */
function luruskanAngka(teks: string): string {
  return teks.replace(/(?<![A-Za-z])[0-9SsOoIliZzB][0-9SsOoIliZzB.,/\\|-]*(?![A-Za-z])/g, (potong) => potong.replace(/[SsOoIliZzB]/g, (h) => MIRIP[h]));
}

/** Tanggal periksa hanya masuk akal di sekitar tahun ini; di luar itu hampir pasti salah baca. */
function isoTanggal(h: string, b: string, t: string): string | null {
  const tahun = t.length === 2 ? 2000 + Number(t) : Number(t);
  const hari = Number(h);
  const bulan = Number(b);
  const kini = new Date().getFullYear();
  if (hari < 1 || hari > 31 || bulan < 1 || bulan > 12 || tahun < kini - 1 || tahun > kini + 1) return null;
  return `${tahun}-${String(bulan).padStart(2, "0")}-${String(hari).padStart(2, "0")}`;
}

/** Semua nilai yang mungkin di satu baris, di sebelah kanan labelnya. */
function calonDiBaris(b: Baris, a: Aturan, mulai: number, pilihan: readonly string[] | undefined, rentang: [number, number] | undefined): Calon[] {
  const mentah = b.teks.slice(mulai);
  const sisa = a.jenis === "angka" || a.jenis === "td" || a.jenis === "tanggal" ? luruskanAngka(mentah) : mentah;
  /** Posisi mendatar potongan teks: dihitung di dalam katanya, karena Tesseract sering menggabungkan beberapa sel menjadi satu kata. */
  const calon = (nilai: unknown, pos: number, panjang: number): Calon => {
    const p = mulai + pos;
    const k = [...b.kata].reverse().find((x) => x.awal <= p) ?? b.kata[b.kata.length - 1];
    const bagian = Math.min(1, Math.max(0, (p - k.awal + panjang / 2) / Math.max(1, k.teks.length)));
    return { nilai, x: k.x0 + bagian * (k.x1 - k.x0), yakin: k.yakin };
  };
  const out: Calon[] = [];

  if (a.jenis === "td") {
    for (const m of sisa.matchAll(/(?<!\d)(\d{2,3})\s*[/|\\]\s*(\d{2,3})(?!\d)/g)) {
      const s = Number(m[1]);
      const d = Number(m[2]);
      if (s >= 70 && s <= 220 && d >= 40 && d <= 140 && s > d) out.push(calon([s, d], m.index, m[0].length));
    }
  } else if (a.jenis === "tanggal") {
    // Tanggal di kolom yang sempit sering terbaca menempel ("25/05/2606/07/26"), jadi tahun dua angka dicoba
    // bila empat angka berikutnya bukan tahun yang masuk akal, lalu pembacaan dilanjutkan dari angka sesudahnya.
    const pola = /(\d{1,2})\s*[/.\-]\s*(\d{1,2})\s*[/.\-]\s*(\d{2})(\d{2})?/g;
    let m: RegExpExecArray | null;
    while ((m = pola.exec(sisa))) {
      const empat = m[4] ? isoTanggal(m[1], m[2], m[3] + m[4]) : null;
      if (empat) {
        out.push(calon(empat, m.index, m[0].length));
        continue;
      }
      if (m[4]) pola.lastIndex -= 2;
      const dua = isoTanggal(m[1], m[2], m[3]);
      if (dua) out.push(calon(dua, m.index, m[0].length - (m[4] ? 2 : 0)));
    }
  } else if (a.jenis === "angka") {
    for (const m of sisa.matchAll(/\d+(?:[.,]{1,2}\d+)?/g)) {
      const v = angka(m[0]);
      if (!rentang || (v >= rentang[0] && v <= rentang[1])) out.push(calon(v, m.index, m[0].length));
    }
  } else if (a.jenis === "pilihan" && pilihan) {
    // Pilihan terpanjang dicoba lebih dulu supaya "tidak normal" tidak terbaca sebagai "Normal", dan "AB" bukan "A".
    const urut = [...pilihan].sort((x, y) => y.length - x.length);
    const lolos = urut.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")).join("|");
    const terpakai: [number, number][] = [];
    for (const m of sisa.matchAll(new RegExp(`(?<![A-Za-z0-9])(?:${lolos})(?![A-Za-z0-9])`, "gi"))) {
      if (terpakai.some(([s, e]) => m.index >= s && m.index < e)) continue;
      terpakai.push([m.index, m.index + m[0].length]);
      const cocok = urut.find((p) => p.toLowerCase().replace(/\s+/g, "") === m[0].toLowerCase().replace(/\s+/g, ""));
      if (cocok) out.push(calon(cocok, m.index, m[0].length));
    }
  } else if (a.jenis === "teks") {
    const t = sisa.replace(/^[\s:.\-|]+/, "").trim();
    if (t.length >= 3 && t.length <= 40) out.push({ ...calon(t, 0, sisa.length), yakin: 0.5 });
  }
  return out;
}

/** Calon yang berada di kolom kunjungan yang diminta: paling dekat ke kepala kolom, atau menurut urutan bila kepala tidak terbaca. */
function pilihCalon(cs: Calon[], xKepala: number | undefined, toleransi: number, urut: number): Calon | undefined {
  if (!cs.length) return undefined;
  if (xKepala !== undefined) {
    const terdekat = [...cs].sort((a, b) => Math.abs(a.x - xKepala) - Math.abs(b.x - xKepala))[0];
    return Math.abs(terdekat.x - xKepala) <= toleransi ? terdekat : undefined;
  }
  return cs[urut] ?? cs[cs.length - 1];
}

export interface HasilOcr {
  hasil: Record<string, unknown>;
  yakin: Record<string, number>;
  /** Teks mentah yang terbaca, untuk ditampilkan bila tidak ada isian yang dikenali. */
  teks: string;
}

/** Mengubah kata-kata hasil OCR menjadi isian kamus data untuk satu kolom kunjungan. Dipisah dari Tesseract supaya bisa diuji. */
export function petakan(kata: Kata[], lebar: number, tabel: string, ke: string): Omit<HasilOcr, "teks"> {
  const baris = susunBaris(kata);
  const kj = kunjungan(tabel, ke);
  const bersih = (k: Kata) => k.teks.replace(/[^A-Za-z0-9]/g, "");
  const kepala = kata.find((k) => kj.kepala.test(bersih(k)));
  const xKepala = kepala ? (kepala.x0 + kepala.x1) / 2 : undefined;
  // Sebuah nilai dianggap berada di kolom yang diminta bila jaraknya ke kepala kolom kurang dari setengah lebar kolom.
  // Lebar kolom diambil dari jarak antar kepala kolom (K1, K2, …) yang terbaca di baris yang sama.
  const sebaris = kepala ? kata.filter((k) => /^K[FN]?\d$/i.test(bersih(k)) && Math.abs(k.y0 - kepala.y0) < kepala.y1 - kepala.y0).map((k) => (k.x0 + k.x1) / 2).sort((a, b) => a - b) : [];
  const jarak = sebaris.slice(1).map((x, i) => x - sebaris[i]).filter((j) => j > 0);
  const toleransi = jarak.length ? Math.min(...jarak) * 0.5 : lebar * 0.06;
  const def = kamus.tabel[tabel].kolom;

  const hasil: Record<string, unknown> = { [kj.kolom]: kj.nilai };
  const yakin: Record<string, number> = { [kj.kolom]: 1 };
  const isi = (kolom: string, nilai: unknown, y: number) => {
    const kol = def[kolom];
    if (!kol || KOLOM_SENSITIF.has(kolom) || hasil[kolom] !== undefined) return;
    hasil[kolom] = nilai;
    // Nilai di luar rentang wajar tetap ditampilkan tetapi keyakinannya diturunkan agar disorot.
    yakin[kolom] = Math.min(YAKIN_MAKS, y) * (validasiNilai(kol, nilai).ok ? 1 : 0.3);
  };

  for (const a of ATURAN[tabel] ?? []) {
    for (const b of baris) {
      const m = a.label.exec(b.teks);
      if (!m || a.kecuali?.test(b.teks)) continue;
      const kol = def[a.kolom];
      const rentang = (kol?.rentang as [number, number] | undefined) ?? a.rentang;
      const c = pilihCalon(calonDiBaris(b, a, m.index + m[0].length, kol?.pilihan, rentang), xKepala, toleransi, kj.urut);
      if (!c) continue;
      if (a.jenis === "td") {
        const [s, d] = c.nilai as [number, number];
        isi("td_sistolik", s, c.yakin);
        isi("td_diastolik", d, c.yakin);
      } else isi(a.kolom, c.nilai, c.yakin);
      break;
    }
  }
  return { hasil, yakin };
}

/**
 * Menyiapkan foto untuk Tesseract: dijadikan hitam-putih, lalu garis tabel dihapus.
 * Garis tabel membuat Tesseract salah memotong kata; deretan piksel gelap yang panjang (mendatar atau tegak) dianggap garis.
 */
async function hapusGarisTabel(gambar: string): Promise<string> {
  // createImageBitmap tidak bergantung pada halaman yang sedang digambar (img.decode() bisa menggantung di tab latar).
  const img = await createImageBitmap(await (await fetch(gambar)).blob());
  // Diperbesar sampai lebar ±2600 px (paling banyak 2×): huruf yang kecil lebih mudah dikenali Tesseract.
  const skala = Math.max(1, Math.min(2, 2600 / img.width));
  const W = Math.round(img.width * skala);
  const H = Math.round(img.height * skala);
  const kanvas = document.createElement("canvas");
  kanvas.width = W;
  kanvas.height = H;
  const g = kanvas.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, W, H);
  const data = g.getImageData(0, 0, W, H);
  const d = data.data;
  const gelap = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) gelap[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2] < 150 ? 1 : 0;
  const garis = new Uint8Array(W * H);
  const minimal = Math.max(60, Math.round(W * 0.045));
  for (let y = 0; y < H; y++) {
    let awal = -1;
    for (let x = 0; x <= W; x++) {
      const nyala = x < W && gelap[y * W + x] === 1;
      if (nyala && awal < 0) awal = x;
      if (!nyala && awal >= 0) {
        if (x - awal >= minimal) for (let k = awal; k < x; k++) garis[y * W + k] = 1;
        awal = -1;
      }
    }
  }
  for (let x = 0; x < W; x++) {
    let awal = -1;
    for (let y = 0; y <= H; y++) {
      const nyala = y < H && gelap[y * W + x] === 1;
      if (nyala && awal < 0) awal = y;
      if (!nyala && awal >= 0) {
        if (y - awal >= minimal) for (let k = awal; k < y; k++) garis[k * W + x] = 1;
        awal = -1;
      }
    }
  }
  for (let i = 0; i < W * H; i++) {
    const v = gelap[i] && !garis[i] ? 0 : 255;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return kanvas.toDataURL("image/png");
}

/** Membaca foto di perangkat. `padaProses` menerima kemajuan 0–1 untuk ditampilkan ke petugas. */
export async function bacaDiPerangkat(gambar: string, tabel: string, ke: string, padaProses?: (p: number) => void): Promise<HasilOcr> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("ind", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") padaProses?.(m.progress);
    },
  });
  try {
    // PSM 6: seluruh foto dianggap satu blok teks, sehingga tiap baris tabel terbaca sebagai satu baris.
    await worker.setParameters({ tessedit_pageseg_mode: "6" as never });
    const { data } = await worker.recognize(await hapusGarisTabel(gambar), {}, { blocks: true });
    const kata: Kata[] = [];
    let lebar = 0;
    for (const blok of data.blocks ?? []) {
      lebar = Math.max(lebar, blok.bbox.x1);
      for (const par of blok.paragraphs) {
        for (const garis of par.lines) {
          for (const w of garis.words) {
            const teks = w.text.trim();
            if (teks) kata.push({ teks, yakin: w.confidence / 100, ...w.bbox });
          }
        }
      }
    }
    return { ...petakan(kata, lebar, tabel, ke), teks: data.text.trim() };
  } finally {
    await worker.terminate();
  }
}
