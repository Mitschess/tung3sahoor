"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { BarisIbu } from "@/components/baris-ibu";
import { Kosong, Masukan, Tab } from "@/components/ui";
import { useDaftarRingkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";

type Filter = "semua" | "merah" | "kuning" | "hijau" | "hamil" | "nifas";

export default function DaftarIbu() {
  const u = usePengguna()!;
  const rs = useDaftarRingkasan();
  const [cari, setCari] = useState("");
  const [f, setF] = useState<Filter>("semua");
  const hasil = rs.filter((r) => {
    if (cari && !String(r.ibu.profil.nama).toLowerCase().includes(cari.toLowerCase())) return false;
    if (f === "merah" || f === "kuning" || f === "hijau") return r.warna === f;
    if (f === "hamil" || f === "nifas") return r.tahap.set === f;
    return true;
  });
  const n = (w: string) => rs.filter((r) => r.warna === w).length;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Daftar ibu</h1>
        <p className="text-sm text-muted">
          {u.peran === "kader" ? `Hanya ibu di wilayah Posyandu ${u.posyandu?.join(", ")}.` : u.peran === "bidan" ? `Wilayah kerja: ${u.posyandu?.join(", ")}.` : "Seluruh wilayah puskesmas."} Urut: Merah → Kuning → jadwal terdekat.
        </p>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Masukan placeholder="Cari nama ibu" value={cari} onChange={(e) => setCari(e.target.value)} className="pl-10" />
      </div>
      <Tab
        nilai={f}
        setNilai={setF}
        pilihan={[
          { nilai: "semua", label: `Semua ${rs.length}` },
          { nilai: "merah", label: `Merah ${n("merah")}` },
          { nilai: "kuning", label: `Kuning ${n("kuning")}` },
          { nilai: "hijau", label: `Hijau ${n("hijau")}` },
          { nilai: "hamil", label: "Hamil" },
          { nilai: "nifas", label: "Nifas" },
        ]}
      />
      <div className="space-y-2">{hasil.length ? hasil.map((r) => <BarisIbu key={r.ibu.id} r={r} />) : <Kosong judul="Tidak ditemukan" />}</div>
    </div>
  );
}
