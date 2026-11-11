"use client";

import { Check, CircleAlert, PartyPopper } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { KepalaHalaman } from "@/components/kepala";
import { Kartu, Lencana, Memuat, Tab, TautanBuku, Tombol } from "@/components/ui";
import { cetakKePdf, kamus, levelDariPeringatanYa } from "@/lib/kamus";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import type { Catatan, Data } from "@/lib/types";
import { cn } from "@/lib/util";

type Lembar = "hamil" | "nifas" | "bayi";
const KONFIG: Record<Lembar, { tabel: string; kunci: "minggu_kehamilan" | "hari_ke"; satuan: string; layanan: string[]; hlm: number; maks: number }> = {
  hamil: { tabel: "pemantauan_hamil", kunci: "minggu_kehamilan", satuan: "Minggu", layanan: ["periksa_kehamilan", "kelas_ibu_hamil"], hlm: 10, maks: 42 },
  nifas: { tabel: "pemantauan_nifas", kunci: "hari_ke", satuan: "Hari", layanan: ["periksa_nifas", "vit_a", "ttd", "gizi_cukup"], hlm: 28, maks: 42 },
  bayi: { tabel: "pemantauan_bayi", kunci: "hari_ke", satuan: "Hari", layanan: [], hlm: 42, maks: 28 },
};

export default function HalamanPantau() {
  return (
    <Suspense fallback={<Memuat />}>
      <Pantau />
    </Suspense>
  );
}

function Pantau() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const sp = useSearchParams();
  const awal = (sp.get("lembar") as Lembar) ?? undefined;
  const [lembar, setLembar] = useState<Lembar>(awal ?? "hamil");
  if (!r) return <Memuat />;
  const set = r.tahap.set;
  const aktif: Lembar = set === "hamil" ? "hamil" : lembar === "hamil" ? "nifas" : lembar;
  const sekarang = set === "hamil" ? (r.tahap.ukMinggu ?? 1) : aktif === "bayi" ? Math.max(1, r.tahap.umurBayiHari ?? 1) : (r.tahap.hariNifas ?? 1);

  return (
    <div className="px-4">
      <KepalaHalaman judul="Pantau" sub="Diisi oleh ibu · sesuai lembar pemantauan Buku KIA" kembali="/ibu" />
      {set === "nifas" && (
        <Tab
          className="mb-4"
          nilai={aktif}
          setNilai={(v) => setLembar(v)}
          pilihan={[
            { nilai: "nifas", label: "Ibu nifas" },
            { nilai: "bayi", label: "Bayi 0–28 hari" },
          ]}
        />
      )}
      {set === "belum" || set === "tumbuh" ? (
        <p className="text-muted">Lembar pemantauan tersedia saat hamil dan nifas.</p>
      ) : (
        <FormLembar key={`${aktif}-${sekarang}`} lembar={aktif} ibuId={r.ibu.id} sekarang={Math.min(sekarang, KONFIG[aktif].maks)} catatan={r.cari(KONFIG[aktif].tabel)} />
      )}
    </div>
  );
}

