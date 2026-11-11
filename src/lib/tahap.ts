import type { Catatan, Ibu } from "./types";
import { parse, selisihHari, selisihJam, tambahHari } from "./tanggal";

export type KodeTahap = "T1" | "T2" | "T3" | "nifas" | "anak" | "belum";
export type SetMenu = "hamil" | "nifas" | "tumbuh" | "belum";

export interface Tahap {
  kode: KodeTahap;
  set: SetMenu;
  label: string;
  sublabel: string;
  hpht?: Date;
  hpl?: Date;
  sumberHpl?: "USG T1" | "HPHT";
  ukHari?: number;
  ukMinggu?: number;
  ukSisaHari?: number;
  trimester?: 1 | 2 | 3;
  /** 0..1, untuk progress bar kehamilan (40 minggu) atau nifas (42 hari). */
  progres: number;
  lahir?: Date;
  hariNifas?: number;
  umurBayiHari?: number;
  jamSejakLahir?: number;
}

/** Akses catatan per tabel, diurutkan dari yang paling lama. */
export type Pencari = (tabel: string) => Catatan[];

export function buatPencari(semua: Catatan[], ibuId: string): Pencari {
  const per: Record<string, Catatan[]> = {};
  for (const c of semua) {
    if (c.ibuId !== ibuId) continue;
    // Hasil foto yang belum dikonfirmasi tidak pernah dipakai (aturan bagian 2).
    if (c.meta.sumber === "foto (OCR)" && !c.meta.dikonfirmasi_oleh) continue;
    (per[c.tabel] ??= []).push(c);
  }
  for (const k of Object.keys(per)) {
    per[k].sort((a, b) => urutKey(a).localeCompare(urutKey(b)));
  }
  return (t) => per[t] ?? [];
}

function urutKey(c: Catatan): string {
  const d = c.data;
  const t = (d.tanggal ?? d.tanggal_jam ?? d.tanggal_rujuk ?? c.meta.dibuat_pada) as string;
  const k = String(d.kunjungan_ke ?? d.kf_ke ?? d.minggu_kehamilan ?? d.hari_ke ?? "").padStart(3, "0");
  return `${t ?? ""}|${k}`;
}

export function terakhir(cari: Pencari, tabel: string): Catatan | undefined {
  const l = cari(tabel);
  return l[l.length - 1];
}

export function hitungHpl(cari: Pencari): { hpl?: Date; hpht?: Date; sumber?: "USG T1" | "HPHT" } {
  const r = terakhir(cari, "riwayat")?.data;
  const hpht = parse(r?.hpht);
  const usgRiwayat = parse(r?.hpl_usg);
  const usgDokter = parse(terakhir(cari, "dokter_t1")?.data.usg_hpl);
  const usg = usgRiwayat ?? usgDokter;
  if (usg) return { hpl: usg, hpht: hpht ?? tambahHari(usg, -280), sumber: "USG T1" };
  if (hpht) return { hpl: tambahHari(hpht, 280), hpht, sumber: "HPHT" };
  return {};
}

export function hitungTahap(_ibu: Ibu, cari: Pencari, now: Date): Tahap {
  const persalinan = terakhir(cari, "persalinan");
  const lahir = parse(persalinan?.data.tanggal_jam);
  if (lahir) {
    const hariNifas = selisihHari(now, lahir) + 1;
    const jam = selisihJam(now, lahir);
    if (hariNifas <= 42) {
      return {
        kode: "nifas",
        set: "nifas",
        label: `Nifas hari ke-${hariNifas}`,
        sublabel: `Bayi berumur ${hariNifas - 1} hari · masa nifas sampai hari ke-42`,
        lahir,
        hariNifas,
        umurBayiHari: hariNifas - 1,
        jamSejakLahir: jam,
        progres: Math.min(1, hariNifas / 42),
      };
    }
    const umur = hariNifas - 1;
    return {
      kode: "anak",
      set: "tumbuh",
      label: `Anak berumur ${Math.floor(umur / 30)} bulan`,
      sublabel: "Tumbuh kembang anak (lapisan 2–3, segera hadir)",
      lahir,
      umurBayiHari: umur,
      progres: 1,
    };
  }

  const { hpl, hpht, sumber } = hitungHpl(cari);
  if (!hpl) {
    return { kode: "belum", set: "belum", label: "Data kehamilan belum lengkap", sublabel: "Minta kader/bidan mengisi HPHT", progres: 0 };
  }
  const ukHari = 280 - selisihHari(hpl, now);
  const ukMinggu = Math.floor(ukHari / 7);
  const ukSisaHari = ukHari - ukMinggu * 7;
  const trimester: 1 | 2 | 3 = ukMinggu <= 12 ? 1 : ukMinggu <= 24 ? 2 : 3;
  return {
    kode: (`T${trimester}` as KodeTahap),
    set: "hamil",
    label: `Hamil ${ukMinggu} minggu${ukSisaHari ? ` ${ukSisaHari} hari` : ""}`,
    sublabel: `Trimester ${trimester} · HPL ${hpl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    hpht,
    hpl,
    sumberHpl: sumber,
    ukHari,
    ukMinggu,
    ukSisaHari,
    trimester,
    progres: Math.max(0, Math.min(1, ukHari / 280)),
  };
}

/** Usia kehamilan (minggu) pada tanggal tertentu, dari HPL. */
export function ukPada(hpl: Date | undefined, tanggal: Date): number | undefined {
  if (!hpl) return undefined;
  return Math.floor((280 - selisihHari(hpl, tanggal)) / 7);
}

export function imt(bb?: number, tbCm?: number): number | undefined {
  if (!bb || !tbCm) return undefined;
  const m = tbCm / 100;
  return Math.round((bb / (m * m)) * 10) / 10;
}

export function kategoriImt(v?: number): { kunci: string; label: string; target: [number, number] } | undefined {
  if (v === undefined) return undefined;
  // Rentang kenaikan BB total dari kamus (grafik_bb.target_kenaikan, Buku KIA hlm. 108).
  if (v < 18.5) return { kunci: "<18,5", label: "Kurus", target: [12.5, 18] };
  if (v < 25) return { kunci: "18,5–24,9", label: "Normal", target: [11.5, 16] };
  if (v < 30) return { kunci: "25–29,9", label: "Gemuk", target: [7, 11.5] };
  return { kunci: ">=30", label: "Obesitas", target: [5, 9] };
}

/**
 * Perkiraan rentang kenaikan BB pada minggu tertentu: 0,5–2 kg di akhir minggu ke-13,
 * lalu naik linear sampai rentang total di minggu ke-40. Ini pendekatan untuk menggambar
 * pita grafik; acuan resmi tetap grafik Buku KIA hlm. 108.
 */
export function rentangKenaikan(minggu: number, target: [number, number]): [number, number] {
  if (minggu <= 13) return [(0.5 * minggu) / 13, (2 * minggu) / 13];
  const f = Math.min(1, (minggu - 13) / 27);
  return [0.5 + (target[0] - 0.5) * f, 2 + (target[1] - 2) * f];
}
