"use client";

import { toast } from "sonner";
import { KamusForm } from "@/components/kamus-form";
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
      <Kartu className="text-sm text-muted">
        KB pasca melahirkan dapat dimulai sampai 42 hari setelah melahirkan. Pilih metode yang tidak mengganggu ASI; diskusikan dengan bidan. <TautanBuku halaman={33} />
      </Kartu>
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
