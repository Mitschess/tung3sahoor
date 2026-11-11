"use client";

import { toast } from "sonner";
import { KamusForm } from "@/components/kamus-form";
import { GambarKia } from "@/components/gambar-kia";
import { KepalaHalaman } from "@/components/kepala";
import { Kartu, Memuat, TautanBuku } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { terakhir } from "@/lib/tahap";

export default function KB() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const simpan = useStore((s) => s.simpan);
  if (!r) return <Memuat />;
  const rec = terakhir(r.cari, "kb");
  return (
    <div className="space-y-4 px-4">
      <KepalaHalaman judul="Keluarga berencana" sub="Diisi oleh ibu" kembali="/ibu" />
      <section className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
        <div className="bg-[#efebf8]">
          <GambarKia nama="kb" alt="Ibu dan suami membicarakan pilihan alat kontrasepsi" preload className="mx-auto max-h-44 w-auto" />
        </div>
        <div className="space-y-2 p-4 text-sm">
          <p className="text-[15px] font-bold">Mulai KB paling lambat hari ke-42</p>
          <p className="text-muted">Pilih metode yang tidak mengganggu ASI dan bicarakan bersama suami dan bidan. Jarak kehamilan yang sehat paling sedikit 2 tahun.</p>
          <TautanBuku halaman={33} label="KB di Buku KIA hlm. 33" />
        </div>
      </section>
      <Kartu>
        <KamusForm
          tabel="kb"
          nilaiAwal={rec?.data}
          labelSimpan="Simpan pilihan KB"
          onSimpan={(d) => {
            try {
              simpan("kb", r.ibu.id, d, rec ? { catatanId: rec.id } : {});
              toast.success("Pilihan KB tersimpan");
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      </Kartu>
    </div>
  );
}
