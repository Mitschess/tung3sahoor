"use client";

import { Phone, Siren } from "lucide-react";
import { KepalaHalaman } from "@/components/kepala";
import { ItemPeringatan } from "@/components/peringatan";
import { JudulBagian, Kartu, Memuat, TautanBuku } from "@/components/ui";
import { TANDA_BAHAYA, tandaBahayaUntuk } from "@/data/edukasi";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";

export default function TandaBahaya() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;
  const daftar = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? TANDA_BAHAYA : tandaBahayaUntuk(r.tahap.kode);
  return (
    <div className="space-y-5 px-4">
      <KepalaHalaman judul="Tanda bahaya" sub="Jika mengalami, segera ke Puskesmas/Rumah Sakit" kembali="/ibu" />

      <div className="rounded-3xl bg-merah p-5 text-white">
        <p className="flex items-center gap-2 text-lg font-extrabold">
          <Siren className="size-6" /> Ada tanda bahaya?
        </p>
        <p className="mt-1 text-sm text-white/90">Jangan menunggu jadwal periksa. Segera ke fasilitas kesehatan terdekat. MOMCARE bukan layanan gawat darurat.</p>
        <a href="tel:119" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 font-bold text-merah">
          <Phone className="size-4" /> Telepon 119
        </a>
      </div>

      {r.peringatan.length > 0 && (
        <section>
          <JudulBagian>Catatan Ibu yang perlu diperiksa</JudulBagian>
          <div className="space-y-2">
            {r.peringatan.map((p) => (
              <ItemPeringatan key={p.id} p={p} r={r} ringkas />
            ))}
          </div>
        </section>
      )}

      {daftar.map((t) => (
        <Kartu key={t.judul}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold">{t.judul}</h2>
            <TautanBuku halaman={t.halaman} label={`hlm. ${t.halaman}`} />
          </div>
          <ul className="grid gap-2">
            {t.butir.map((b) => (
              <li key={b} className="flex gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-merah" />
                {b}
              </li>
            ))}
          </ul>
        </Kartu>
      ))}
    </div>
  );
}
