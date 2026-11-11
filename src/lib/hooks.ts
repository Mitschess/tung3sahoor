"use client";

import { useEffect, useMemo, useState } from "react";
import { bolehLihatIbu, saringPeringatan } from "./akses";
import { evaluasi, terbuka, warnaIbu, type Warna } from "./aturan";
import { jadwal, kunjunganBerikut, type Kunjungan } from "./jadwal";
import { usePengguna, useStore } from "./store";
import { buatPencari, hitungTahap, type Pencari, type Tahap } from "./tahap";
import type { Catatan, Ibu, Peringatan } from "./types";

export function useSiap(): boolean {
  return useStore((s) => s.sudahSiap);
}

/** Waktu "sekarang" yang diperbarui tiap menit (untuk jendela kunjungan & umur bayi). */
export function useSekarang(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export interface Ringkasan {
  ibu: Ibu;
  cari: Pencari;
  tahap: Tahap;
  jadwal: Kunjungan[];
  berikut?: Kunjungan;
  /** Semua peringatan (sebelum disaring peran & status). */
  semua: Peringatan[];
  /** Peringatan terbuka yang boleh dilihat pengguna ini. */
  peringatan: Peringatan[];
  warna: Warna;
}

export function hitungRingkasan(ibu: Ibu, catatan: Catatan[], now: Date): Omit<Ringkasan, "peringatan" | "warna"> {
  const cari = buatPencari(catatan, ibu.id);
  const tahap = hitungTahap(ibu, cari, now);
  const js = jadwal(tahap, cari, now);
  const semua = evaluasi(ibu, cari, tahap, now);
  return { ibu, cari, tahap, jadwal: js, berikut: kunjunganBerikut(js), semua };
}

export function useDaftarRingkasan(): Ringkasan[] {
  const u = usePengguna();
  const ibu = useStore((s) => s.ibu);
  const catatan = useStore((s) => s.catatan);
  const status = useStore((s) => s.status);
  const now = useSekarang();
  return useMemo(() => {
    const urut = { merah: 0, kuning: 1, hijau: 2 } as const;
    return ibu
      .filter((i) => bolehLihatIbu(u, i))
      .map((i) => {
        const r = hitungRingkasan(i, catatan, now);
        const peringatan = saringPeringatan(u, terbuka(r.semua, status));
        return { ...r, peringatan, warna: warnaIbu(peringatan) };
      })
      .sort((a, b) => urut[a.warna] - urut[b.warna] || (a.berikut?.mulai.getTime() ?? Infinity) - (b.berikut?.mulai.getTime() ?? Infinity));
  }, [ibu, catatan, status, u, now]);
}

export function useRingkasan(ibuId: string | undefined): Ringkasan | null {
  const u = usePengguna();
  const ibu = useStore((s) => s.ibu.find((i) => i.id === ibuId));
  const catatan = useStore((s) => s.catatan);
  const status = useStore((s) => s.status);
  const now = useSekarang();
  return useMemo(() => {
    if (!ibu || !bolehLihatIbu(u, ibu)) return null;
    const r = hitungRingkasan(ibu, catatan, now);
    const peringatan = saringPeringatan(u, terbuka(r.semua, status));
    return { ...r, peringatan, warna: warnaIbu(peringatan) };
  }, [ibu, catatan, status, u, now]);
}

export function namaPengguna(id: string | undefined): string {
  if (!id) return "–";
  const p = useStore.getState().pengguna.find((x) => x.id === id);
  return p?.nama ?? id;
}
