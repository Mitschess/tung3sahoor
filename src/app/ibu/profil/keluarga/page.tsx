"use client";

import { BellRing, EyeOff, Info, Phone, Siren, Users } from "lucide-react";
import { KepalaHalaman } from "@/components/kepala";
import { Baris, Kosong, Memuat } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { pesanKunjungan } from "@/lib/pesan";
import { usePengguna } from "@/lib/store";
import { inisial } from "@/lib/util";

/** Suami/keluarga pendamping: siapa dia, cara menghubungi, dan pesan apa saja yang ia terima. */
export default function Keluarga() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  if (!r) return <Memuat />;
  const k = r.ibu.keluarga;
  const nama = k.nama_pendamping ? String(k.nama_pendamping) : "";
  const telepon = k.telepon_pendamping ? String(k.telepon_pendamping) : "";
  const posyandu = String(r.ibu.profil.wilayah_posyandu);

  return (
    <div className="space-y-6 px-4 pb-6">
      <KepalaHalaman judul="Suami / Keluarga" sub="Pendamping Ibu selama hamil dan nifas" kembali="/ibu/profil" />

      {nama ? (
        <section className="rounded-2xl bg-surface p-5 text-center shadow-[var(--shadow-kartu)]">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-rose-soft text-xl font-bold text-rose" aria-hidden>
            {inisial(nama)}
          </span>
          <p className="mt-3 text-lg font-bold leading-tight">{nama}</p>
          <p className="text-sm text-muted">{String(k.hubungan ?? "Pendamping")} · pendamping Ibu</p>
          {telepon && (
            <a href={`tel:${telepon}`} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white transition active:scale-[0.98]">
              <Phone className="size-4" /> Telepon {nama.split(" ")[0]}
            </a>
          )}
          <div className="mt-5 border-t border-line pt-1 text-left">
            <Baris label="Nomor HP">{telepon || "–"}</Baris>
            <Baris label="Golongan darah">{String(k.golongan_darah_pendamping ?? "–")}</Baris>
          </div>
        </section>
      ) : (
        <Kosong ikon={<Users className="size-8" />} judul="Belum ada pendamping" teks={`Sampaikan nama dan nomor HP suami atau keluarga ke kader Posyandu ${posyandu}.`} />
      )}

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-muted">Pesan yang diterima keluarga</h2>
        <div className="space-y-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
          <Butir ikon={BellRing} judul="Pengingat jadwal periksa" teks="Dikirim kader 2 hari sebelum, pada hari periksa, dan 2 hari sesudahnya bila Ibu belum datang." />
          <Butir ikon={Siren} judul="Kabar bila Ibu perlu segera ke bidan" teks="Hanya ajakan untuk mendampingi Ibu ke Puskesmas, tanpa menyebut hasilnya." />
          <Butir ikon={EyeOff} judul="Tidak berisi hasil pemeriksaan" teks="Angka periksa, tes darah, dan skrining kesehatan jiwa tidak pernah dikirim ke keluarga." />
        </div>
      </section>

      {nama && (
        <section>
          <h2 className="mb-2.5 text-sm font-semibold text-muted">Contoh pesan pengingat</h2>
          <div className="rounded-2xl bg-brand-soft/60 p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-surface p-3.5 text-sm leading-relaxed shadow-sm">
              {pesanKunjungan(r, "pendamping")}
              <span className="mt-1.5 block text-right text-[11px] text-muted">dari kader posyandu</span>
            </div>
          </div>
        </section>
      )}

      <p className="flex items-start gap-2 rounded-2xl bg-black/[0.03] p-4 text-xs text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        Mau mengganti pendamping atau nomor HP? Sampaikan ke kader Posyandu {posyandu} atau bidan saat periksa.
      </p>
    </div>
  );
}

function Butir({ ikon: Ikon, judul, teks }: { ikon: typeof Phone; judul: string; teks: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
        <Ikon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{judul}</p>
        <p className="text-sm text-muted">{teks}</p>
      </div>
    </div>
  );
}
