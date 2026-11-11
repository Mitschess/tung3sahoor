"use client";

import { KepalaHalaman } from "@/components/kepala";
import { RiwayatTabel } from "@/components/riwayat";
import { Kosong, Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";

/** Catatan: semua riwayat dan seluruh tahap Buku KIA, termasuk yang bukan tahap aktif. */
export default function Catatan() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;
  const tabel = Object.keys(kamus.tabel).filter((t) => !["ibu", "keluarga", "meta", "grafik_bb", "tindak_lanjut"].includes(t) && r.cari(t).length);
  return (
    <div className="space-y-5 px-4">
      <KepalaHalaman judul="Catatan" sub="Semua riwayat dari seluruh tahap Buku KIA" kembali="/ibu" />
      {tabel.length === 0 ? <Kosong judul="Belum ada catatan" /> : tabel.map((t) => <RiwayatTabel key={t} tabel={t} catatan={r.cari(t)} />)}
    </div>
  );
}