function FormLembar({ lembar, ibuId, sekarang, catatan }: { lembar: Lembar; ibuId: string; sekarang: number; catatan: Catatan[] }) {
  const k = KONFIG[lembar];
  const def = kamus.tabel[k.tabel];
  const simpan = useStore((s) => s.simpan);
  const [periode, setPeriode] = useState(sekarang);
  const ada = catatan.find((c) => Number(c.data[k.kunci]) === periode);
  const [nilai, setNilai] = useState<Data>(ada?.data ?? {});
  const [hasil, setHasil] = useState<null | { merah: string[]; kuning: string[] }>(null);

  const gejala = useMemo(() => Object.entries(def.kolom).filter(([kk, kol]) => kol.tipe === "boolean" && !k.layanan.includes(kk)), [def, k.layanan]);
  const layanan = k.layanan.map((kk) => [kk, def.kolom[kk]] as const);

  const pilihPeriode = (p: number) => {
    setPeriode(p);
    setNilai(catatan.find((c) => Number(c.data[k.kunci]) === p)?.data ?? {});
    setHasil(null);
  };

  const kirim = () => {
    try {
      const data: Data = { ...nilai, [k.kunci]: periode };
      const lama = catatan.find((c) => Number(c.data[k.kunci]) === periode);
      simpan(k.tabel, ibuId, data, lama ? { catatanId: lama.id } : {});
      const merah: string[] = [];
      const kuning: string[] = [];
      for (const [kk, kol] of gejala) {
        if (data[kk] !== true) continue;
        let lv = levelDariPeringatanYa(kol);
        if (kk === "gerak_bayi_kurang" && periode < 24) lv = "kuning";
        (lv === "merah" ? merah : kuning).push(kol.label);
      }
      setHasil({ merah, kuning });
      toast.success("Pemantauan tersimpan");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const daftarPeriode = Array.from({ length: Math.min(sekarang, k.maks) }, (_, i) => i + 1).slice(-8);

  return (
    <div className="space-y-5">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {daftarPeriode.map((p) => {
          const terisi = catatan.some((c) => Number(c.data[k.kunci]) === p);
          return (
            <button
              key={p}
              onClick={() => pilihPeriode(p)}
              className={cn(
                "flex min-w-14 shrink-0 flex-col items-center rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                p === periode ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted",
              )}
            >
              <span className="text-[10px] uppercase opacity-80">{k.satuan}</span>
              <span className="text-lg font-extrabold leading-none">{p}</span>
              <span className={cn("mt-1 size-1.5 rounded-full", terisi ? (p === periode ? "bg-white" : "bg-hijau") : "bg-transparent")} />
            </button>
          );
        })}
      </div>

      {layanan.length > 0 && (
        <Kartu className="space-y-2 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Pelayanan kesehatan (centang bila sudah)</p>
          {layanan.map(([kk, kol]) => (
            <Centang key={kk} label={kol.label} nilai={nilai[kk] === true} ubah={(v) => setNilai((s) => ({ ...s, [kk]: v }))} />
          ))}
        </Kartu>
      )}

      <Kartu className="space-y-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">
          {lembar === "bayi" ? "Cek kondisi bayi hari ini" : lembar === "nifas" ? "Cek kondisi Ibu hari ini" : "Cek kondisi Ibu minggu ini"}
        </p>
        <p className="text-xs text-muted">Centang jika mengalami. Bila ada yang dicentang, segera periksa ke Puskesmas.</p>
        {gejala.map(([kk, kol]) => {
          const lv = levelDariPeringatanYa(kol);
          return <Centang key={kk} label={kol.label} nilai={nilai[kk] === true} ubah={(v) => setNilai((s) => ({ ...s, [kk]: v }))} level={kk === "gerak_bayi_kurang" && periode < 24 ? "kuning" : lv} gejala />;
        })}
      </Kartu>

      {hasil && (
        <div className={cn("rounded-2xl p-4", hasil.merah.length ? "bg-merah-soft" : hasil.kuning.length ? "bg-kuning-soft" : "bg-hijau-soft")}>
          {hasil.merah.length || hasil.kuning.length ? (
            <>
              <p className={cn("flex items-center gap-2 font-bold", hasil.merah.length ? "text-merah" : "text-kuning")}>
                <CircleAlert className="size-5" /> {hasil.merah.length ? "Segera ke Puskesmas hari ini" : "Periksakan pada kunjungan terdekat"}
              </p>
              <p className="mt-1 text-sm">Kader dan bidan Ibu sudah diberi tahu lewat MOMCARE. {hasil.merah.length ? "Bila perdarahan, kejang, atau sesak, langsung ke fasilitas kesehatan terdekat." : ""}</p>
            </>
          ) : (
            <p className="flex items-center gap-2 font-bold text-hijau">
              <PartyPopper className="size-5" /> Terima kasih, Bu! Tidak ada keluhan yang dicentang.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <TautanBuku halaman={k.hlm} label={`Lembar di Buku KIA hlm. ${k.hlm}–${k.hlm + 3}`} />
        <span className="text-[11px] text-muted">PDF hlm. {cetakKePdf(k.hlm)}</span>
      </div>
      <Tombol className="w-full" onClick={kirim}>
        Simpan {k.satuan.toLowerCase()} ke-{periode}
      </Tombol>

      <Riwayat lembar={lembar} catatan={catatan} gejala={gejala.map(([kk, kol]) => [kk, kol.label])} />
    </div>
  );
}

function Centang({ label, nilai, ubah, level, gejala }: { label: string; nilai: boolean; ubah: (v: boolean) => void; level?: "merah" | "kuning" | null; gejala?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => ubah(!nilai)}
      aria-pressed={nilai}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
        nilai ? (gejala ? (level === "merah" ? "border-merah/40 bg-merah-soft" : "border-kuning/40 bg-kuning-soft") : "border-hijau/40 bg-hijau-soft") : "border-line bg-surface hover:bg-bg",
      )}
    >
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-lg border-2 transition",
          nilai ? (gejala ? (level === "merah" ? "border-merah bg-merah text-white" : "border-kuning bg-kuning text-white") : "border-hijau bg-hijau text-white") : "border-line",
        )}
      >
        {nilai && <Check className="size-4" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {gejala && level === "merah" && <Lencana warna="merah">Bahaya</Lencana>}
    </button>
  );
}

function Riwayat({ lembar, catatan, gejala }: { lembar: Lembar; catatan: { data: Data }[]; gejala: (readonly [string, string])[] }) {
  const k = KONFIG[lembar];
  const kolom = catatan.map((c) => Number(c.data[k.kunci])).sort((a, b) => a - b).slice(-8);
  if (!kolom.length) return null;
  return (
    <Kartu className="overflow-x-auto p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Riwayat (seperti lembar di buku)</p>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="pb-2 text-left font-semibold text-muted">{k.satuan} ke-</th>
            {kolom.map((p) => (
              <th key={p} className="w-7 pb-2 text-center font-bold">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gejala.map(([kk, label]) => (
            <tr key={kk} className="border-t border-line/70">
              <td className="max-w-40 truncate py-1.5 pr-2 text-muted" title={label}>
                {label}
              </td>
              {kolom.map((p) => {
                const c = catatan.find((x) => Number(x.data[k.kunci]) === p);
                return (
                  <td key={p} className="text-center">
                    {c?.data[kk] === true ? <span className="inline-block size-4 rounded bg-merah text-[10px] leading-4 text-white">✓</span> : <span className="text-line">·</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Kartu>
  );
}
