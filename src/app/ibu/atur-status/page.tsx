"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KepalaHalaman } from "@/components/kepala";
import { Memuat, Sakelar, Tombol } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { KARTU_STATUS } from "@/lib/status-ibu";
import { usePengguna, useStore } from "@/lib/store";

export default function AturStatus() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const awal = useStore((s) => s.statusTersembunyi);
  const atur = useStore((s) => s.aturStatus);
  const router = useRouter();
  const [mati, setMati] = useState<string[]>(awal);
  if (!r) return <Memuat />;

  const kartu = KARTU_STATUS.filter((k) => k.untuk.includes(r.tahap.set));
  const aktif = kartu.filter((k) => !mati.includes(k.id));
  const nonaktif = kartu.filter((k) => mati.includes(k.id));
  const berubah = [...mati].sort().join() !== [...awal].sort().join();
  const ubah = (id: string, nyala: boolean) => setMati((m) => (nyala ? m.filter((x) => x !== id) : [...m, id]));

  const daftar = (judul: string, isi: typeof kartu) => (
    <section>
      <div className="mb-1 flex items-center gap-3">
        <h2 className="text-2xl font-bold">{judul}</h2>
        <span className="grid size-8 place-items-center rounded-full bg-black/5 text-sm font-semibold text-muted">{isi.length}</span>
      </div>
      {judul === "Aktif" && <p className="mb-4 text-[15px] text-muted">Atur status kesehatan yang muncul di beranda Ibu</p>}
      <div className="mt-3 space-y-3">
        {isi.map((k) => (
          <div key={k.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
            <span className="text-[17px]">{k.judul}</span>
            <Sakelar nyala={!mati.includes(k.id)} ubah={(v) => ubah(k.id, v)} label={k.judul} />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col px-4">
      <KepalaHalaman judul="Atur Status Kesehatan" kembali="/ibu" />
      <div className="flex-1 space-y-8">
        {daftar("Aktif", aktif)}
        <div className="border-t border-line" />
        {daftar("Nonaktif", nonaktif)}
      </div>
      <Tombol
        className="mb-4 mt-8 w-full"
        disabled={!berubah}
        onClick={() => {
          atur(mati);
          toast.success("Tampilan beranda diperbarui");
          router.push("/ibu");
        }}
      >
        Simpan
      </Tombol>
    </div>
  );
}
