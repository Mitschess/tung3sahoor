"use client";

import { Search, UserPlus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BarisIbu, KOLOM_BARIS, KotakDaftar } from "@/components/baris-ibu";
import { Kosong, Masukan, Pilihan, TautanTombol, Tombol } from "@/components/ui";
import { bolehIsi } from "@/lib/akses";
import { useDaftarRingkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";
import { cn } from "@/lib/util";

type Status = "semua" | "merah" | "kuning" | "hijau";
const STATUS: { nilai: Status; label: string; titik?: string }[] = [
  { nilai: "semua", label: "Semua" },
  { nilai: "merah", label: "Merah", titik: "bg-merah" },
  { nilai: "kuning", label: "Kuning", titik: "bg-kuning" },
  { nilai: "hijau", label: "Hijau", titik: "bg-hijau" },
];

/** Daftar ibu di wilayah petugas. Status, tahap, dan posyandu disaring terpisah supaya bisa digabung (mis. Merah + Nifas). */
export default function DaftarIbu() {
  const u = usePengguna()!;
  const rs = useDaftarRingkasan();
  const sp = useSearchParams();
  const awal = sp.get("status");
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState<Status>(awal === "merah" || awal === "kuning" || awal === "hijau" ? awal : "semua");
  const [tahap, setTahap] = useState<SetMenu | "semua">("semua");
  const [posyandu, setPosyandu] = useState("semua");

  const daftarPosyandu = [...new Set(rs.map((r) => String(r.ibu.profil.wilayah_posyandu)))].sort();
  const kata = cari.trim().toLowerCase();
  // Angka di tiap status mengikuti saringan lain, jadi selalu sama dengan yang akan tampil.
  const selainStatus = rs.filter((r) => {
    if (kata && !String(r.ibu.profil.nama).toLowerCase().includes(kata)) return false;
    if (tahap !== "semua" && r.tahap.set !== tahap) return false;
    if (posyandu !== "semua" && String(r.ibu.profil.wilayah_posyandu) !== posyandu) return false;
    return true;
  });
  const hasil = status === "semua" ? selainStatus : selainStatus.filter((r) => r.warna === status);
  const jumlah = (s: Status) => (s === "semua" ? selainStatus.length : selainStatus.filter((r) => r.warna === s).length);
  const disaring = !!kata || status !== "semua" || tahap !== "semua" || posyandu !== "semua";
  const reset = () => {
    setCari("");
    setStatus("semua");
    setTahap("semua");
    setPosyandu("semua");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Daftar ibu</h1>
          <p className="text-sm text-muted">{u.peran === "kader" ? `Ibu di wilayah Posyandu ${u.posyandu?.join(", ")}` : u.peran === "bidan" ? `Wilayah kerja Posyandu ${u.posyandu?.join(" & ")}` : "Seluruh wilayah puskesmas"}</p>
        </div>
        {bolehIsi(u, "ibu") && (
          <TautanTombol href="/app/daftar" kecil>
            <UserPlus className="size-4" /> Daftarkan ibu
          </TautanTombol>
        )}
      </div>

      <div className="space-y-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-kartu)] sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Masukan type="search" aria-label="Cari nama ibu" placeholder="Cari nama ibu" value={cari} onChange={(e) => setCari(e.target.value)} className="h-11 px-10 [&::-webkit-search-cancel-button]:hidden" />
          {cari && (
            <button type="button" onClick={() => setCari("")} className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-black/5" aria-label="Hapus pencarian">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Saring menurut status" className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1">
            {STATUS.map((s) => (
              <button
                key={s.nilai}
                type="button"
                aria-pressed={status === s.nilai}
                onClick={() => setStatus(s.nilai)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition",
                  status === s.nilai ? "border-brand bg-brand-soft text-brand-ink" : "border-line bg-surface text-ink/80 hover:bg-bg",
                )}
              >
                {s.titik && <span className={cn("size-2 rounded-full", s.titik)} aria-hidden />}
                {s.label}
                <span className={cn("text-xs font-bold tabular-nums", status === s.nilai ? "text-brand-ink/70" : "text-muted")}>{jumlah(s.nilai)}</span>
              </button>
            ))}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Pilihan aria-label="Saring menurut tahap" value={tahap} onChange={(e) => setTahap(e.target.value as SetMenu | "semua")} className="h-9 flex-1 rounded-full px-3.5 text-sm font-semibold sm:w-36 sm:flex-none">
              <option value="semua">Semua tahap</option>
              <option value="hamil">Hamil</option>
              <option value="nifas">Nifas</option>
            </Pilihan>
            {daftarPosyandu.length > 1 && (
              <Pilihan aria-label="Saring menurut posyandu" value={posyandu} onChange={(e) => setPosyandu(e.target.value)} className="h-9 flex-1 rounded-full px-3.5 text-sm font-semibold sm:w-44 sm:flex-none">
                <option value="semua">Semua posyandu</option>
                {daftarPosyandu.map((p) => (
                  <option key={p} value={p}>
                    Posyandu {p}
                  </option>
                ))}
              </Pilihan>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1 text-sm text-muted">
        <p aria-live="polite">
          {hasil.length} dari {rs.length} ibu · urut dari yang paling mendesak
        </p>
        {disaring && (
          <button type="button" onClick={reset} className="shrink-0 font-semibold text-brand">
            Hapus saringan
          </button>
        )}
      </div>

      {hasil.length ? (
        <KotakDaftar>
          <div className={cn("hidden gap-x-4 bg-bg/60 px-4 py-2 text-xs font-semibold text-muted md:grid", KOLOM_BARIS)} aria-hidden>
            <span>Ibu</span>
            <span>Yang perlu diperhatikan</span>
            <span className="pr-6 text-right">Status</span>
          </div>
          {hasil.map((r) => (
            <BarisIbu key={r.ibu.id} r={r} />
          ))}
        </KotakDaftar>
      ) : (
        <Kosong
          ikon={<Search className="size-8" />}
          judul={rs.length ? "Tidak ada ibu yang cocok" : "Belum ada ibu terdaftar"}
          teks={rs.length ? "Coba ubah kata pencarian atau saringannya." : "Daftarkan ibu dari halaman identitas Buku KIA."}
          aksi={
            rs.length ? (
              <Tombol kecil varian="kedua" onClick={reset}>
                Hapus saringan
              </Tombol>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
