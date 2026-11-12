"use client";

import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { GambarKia } from "@/components/gambar-kia";
import { LogoMark } from "@/components/logo";
import { TombolSos } from "@/components/sos";
import { Memuat, Modal, Tombol } from "@/components/ui";
import { LABEL_PERAN } from "@/lib/akses";
import { useSiap } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import type { Pengguna } from "@/lib/types";
import { cn } from "@/lib/util";
import type { NamaGambar } from "@/data/gambar-kia";

type Kelompok = "ibu" | "petugas";

/** Potret akun demo: potongan ilustrasi Buku KIA (bukan foto orang sungguhan). */
function potret(u: Pengguna): NamaGambar {
  if (u.peran === "ibu") return u.keterangan?.includes("Nifas") ? "avatar-ibu-nifas" : "avatar-ibu-hamil";
  return u.peran === "kader" ? "avatar-kader" : u.peran === "bidan" ? "avatar-bidan" : "avatar-dokter";
}

export default function Masuk() {
  // Suspense diperlukan karena layar ini membaca URL (?pilih membuka pemilih akun langsung dari landing).
  return (
    <Suspense fallback={<Memuat penuh />}>
      <MasukIsi />
    </Suspense>
  );
}

function MasukIsi() {
  const siap = useSiap();
  const pengguna = useStore((s) => s.pengguna);
  const masuk = useStore((s) => s.masuk);
  const reset = useStore((s) => s.resetDemo);
  const setuju = useStore((s) => s.setujuPrivasi);
  const setujui = useStore((s) => s.setujuiPrivasi);
  const router = useRouter();
  const langsung = useSearchParams().has("pilih");
  const [langkah, setLangkah] = useState<"sambutan" | "pilih">(langsung ? "pilih" : "sambutan");
  const [kelompok, setKelompok] = useState<Kelompok>("ibu");

  if (!siap) return <Memuat penuh />;

  const pilih = (u: Pengguna, tujuan?: string) => {
    masuk(u.id);
    router.push(tujuan ?? (u.peran === "ibu" ? "/ibu" : "/app"));
  };

  if (langkah === "pilih") {
    const akun = pengguna.filter((u) => (kelompok === "ibu" ? u.peran === "ibu" : u.peran !== "ibu"));
    return (
      <main className="latar-ibu mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-6">
        <button onClick={() => setLangkah("sambutan")} className="-ml-2 mt-3 grid size-11 place-items-center rounded-full hover:bg-black/5" aria-label="Kembali">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="mt-6 text-[28px] font-bold leading-tight">Masuk sebagai siapa?</h1>
        <div role="tablist" className="mt-6 grid grid-cols-2 border-b border-line">
          {(["ibu", "petugas"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kelompok === k}
              onClick={() => setKelompok(k)}
              className={cn("-mb-px border-b-[3px] py-3 text-[17px] transition", kelompok === k ? "border-brand font-semibold text-brand" : "border-transparent text-muted")}
            >
              {k === "ibu" ? "Ibu" : "Kader / Nakes"}
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">{kelompok === "ibu" ? "Tampilan paling sederhana: tahap kehamilan, tugas hari ini, dan tanda bahaya." : "Daftar tugas: ibu Merah, Kuning, dan jadwal kunjungan di wilayah Anda."}</p>
        <div className="mt-4 space-y-3">
          {akun.map((u) => {
            return (
              <button key={u.id} onClick={() => pilih(u)} className="flex w-full items-center gap-4 rounded-2xl bg-surface p-4 text-left shadow-[var(--shadow-kartu)] transition active:scale-[0.99]">
                <GambarKia nama={potret(u)} alt="" sizes="56px" className="size-14 shrink-0 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted">{LABEL_PERAN[u.peran]}</span>
                  <span className="block truncate text-[17px] font-semibold">{u.nama}</span>
                  <span className="block truncate text-sm text-muted">{u.keterangan}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-brand" />
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-10 text-center text-sm text-muted">
          <p>Akun demo tanpa kata sandi. Semua data fiktif dan hanya tersimpan di browser ini.</p>
          <button
            className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand"
            onClick={() => {
              reset();
              toast.success("Data demo dikembalikan ke awal");
            }}
          >
            <RotateCcw className="size-4" /> Kembalikan data demo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-6 pb-8">
      <div className="mt-4">
        <TombolSos tandaBahaya={false} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <Ilustrasi />
        <p className="mt-10 text-3xl font-extrabold tracking-tight text-brand">MOMCARE</p>
        <p className="mt-2 max-w-xs text-center text-[15px] text-muted">Teman Buku KIA untuk Ibu, kader, bidan, dan dokter.</p>
      </div>

      <Tombol className="w-full" onClick={() => setLangkah("pilih")}>
        Masuk
      </Tombol>
      <p className="mt-4 text-center text-sm text-muted">Belum terdaftar? Bawa Buku KIA ke kader posyandu, pendaftaran dilakukan bersama Ibu.</p>

      <Modal buka={!setuju} setBuka={() => undefined} tanpaTutup judul="Syarat penggunaan & privasi">
        <div className="space-y-3 text-[15px] leading-relaxed text-ink/85">
          <p>Sebelum memakai MOMCARE, mohon baca ringkasan berikut:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>Data diambil dari Buku KIA dan hanya dilihat kader di posyandu Ibu, bidan wilayah, dan dokter puskesmas.</li>
            <li>Hasil tes HIV/sifilis/hepatitis B dan kesehatan jiwa hanya untuk bidan/dokter.</li>
            <li>NIK disimpan tersandi. Foto Buku KIA dihapus setelah dicek petugas.</li>
            <li>MOMCARE bukan layanan gawat darurat dan tidak menggantikan pemeriksaan tenaga kesehatan.</li>
            <li>Versi demo ini memakai data fiktif yang tersimpan di browser Anda saja.</li>
          </ul>
          <Tombol className="w-full" onClick={setujui}>
            Saya setuju
          </Tombol>
        </div>
      </Modal>
    </main>
  );
}

/** Sambutan: ilustrasi keluarga dari Buku KIA dalam bingkai lembut, dengan logo MOMCARE. */
function Ilustrasi() {
  return (
    <div className="relative w-full max-w-[300px]">
      <div className="overflow-hidden rounded-[46%_54%_44%_56%/56%_44%_56%_44%] bg-[#f4f2e7]">
        <GambarKia nama="menyusui" alt="Ayah, ibu, dan bayi yang sedang menyusu" preload sizes="300px" className="scale-110" />
      </div>
      <LogoMark className="absolute -bottom-5 left-1/2 size-16 -translate-x-1/2 ring-4 ring-surface" />
    </div>
  );
}
