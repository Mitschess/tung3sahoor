"use client";

import { Lock } from "lucide-react";
import { GrafikBB, GrafikTfuDjj } from "@/components/grafik";
import { KepalaHalaman } from "@/components/kepala";
import { RiwayatTabel } from "@/components/riwayat";
import { DaftarJadwal } from "@/components/tahap";
import { JudulBagian, Kartu, Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";

const TABEL_HAMIL = ["anc", "dokter_t1", "lab_t1", "preeklamsia", "dm", "dokter_t3", "rujukan"];
const TABEL_NIFAS = ["persalinan", "bayi_lahir", "kf", "kn", "imunisasi"];

export default function Hasil() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;
  const nifas = r.tahap.set === "nifas";
  return (
    <div className="space-y-6 px-4">
      <KepalaHalaman judul="Hasil periksa" sub="Diisi tenaga kesehatan · Ibu hanya bisa melihat" kembali="/ibu" />

      {r.jadwal.length > 0 && (
        <section>
          <JudulBagian>Jadwal kunjungan</JudulBagian>
          <DaftarJadwal js={r.jadwal} />
        </section>
      )}

      {r.tahap.set === "hamil" && (
        <>
          <Kartu id="grafik" className="scroll-mt-20">
            <JudulBagian>Kenaikan berat badan</JudulBagian>
            <GrafikBB r={r} />
          </Kartu>
          <Kartu>
            <JudulBagian>Tinggi rahim & denyut jantung bayi</JudulBagian>
            <GrafikTfuDjj r={r} />
          </Kartu>
        </>
      )}

      <section className="space-y-5">
        {(nifas ? [...TABEL_NIFAS, ...TABEL_HAMIL] : TABEL_HAMIL).map((t) => (
          <RiwayatTabel key={t} tabel={t} catatan={r.cari(t)} />
        ))}
      </section>

      <p className="flex items-start gap-2 rounded-2xl bg-black/[0.03] p-4 text-xs text-muted">
        <Lock className="mt-0.5 size-4 shrink-0" />
        Hasil tripel eliminasi dan skrining kesehatan jiwa tidak ditampilkan di aplikasi untuk menjaga privasi Ibu. Bidan akan menjelaskannya langsung.
      </p>
    </div>
  );
}
