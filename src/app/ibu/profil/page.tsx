"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { KepalaHalaman } from "@/components/kepala";
import { Baris, JudulBagian, Kartu, Memuat, Tombol } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { tampil } from "@/lib/tanggal";
import { usePengguna, useStore } from "@/lib/store";

export default function Profil() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const keluar = useStore((s) => s.keluar);
  const router = useRouter();
  if (!r) return <Memuat />;
  const p = r.ibu.profil;
  const k = r.ibu.keluarga;
  return (
    <div className="space-y-5 px-4">
      <KepalaHalaman judul="Profil" kembali="/ibu" />
      <Kartu>
        <JudulBagian>Identitas ibu</JudulBagian>
        <Baris label="Nama">{String(p.nama)}</Baris>
        <Baris label="NIK">{r.ibu.nikSamaran}</Baris>
        <Baris label="Tanggal lahir">{tampil(p.tanggal_lahir)}</Baris>
        <Baris label="Alamat">{`${p.alamat ?? "–"} RT/RW ${p.rt_rw ?? "–"}`}</Baris>
        <Baris label="Posyandu">{String(p.wilayah_posyandu)}</Baris>
        <Baris label="Faskes TK1">{String(p.faskes_tk1 ?? "–")}</Baris>
        <Baris label="Golongan darah">{`${p.golongan_darah ?? "–"} ${p.rhesus ?? ""}`}</Baris>
        <Baris label="Telepon">{String(p.telepon ?? "–")}</Baris>
      </Kartu>
      <Kartu>
        <JudulBagian>Suami / keluarga</JudulBagian>
        <Baris label="Nama">{String(k.nama_pendamping ?? "–")}</Baris>
        <Baris label="Hubungan">{String(k.hubungan ?? "–")}</Baris>
        <Baris label="Telepon (penerima pengingat)">{String(k.telepon_pendamping ?? "–")}</Baris>
      </Kartu>
      <Kartu className="bg-hijau-soft/50">
        <p className="flex items-center gap-2 font-bold text-hijau">
          <ShieldCheck className="size-5" /> Persetujuan data
        </p>
        <p className="mt-2 text-sm text-ink/80">
          Ibu menyetujui pendaftaran pada {tampil(r.ibu.persetujuan.tanggal)} (teks {r.ibu.persetujuan.versi}). Data dilihat oleh kader posyandu {String(p.wilayah_posyandu)}, bidan wilayah, dan dokter puskesmas. Hasil tripel
          eliminasi dan kesehatan jiwa hanya terlihat oleh nakes dan tidak dikirim ke keluarga. Foto Buku KIA dihapus setelah datanya dikonfirmasi.
        </p>
      </Kartu>
      <Tombol
        varian="garis"
        className="w-full"
        onClick={() => {
          keluar();
          router.push("/masuk");
        }}
      >
        <LogOut className="size-4" /> Keluar
      </Tombol>
    </div>
  );
}
