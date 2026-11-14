/**
 * Pembaca foto Buku KIA di perangkat (Tesseract.js), dipakai bila server tidak punya kunci AI.
 * Foto tidak dikirim ke mana pun: mesin OCR berjalan di peramban.
 *
 * Cara kerja:
 * 1. Foto dijadikan hitam-putih dan garis tabelnya dicari. Dari garis itu didapat kisi baris dan kolom.
 * 2. Kolom label dibaca untuk mengenali tiap baris (mis. "Berat Badan", "Tekanan Darah").
 * 3. Sel pada kolom kunjungan yang diminta dibaca satu per satu. Membaca satu sel jauh lebih tepat daripada
 *    membaca seluruh halaman, dan sel bercentang bisa dikenali dari bentuk tintanya.
 * Bila kisi tidak ditemukan (foto miring atau tanpa garis), seluruh halaman dibaca per baris sebagai cadangan.
 * Tesseract dilatih untuk huruf cetak, jadi tulisan tangan tetap sering meleset; keyakinan setiap isian dibatasi
 * di bawah ambang "yakin" sehingga semuanya wajib dicek petugas.
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

/** "ya": sel centang (ya/tidak), dikenali dari bentuk tinta di dalam sel, hanya pada mode kisi. */
type Jenis = "angka" | "td" | "tanggal" | "pilihan" | "teks" | "ya";
interface Aturan {
  kolom: string;
  label: RegExp;
  jenis: Jenis;
  /** Rentang wajar bila kamus tidak menyebutkannya. */
  rentang?: [number, number];
  /** Baris yang cocok dengan pola ini dilewati (mis. "Tanggal kembali" untuk "Tanggal periksa"). */
  kecuali?: RegExp;
}

const TANGGAL: Aturan = { kolom: "tanggal", label: /\btanggal\b|\btgl\b/i, jenis: "tanggal", kecuali: /kembali|lahir|tanggal\s*dan\s*tempat/i };
const TD: Aturan = { kolom: "td", label: /tekanan\s*darah|\btd\b|tensi/i, jenis: "td" };
const NORMAL = (kolom: string, label: RegExp): Aturan => ({ kolom, label, jenis: "pilihan" });
const YA = (kolom: string, label: RegExp): Aturan => ({ kolom, label, jenis: "ya" });
const TEMPAT: Aturan = { kolom: "tempat", label: /tempat\s*periksa|\btempat\b/i, jenis: "teks", kecuali: /tanggal\s*dan\s*tempat/i };

