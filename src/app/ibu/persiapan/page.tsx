"use client";

import { toast } from "sonner";
import { GambarKia } from "@/components/gambar-kia";
import { Ilustrasi, type NamaIlustrasi } from "@/components/ilustrasi";
import { KepalaHalaman } from "@/components/kepala";
import { Memuat, TautanBuku } from "@/components/ui";
import { kamus } from "@/lib/kamus";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { terakhir } from "@/lib/tahap";
import { cn } from "@/lib/util";

const GAMBAR: Record<string, NamaIlustrasi> = {
  tanya_tanggal_persalinan: "jadwal",
  pendamping_siap: "keluarga",
  tabungan_persalinan: "dompet",
  kartu_jkn: "kartu",
  penolong_dipilih: "rs",
  dokumen_siap: "persiapan",
  donor_darah_siap: "darah",
  kendaraan_siap: "mobil",
  stiker_p4k: "rumah",
  rencana_kb: "kb",
};

/** Ceklis P4K (Buku KIA hlm. 18): tiap butir diketuk untuk menandai sudah siap. */
export default function Persiapan() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const simpan = useStore((s) => s.simpan);
  if (!r) return <Memuat />;
  const rec = terakhir(r.cari, "persiapan");
  const data = rec?.data ?? {};
  const kolom = Object.entries(kamus.tabel.persiapan.kolom);
  const sudah = kolom.filter(([k]) => data[k] === true).length;
  const minggu = r.tahap.ukMinggu ?? 0;

  const toggle = (k: string) => {
    try {
      simpan("persiapan", r.ibu.id, { ...data, [k]: !(data[k] === true) }, rec ? { catatanId: rec.id } : {});
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="px-4">
      <KepalaHalaman judul="Persiapan melahirkan" sub="Ceklis P4K · diisi oleh ibu" kembali="/ibu" />

      <section className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
        <div className="bg-[#eef3fb]">
          <GambarKia nama="p4k" alt="Ibu dan suami berkonsultasi dengan bidan menentukan tanggal persalinan" preload className="mx-auto max-h-44 w-auto" />
        </div>
        <div className="p-4">
          <p className="text-[15px] font-bold">
            {sudah === kolom.length ? "Semua persiapan sudah siap" : `${sudah} dari ${kolom.length} sudah siap`}
          </p>
          <div className="mt-2 flex gap-1" aria-hidden>
            {kolom.map(([k]) => (
              <span key={k} className={cn("h-1.5 flex-1 rounded-full transition-colors", data[k] === true ? "bg-teal" : "bg-black/[0.07]")} />
            ))}
          </div>
          <p className="mt-2.5 text-sm text-muted">
            {minggu >= 36 ? "Sudah minggu ke-36: penolong, donor darah, dan kendaraan sebaiknya sudah siap." : "Mulai sejak trimester 2. Suami dan kader ikut melihat kemajuannya."}
          </p>
        </div>
      </section>

      <h2 className="mb-1 mt-6 text-[17px] font-bold">Daftar persiapan</h2>
      <p className="mb-3 text-sm text-muted">Ketuk butir yang sudah Ibu siapkan.</p>
      <ul className="space-y-2.5">
        {kolom.map(([k, kol]) => {
          const v = data[k] === true;
          const penting = /minggu ke-36/.test(kol.peringatan ?? "") && !v && minggu >= 30;
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => toggle(k)}
                aria-pressed={v}
                className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99]", v ? "border-transparent bg-surface shadow-[var(--shadow-kartu)]" : "border-dashed border-[#c9d3df] bg-transparent")}
              >
                <Ilustrasi nama={GAMBAR[k] ?? "persiapan"} className={cn("size-12 shrink-0 transition", !v && "opacity-70 grayscale-[60%]")} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-snug">{kol.label}</span>
                  {penting && <span className="mt-0.5 block text-xs font-semibold text-kuning">Penting sebelum minggu ke-36</span>}
                </span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", v ? "bg-teal text-white" : "text-muted ring-1 ring-line")}>{v ? "Siap" : "Belum"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <TautanBuku halaman={18} label="Persiapan melahirkan di Buku KIA hlm. 18" />
      </div>
    </div>
  );
}