const ATURAN: Record<string, Aturan[]> = {
  anc: [
    { kolom: "tanggal_kembali", label: /kembali/i, jenis: "tanggal" },
    TANGGAL,
    TEMPAT,
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
    YA("konseling", /konseling/i),
    YA("skrining_dokter", /skrining\s*dokter/i),
    YA("ttd_mms", /tablet\s*tambah\s*darah|\bttd\b|\bmms\b/i),
    YA("usg", /\busg\b/i),
  ],
  kf: [
    TANGGAL,
    TEMPAT,
    TD,
    { kolom: "suhu_c", label: /suhu/i, jenis: "angka" },
    { kolom: "nadi", label: /\bnadi\b/i, jenis: "angka", rentang: [40, 180] },
    { kolom: "napas", label: /napas|nafas|respirasi/i, jenis: "angka", rentang: [8, 60] },
    NORMAL("lokhia_perdarahan", /lok[hi]+a|perdarahan/i),
    NORMAL("jalan_lahir", /jalan\s*lahir/i),
    NORMAL("kontraksi_tfu", /kontraksi/i),
    NORMAL("payudara_asi", /payudara/i),
    YA("vit_a", /vit(?:amin)?\.?\s*a\b/i),
    YA("kb_pasca", /kb\s*pasca|kontrasepsi/i),
    YA("konseling", /konseling/i),
  ],
  kn: [
    TEMPAT,
    { kolom: "bb_g", label: /berat\s*badan|\bbb\b/i, jenis: "angka" },
    { kolom: "pb_cm", label: /panjang\s*badan|\bpb\b/i, jenis: "angka" },
    { kolom: "lk_cm", label: /lingkar\s*kepala|\blk\b/i, jenis: "angka" },
    NORMAL("tali_pusat", /tali\s*pusat/i),
    YA("menyusu", /menyusu|\bimd\b/i),
    YA("vit_k1", /vit(?:amin)?\.?\s*k/i),
    YA("salep_mata", /salep|tetes\s*mata/i),
    YA("hb0", /hepatitis|\bhb\s*0\b/i),
    YA("shk", /hipotiroid|\bshk\b/i),
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

/**
 * Tanggal dengan tahun yang salah baca ("13/11/2072"): hari dan bulannya dipakai, tahunnya dipilih yang membuat
 * tanggal paling dekat dengan hari ini. Kunjungan dicatat tidak lama setelah terjadi, jadi tebakan ini biasanya benar.
 */
function tebakTahun(h: string, b: string): string | null {
  const hari = Number(h);
  const bulan = Number(b);
  if (hari < 1 || hari > 31 || bulan < 1 || bulan > 12) return null;
  const kini = new Date();
  const calon = [kini.getFullYear() - 1, kini.getFullYear(), kini.getFullYear() + 1].map((t) => new Date(t, bulan - 1, hari));
  const dekat = calon.sort((x, y) => Math.abs(x.getTime() - kini.getTime()) - Math.abs(y.getTime() - kini.getTime()))[0];
  return `${dekat.getFullYear()}-${String(bulan).padStart(2, "0")}-${String(hari).padStart(2, "0")}`;
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
    // Titik yang terselip di dalam angka tanggal bergaris miring ("13/11/2.02.6") dibuang lebih dulu.
    const rapi = sisa.includes("/") ? sisa.replace(/(?<=\d)\.(?=\d)/g, "") : sisa;
    while ((m = pola.exec(rapi))) {
      const empat = m[4] ? isoTanggal(m[1], m[2], m[3] + m[4]) : null;
      if (empat) {
        out.push(calon(empat, m.index, m[0].length));
        continue;
      }
      const dua = isoTanggal(m[1], m[2], m[3]);
      if (dua) {
        if (m[4]) pola.lastIndex -= 2;
        out.push(calon(dua, m.index, m[0].length - (m[4] ? 2 : 0)));
        continue;
      }
      // Tahun empat angka yang tidak masuk akal: kemungkinan besar salah baca, bukan dua tanggal yang menempel.
      const tebak = m[4] ? tebakTahun(m[1], m[2]) : null;
      if (tebak) {
        const c = calon(tebak, m.index, m[0].length);
        out.push({ ...c, yakin: c.yakin * 0.5 });
      } else if (m[4]) pola.lastIndex -= 2;
    }
  } else if (a.jenis === "angka") {
    for (const m of sisa.matchAll(/\d+(?:[.,]{1,2}\d+)?/g)) {
      const v = angka(m[0]);
      if (!rentang || (v >= rentang[0] && v <= rentang[1])) out.push(calon(v, m.index, m[0].length));
      else {
        // Titik atau koma sering terselip di antara angka tulisan tangan: "2.5" di baris LILA sebenarnya 25.
        const rapat = Number(m[0].replace(/[.,]/g, ""));
        if (rapat !== v && rapat >= rentang[0] && rapat <= rentang[1]) {
          const c = calon(rapat, m.index, m[0].length);
          out.push({ ...c, yakin: c.yakin * 0.6 });
        }
      }
    }
  } else if (a.kolom === "golongan_darah" && pilihan) {
    // Golongan darah ditulis singkat ("O+", "AB"): ambil huruf di awal sel; "0" tulisan tangan berarti O.
    const m = /^[\s:.\-|]*(AB|A|B|O|0)(?![A-Za-z]{2})/i.exec(mentah);
    const gol = m?.[1].toUpperCase().replace("0", "O");
    if (m && gol && pilihan.includes(gol)) out.push(calon(gol, m.index, m[0].length));
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
    const t = sisa.replace(/[|_]+/g, " ").replace(/\s+/g, " ").replace(/^[\s:.\-]+|[\s:.\-]+$/g, "");
    const c = calon(t, 0, sisa.length);
    // Teks bebas tulisan tangan (nama tempat) sering terbaca ngawur. Hanya diterima bila memuat kata tempat layanan
    // yang dikenal atau Tesseract sangat yakin; selain itu lebih baik kosong daripada salah.
    const dikenal = /puskesmas|posyandu|pustu|polindes|poskesdes|klinik|rumah\s*sakit|\brs\b|\brsud\b|\bpmb\b|\bbpm\b|bidan/i.test(t);
    if (t.length >= 3 && t.length <= 40 && (dikenal || c.yakin >= 0.75)) out.push({ ...c, yakin: Math.min(c.yakin, 0.6) });
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
  /** Saran untuk petugas, mis. bila kolom kunjungan yang dipilih kosong tetapi kolom lain terisi. */
  saran?: string;
}

/** Mengubah kata-kata hasil OCR menjadi isian kamus data untuk satu kolom kunjungan. Dipisah dari Tesseract supaya bisa diuji. */
export function petakan(kata: Kata[], lebar: number, tabel: string, ke: string): HasilOcr {
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

/** Rentang piksel sebuah baris atau kolom kisi (di antara dua garis tabel). */
interface Pita {
  awal: number;
  akhir: number;
}

interface Foto {
  kanvas: HTMLCanvasElement;
  W: number;
  H: number;
  /** 1 = tinta (gelap dan bukan garis tabel). */
  tinta: Uint8Array;
  /** Kisi tabel bila garis-garisnya ditemukan. */
  kisi: { baris: Pita[]; kolom: Pita[] } | null;
}

/** Ambang gelap-terang cara Otsu, dibatasi supaya garis abu-abu tetap terhitung dan arsiran sel tidak. */
function ambangOtsu(abu: Uint8Array): number {
  const hist = new Array<number>(256).fill(0);
  for (let i = 0; i < abu.length; i++) hist[abu[i]]++;
  let jumlah = 0;
  for (let i = 0; i < 256; i++) jumlah += i * hist[i];
  let wB = 0;
  let jB = 0;
  let terbaik = 0;
  let ambang = 150;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = abu.length - wB;
    if (!wF) break;
    jB += t * hist[t];
    const selisih = jB / wB - (jumlah - jB) / wF;
    const antar = wB * wF * selisih * selisih;
    if (antar > terbaik) {
      terbaik = antar;
      ambang = t;
    }
  }
  return Math.max(120, Math.min(190, ambang));
}

/**
 * Kemiringan foto dalam derajat. Gambar dikecilkan, lalu untuk tiap sudut dihitung seberapa "tajam" tumpukan piksel
 * gelap per baris: pada sudut yang benar, garis tabel dan baris tulisan jatuh tepat di baris piksel yang sama.
 */
function sudutMiring(img: ImageBitmap): number {
  const w = 480;
  const h = Math.max(1, Math.round((img.height / img.width) * w));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const titik: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (0.299 * d[(y * w + x) * 4] + 0.587 * d[(y * w + x) * 4 + 1] + 0.114 * d[(y * w + x) * 4 + 2] < 140) titik.push(x, y);
  if (titik.length < 200) return 0;
  let terbaik = 0;
  let nilaiTerbaik = -1;
  for (let sudut = -4; sudut <= 4.001; sudut += 0.25) {
    const t = Math.tan((sudut * Math.PI) / 180);
    const baris = new Float64Array(h * 2);
    for (let i = 0; i < titik.length; i += 2) {
      const y = Math.round(titik[i + 1] - (titik[i] - w / 2) * t) + Math.floor(h / 2);
      if (y >= 0 && y < baris.length) baris[y]++;
    }
    let nilai = 0;
    for (let y = 0; y < baris.length; y++) nilai += baris[y] * baris[y];
    if (nilai > nilaiTerbaik) {
      nilaiTerbaik = nilai;
      terbaik = sudut;
    }
  }
  return terbaik;
}

/** Celah di antara garis-garis yang bertanda: itulah baris/kolom kisi. */
function celah(tanda: Uint8Array, minimal: number): Pita[] {
  const out: Pita[] = [];
  let pernahGaris = false;
  let awal = -1;
  for (let i = 0; i < tanda.length; i++) {
    if (tanda[i]) {
      if (pernahGaris && awal >= 0 && i - awal >= minimal) out.push({ awal, akhir: i });
      pernahGaris = true;
      awal = -1;
    } else if (awal < 0) awal = i;
  }
  return out;
}

/**
 * Menyiapkan foto untuk Tesseract: diperbesar, dijadikan hitam-putih, lalu garis tabel dihapus.
 * Garis tabel membuat Tesseract salah memotong kata; deretan piksel gelap yang panjang (mendatar atau tegak)
 * dianggap garis. Dari garis-garis itu juga dicari kisi baris dan kolom tabel.
 */
async function siapkan(gambar: string): Promise<Foto> {
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
  g.fillStyle = "#fff";
  g.fillRect(0, 0, W, H);
  // Foto dari HP hampir selalu sedikit miring; diluruskan dulu supaya garis tabel tepat mendatar dan tegak.
  const miring = sudutMiring(img);
  if (Math.abs(miring) >= 0.25) {
    g.translate(W / 2, H / 2);
    g.rotate((-miring * Math.PI) / 180);
    g.translate(-W / 2, -H / 2);
  }
  g.drawImage(img, 0, 0, W, H);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const data = g.getImageData(0, 0, W, H);
  const d = data.data;
  const abu = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) abu[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
  const ambang = ambangOtsu(abu);
  const gelap = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) gelap[i] = abu[i] < ambang ? 1 : 0;

  const garis = new Uint8Array(W * H);
  /** Banyaknya piksel garis mendatar per baris piksel, dan garis tegak per kolom piksel. */
  const mendatar = new Float64Array(H);
  const tegak = new Float64Array(W);
  const minimal = Math.max(60, Math.round(W * 0.045));
  for (let y = 0; y < H; y++) {
    let awal = -1;
    for (let x = 0; x <= W; x++) {
      const nyala = x < W && gelap[y * W + x] === 1;
      if (nyala && awal < 0) awal = x;
      if (!nyala && awal >= 0) {
        if (x - awal >= minimal) {
          for (let k = awal; k < x; k++) garis[y * W + k] = 1;
          mendatar[y] += x - awal;
        }
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
        if (y - awal >= minimal) {
          for (let k = awal; k < y; k++) garis[k * W + x] = 1;
          tegak[x] += y - awal;
        }
        awal = -1;
      }
    }
  }

  const tinta = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    tinta[i] = gelap[i] && !garis[i] ? 1 : 0;
    const v = tinta[i] ? 0 : 255;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  g.putImageData(data, 0, 0);

  // Kisi: garis mendatar yang menutup sebagian besar lebar tabel, dan garis tegak yang menutup sebagian besar tingginya.
  const lebarTabel = Math.max(...mendatar);
  const tandaBaris = new Uint8Array(H);
  for (let y = 0; y < H; y++) tandaBaris[y] = lebarTabel > 0 && mendatar[y] >= lebarTabel * 0.5 ? 1 : 0;
  const baris = celah(tandaBaris, Math.round(H * 0.008));
  const tinggiTabel = baris.length ? baris[baris.length - 1].akhir - baris[0].awal : 0;
  const tandaKolom = new Uint8Array(W);
  for (let x = 0; x < W; x++) tandaKolom[x] = tinggiTabel > 0 && tegak[x] >= tinggiTabel * 0.35 ? 1 : 0;
  const kolom = celah(tandaKolom, Math.round(W * 0.02));
  const kisi = baris.length >= 3 && kolom.length >= 2 ? { baris, kolom } : null;
  return { kanvas, W, H, tinta, kisi };
}

/** Jarak dari garis sel yang diabaikan, supaya sisa garis yang tidak terhapus tidak ikut terhitung atau terbaca. */
const tepiSel = (b: Pita) => Math.max(4, Math.round((b.akhir - b.awal) * 0.1));

/** Sel dianggap kosong bila tintanya lebih sedikit dari ini (bintik atau sisa garis). */
const TINTA_MINIMAL = 25;

/** Tinta di dalam satu sel: jumlah piksel dan kotak pembatasnya, dengan sedikit jarak dari garis sel. */
function tintaSel(f: Foto, b: Pita, k: Pita) {
  const tepi = tepiSel(b);
  let n = 0;
  let x0 = Infinity;
  let x1 = -1;
  let y0 = Infinity;
  let y1 = -1;
  for (let y = b.awal + tepi; y < b.akhir - tepi; y++) {
    for (let x = k.awal + tepi; x < k.akhir - tepi; x++) {
      if (!f.tinta[y * f.W + x]) continue;
      n++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const lebar = x1 - x0 + 1;
  const tinggi = y1 - y0 + 1;
  // Sisa garis sel berupa bintik tipis di tepi; tulisan atau centang punya lebar dan tinggi yang nyata.
  return { n, lebar, tinggi, berisi: n >= TINTA_MINIMAL && lebar >= 8 && tinggi >= 8 };
}

/** Potongan satu sel sebagai gambar tersendiri, diperbesar dan diberi tepi putih supaya mudah dibaca Tesseract. */
function potongSel(f: Foto, b: Pita, k: Pita): string {
  // Tepi yang dibuang di sini sengaja tipis: tulisan tangan sering menyentuh garis sel, dan memotongnya merusak bacaan.
  const tepi = 4;
  const w = k.akhir - k.awal - tepi * 2;
  const h = b.akhir - b.awal - tepi * 2;
  const skala = Math.max(1, Math.min(3, 110 / h));
  const bantalan = 14;
  const c = document.createElement("canvas");
  c.width = Math.round(w * skala) + bantalan * 2;
  c.height = Math.round(h * skala) + bantalan * 2;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, c.width, c.height);
  g.imageSmoothingQuality = "high";
  g.drawImage(f.kanvas, k.awal + tepi, b.awal + tepi, w, h, bantalan, bantalan, Math.round(w * skala), Math.round(h * skala));
  return c.toDataURL("image/png");
}

type Pekerja = import("tesseract.js").Worker;

/** Kata-kata hasil satu kali baca, beserta posisinya. */
async function baca(worker: Pekerja, gambar: string, psm: string, huruf = ""): Promise<Kata[]> {
  // `huruf`: bila diisi, Tesseract hanya boleh mengeluarkan karakter itu (dipakai untuk sel yang isinya angka).
  await worker.setParameters({ tessedit_pageseg_mode: psm as never, tessedit_char_whitelist: huruf });
  const { data } = await worker.recognize(gambar, {}, { blocks: true });
  const kata: Kata[] = [];
  for (const blok of data.blocks ?? []) {
    for (const par of blok.paragraphs) {
      for (const garis of par.lines) {
        for (const w of garis.words) {
          const teks = w.text.trim();
          if (teks) kata.push({ teks, yakin: w.confidence / 100, ...w.bbox });
        }
      }
    }
  }
  return kata;
}

/** Membaca tabel sel demi sel memakai kisi yang ditemukan dari garis-garisnya. */
async function bacaKisi(worker: Pekerja, f: Foto, tabel: string, ke: string, padaProses?: (p: number) => void): Promise<HasilOcr | null> {
  const kisi = f.kisi!;
  const kj = kunjungan(tabel, ke);
  const kolomLabel = kisi.kolom[0];
  const kolomNilai = kisi.kolom[kj.urut + 1];
  if (!kolomNilai) return null;

  // Label tiap baris: kolom pertama dibaca sekali, lalu kata-katanya dibagi ke baris kisi menurut posisi tegaknya.
  const c = document.createElement("canvas");
  c.width = kolomLabel.akhir - kolomLabel.awal;
  c.height = f.H;
  c.getContext("2d")!.drawImage(f.kanvas, kolomLabel.awal, 0, c.width, f.H, 0, 0, c.width, f.H);
  const kataLabel = await baca(worker, c.toDataURL("image/png"), "6");
  const label = kisi.baris.map((b) =>
    kataLabel
      .filter((k) => (k.y0 + k.y1) / 2 >= b.awal && (k.y0 + k.y1) / 2 < b.akhir)
      .sort((x, y) => x.x0 - y.x0)
      .map((k) => k.teks)
      .join(" "),
  );
  if (!label.some((l) => (ATURAN[tabel] ?? []).some((a) => a.label.test(l)))) return null;

  const def = kamus.tabel[tabel].kolom;
  const hasil: Record<string, unknown> = { [kj.kolom]: kj.nilai };
  const yakin: Record<string, number> = { [kj.kolom]: 1 };
  const isi = (kolom: string, nilai: unknown, y: number) => {
    const kol = def[kolom];
    if (!kol || KOLOM_SENSITIF.has(kolom) || hasil[kolom] !== undefined) return;
    hasil[kolom] = nilai;
    yakin[kolom] = Math.min(YAKIN_MAKS, y) * (validasiNilai(kol, nilai).ok ? 1 : 0.3);
  };

  // Tiap sel hanya dibaca sekali walau dipakai beberapa aturan (mis. "Letak dan Denyut Jantung bayi").
  const tersimpan = new Map<string, Baris>();
  const bacaSel = async (r: number, huruf = ""): Promise<Baris> => {
    const kunci = `${r}|${huruf}`;
    const ada = tersimpan.get(kunci);
    if (ada) return ada;
    const kata = await baca(worker, potongSel(f, kisi.baris[r], kolomNilai), "7", huruf);
    let teks = "";
    const b: Baris = {
      teks: "",
      kata: kata.map((k) => {
        const awal = teks.length;
        teks += k.teks + " ";
        return { ...k, awal };
      }),
    };
    b.teks = teks;
    tersimpan.set(kunci, b);
    return b;
  };

  const aturan = ATURAN[tabel] ?? [];
  for (const [i, a] of aturan.entries()) {
    padaProses?.(i / aturan.length);
    const r = label.findIndex((l) => a.label.test(l) && !a.kecuali?.test(l));
    if (r < 0) continue;
    const tinta = tintaSel(f, kisi.baris[r], kolomNilai);
    if (a.jenis !== "ya" && !tinta.berisi) continue;
    if (a.jenis === "ya") {
      if (tinta.n < TINTA_MINIMAL) continue;
      // Garis pendek mendatar ("–") berarti tidak ada; selain itu (centang, "ya", atau keterangan) berarti ya.
      const strip = tinta.tinggi <= (kisi.baris[r].akhir - kisi.baris[r].awal) * 0.22 && tinta.lebar >= tinta.tinggi * 2;
      isi(a.kolom, !strip, 0.7);
      continue;
    }
    const kol = def[a.kolom];
    const rentang = (kol?.rentang as [number, number] | undefined) ?? a.rentang;
    let calon = calonDiBaris(await bacaSel(r), a, 0, kol?.pilihan, rentang)[0];
    // Sel angka yang gagal dibaca dicoba sekali lagi dengan hanya mengizinkan angka dan tanda bacanya.
    if (!calon && (a.jenis === "angka" || a.jenis === "td" || a.jenis === "tanggal")) {
      const kedua = calonDiBaris(await bacaSel(r, "0123456789/.,-"), a, 0, kol?.pilihan, rentang)[0];
      if (kedua) calon = { ...kedua, yakin: kedua.yakin * 0.8 };
    }
    if (!calon) continue;
    if (a.jenis === "td") {
      const [sis, dia] = calon.nilai as [number, number];
      isi("td_sistolik", sis, calon.yakin);
      isi("td_diastolik", dia, calon.yakin);
    } else isi(a.kolom, calon.nilai, calon.yakin);
  }

  // Bila kolom yang dipilih kosong tetapi kolom lain berisi, kemungkinan petugas salah memilih kolom kunjungan.
  let saran: string | undefined;
  const terisi = (k: Pita) => kisi.baris.filter((b) => tintaSel(f, b, k).berisi).length;
  // Tulisan dari kolom sebelah kadang melewati garis, jadi "kosong" berarti hampir tidak ada sel yang berisi.
  if (Object.keys(hasil).length <= 1 && terisi(kolomNilai) < 3) {
    const jumlah = kisi.kolom.slice(1).map(terisi);
    const terbanyak = Math.max(...jumlah);
    if (terbanyak >= 3) saran = `Kolom kunjungan yang dipilih kosong di foto ini. Isian terlihat di kolom ke-${jumlah.indexOf(terbanyak) + 1}. Ganti pilihan "Kolom kunjungan", lalu baca ulang.`;
  }
  return { hasil, yakin, saran };
}

/** Membaca foto di perangkat. `padaProses` menerima kemajuan 0–1 untuk ditampilkan ke petugas. */
export async function bacaDiPerangkat(gambar: string, tabel: string, ke: string, padaProses?: (p: number) => void): Promise<HasilOcr> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("ind", 1);
  try {
    const f = await siapkan(gambar);
    if (f.kisi) {
      const dariKisi = await bacaKisi(worker, f, tabel, ke, padaProses);
      if (dariKisi) return dariKisi;
    }
    // Cadangan: seluruh foto dianggap satu blok teks (PSM 6), sehingga tiap baris tabel terbaca sebagai satu baris.
    const kata = await baca(worker, f.kanvas.toDataURL("image/png"), "6");
    return petakan(kata, f.W, tabel, ke);
  } finally {
    await worker.terminate();
  }
}
