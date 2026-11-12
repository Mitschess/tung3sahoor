"use client";

import { AlertTriangle, Info, ScanLine, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { bolehLihatKolom } from "@/lib/akses";
import { DISEMBUNYIKAN, WAJIB, grupKolom, teksPanjang } from "@/lib/formulir";
import { kamus, validasiNilai, type Kolom } from "@/lib/kamus";
import { WARNA_TANDA, type Tanda } from "@/lib/nilai-catatan";
import { usePengguna } from "@/lib/store";
import type { Data, Nilai } from "@/lib/types";
import { cn } from "@/lib/util";
import { Masukan, Pilihan, Tombol } from "./ui";

export const BATAS_YAKIN = 0.85;

interface Props {
  tabel: string;
  nilaiAwal?: Data;
  /** Nilai yang dihitung sistem untuk kolom bertanda otomatis (tetap bisa diubah). */
  otomatis?: Data;
  /** Tingkat keyakinan OCR per kolom; < 0,85 diberi kotak kuning. */
  yakin?: Record<string, number>;
  kolom?: string[];
  labelSimpan?: string;
  onSimpan: (data: Data) => void | Promise<void>;
  onBatal?: () => void;
  ekstra?: ReactNode;
  memuat?: boolean;
}

function keAngka(v: unknown): number | undefined {
  if (v === "" || v === undefined || v === null) return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

export function KamusForm({ tabel, nilaiAwal, otomatis, yakin, kolom, labelSimpan = "Simpan", onSimpan, onBatal, ekstra, memuat }: Props) {
  const u = usePengguna();
  const def = kamus.tabel[tabel];
  const daftar = useMemo(
    () =>
      (kolom ?? Object.keys(def.kolom)).filter((k) => {
        const kol = def.kolom[k];
        if (!kol || kol.tipe === "ref") return false;
        if (DISEMBUNYIKAN.has(k) && !kolom) return false;
        return bolehLihatKolom(u, k);
      }),
    [def, kolom, u],
  );
  const [nilai, setNilai] = useState<Data>(() => ({ ...(otomatis ?? {}), ...(nilaiAwal ?? {}) }));
  const [dicoba, setDicoba] = useState(false);
  const wajib = WAJIB[tabel] ?? [];

  const galat: Record<string, string> = {};
  for (const k of daftar) {
    const kol = def.kolom[k];
    const v = nilai[k];
    const h = validasiNilai(kol, v);
    if (!h.ok) galat[k] = h.pesan;
    else if (wajib.includes(k) && (v === undefined || v === "" || (Array.isArray(v) && !v.length))) galat[k] = "Wajib diisi";
  }
  const adaGalat = Object.keys(galat).length > 0;

  const ubah = (k: string, v: Nilai) => setNilai((s) => ({ ...s, [k]: v }));

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    setDicoba(true);
    if (adaGalat) return;
    const out: Data = {};
    for (const [k, v] of Object.entries(nilai)) {
      const kol = def.kolom[k];
      if (!kol) continue;
      out[k] = kol.tipe === "number" ? keAngka(v) : v;
    }
    await onSimpan(out);
  };

  // Kelompokkan
  const grup: { nama: string; kolom: string[] }[] = [];
  for (const k of daftar) {
    const g = grupKolom(tabel, k);
    const ada = grup.find((x) => x.nama === g);
    if (ada) ada.kolom.push(k);
    else grup.push({ nama: g, kolom: [k] });
  }

  return (
    <form onSubmit={kirim} className="space-y-5" noValidate>
      {grup.map((g) => (
        <fieldset key={g.nama || "_"} className="space-y-4">
          {g.nama && <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">{g.nama}</legend>}
          <div className="grid gap-4 sm:grid-cols-2">
            {g.kolom.map((k) => (
              <Bidang
                key={k}
                nama={k}
                kol={def.kolom[k]}
                nilai={nilai[k]}
                ubah={(v) => ubah(k, v)}
                galat={dicoba || nilai[k] !== undefined ? galat[k] : undefined}
                wajib={wajib.includes(k)}
                yakin={yakin?.[k]}
                otomatis={otomatis && k in otomatis && otomatis[k] !== undefined}
              />
            ))}
          </div>
        </fieldset>
      ))}
      {ekstra}
      {dicoba && adaGalat && (
        <p className="flex items-center gap-2 rounded-xl bg-merah-soft px-3 py-2 text-sm font-medium text-merah">
          <AlertTriangle className="size-4" /> Ada {Object.keys(galat).length} isian yang perlu dicek.
        </p>
      )}
      <div className="sticky bottom-0 -mx-1 flex gap-2 bg-gradient-to-t from-surface via-surface to-transparent px-1 pt-4 pb-1">
        {onBatal && (
          <Tombol type="button" varian="garis" onClick={onBatal}>
            Batal
          </Tombol>
        )}
        <Tombol type="submit" className="flex-1" memuat={memuat}>
          {labelSimpan}
        </Tombol>
      </div>
    </form>
  );
}

function Bidang({ nama, kol, nilai, ubah, galat, wajib, yakin, otomatis }: { nama: string; kol: Kolom; nilai: Nilai; ubah: (v: Nilai) => void; galat?: string; wajib: boolean; yakin?: number; otomatis?: boolean }) {
  const ragu = yakin !== undefined && yakin < BATAS_YAKIN;
  const lebar = teksPanjang(nama) || kol.tipe === "enum_multi" || kol.tipe === "object" || kol.tipe === "list" || (kol.label.length > 48 && kol.tipe === "boolean");
  return (
    <div className={cn("space-y-1.5 rounded-xl", lebar && "sm:col-span-2", ragu && "-m-2 bg-kuning-soft p-2 ring-1 ring-kuning/40")}>
      <label htmlFor={`f-${nama}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-ink">
        <span>
          {kol.label}
          {wajib && <span className="text-merah"> *</span>}
        </span>
        {kol.satuan && <span className="text-xs font-medium text-muted">({kol.satuan})</span>}
        {otomatis && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-ink">
            <Sparkles className="size-3" /> otomatis
          </span>
        )}
        {yakin !== undefined && (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", ragu ? "bg-kuning text-white" : "bg-hijau-soft text-hijau")}>
            <ScanLine className="size-3" /> OCR {Math.round(yakin * 100)}%
          </span>
        )}
      </label>
      <Masukkan nama={nama} kol={kol} nilai={nilai} ubah={ubah} />
      {galat ? (
        <p className="text-xs font-medium text-merah">{galat}</p>
      ) : kol.peringatan ? (
        <p className="flex items-start gap-1 text-xs text-muted">
          <Info className="mt-px size-3 shrink-0" />
          {kol.peringatan}
          {kol.rentang ? ` · rentang wajar ${kol.rentang[0]}–${kol.rentang[1]}` : ""}
        </p>
      ) : kol.rentang ? (
        <p className="text-xs text-muted">Rentang wajar {kol.rentang[0]}–{kol.rentang[1]}</p>
      ) : null}
    </div>
  );
}

function Masukkan({ nama, kol, nilai, ubah }: { nama: string; kol: Kolom; nilai: Nilai; ubah: (v: Nilai) => void }) {
  const id = `f-${nama}`;
  switch (kol.tipe) {
    case "number":
      return (
        <div className="relative">
          <Masukan id={id} inputMode="decimal" value={nilai === undefined || nilai === null ? "" : String(nilai)} onChange={(e) => ubah(e.target.value)} placeholder={kol.rentang ? `${kol.rentang[0]}–${kol.rentang[1]}` : ""} className={kol.satuan ? "pr-20" : ""} />
          {kol.satuan && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">{kol.satuan}</span>}
        </div>
      );
    case "date":
      return <Masukan id={id} type="date" value={String(nilai ?? "").slice(0, 10)} onChange={(e) => ubah(e.target.value)} />;
    case "datetime":
      return <Masukan id={id} type="datetime-local" value={nilai ? toLocalInput(String(nilai)) : ""} onChange={(e) => ubah(e.target.value ? new Date(e.target.value).toISOString() : "")} />;
    case "boolean":
      return <YaTidak nilai={nilai as boolean | undefined} ubah={ubah} />;
    case "enum": {
      const p = kol.pilihan ?? [];
      if (!p.length) return <Masukan id={id} value={String(nilai ?? "")} onChange={(e) => ubah(e.target.value)} />;
      if (p.length <= 4 && p.join("").length < 48)
        return (
          <div className="flex flex-wrap gap-1.5">
            {p.map((o) => (
              <Chip key={o} aktif={nilai === o} onClick={() => ubah(nilai === o ? undefined : o)}>
                {o}
              </Chip>
            ))}
          </div>
        );
      return (
        <Pilihan id={id} value={String(nilai ?? "")} onChange={(e) => ubah(e.target.value || undefined)}>
          <option value="">— pilih —</option>
          {p.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Pilihan>
      );
    }
    case "enum_multi": {
      const arr = Array.isArray(nilai) ? (nilai as string[]) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {(kol.pilihan ?? []).map((o) => (
            <Chip key={o} aktif={arr.includes(o)} onClick={() => ubah(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])}>
              {o}
            </Chip>
          ))}
        </div>
      );
    }
    case "list":
      return (
        <textarea
          id={id}
          rows={3}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          placeholder="Satu baris per orang, mis. Pak Darto · 0812…"
          value={Array.isArray(nilai) ? (nilai as string[]).join("\n") : ""}
          onChange={(e) => ubah(e.target.value.split("\n").filter((s) => s.trim()))}
        />
      );
    case "object":
      return (
        <textarea
          id={id}
          rows={2}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          placeholder="Ringkasan isian"
          value={nilai && typeof nilai === "object" && !Array.isArray(nilai) ? String((nilai as Record<string, unknown>).catatan ?? "") : ""}
          onChange={(e) => ubah(e.target.value ? { catatan: e.target.value } : undefined)}
        />
      );
    default:
      return teksPanjang(nama) ? (
        <textarea
          id={id}
          rows={3}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          value={String(nilai ?? "")}
          onChange={(e) => ubah(e.target.value)}
        />
      ) : (
        <Masukan id={id} value={String(nilai ?? "")} onChange={(e) => ubah(e.target.value)} />
      );
  }
}

function toLocalInput(isoStr: string): string {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function Chip({ aktif, onClick, children }: { aktif: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
        aktif ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand/40",
      )}
    >
      {children}
    </button>
  );
}

export function YaTidak({ nilai, ubah }: { nilai: boolean | undefined; ubah: (v: boolean | undefined) => void }) {
  return (
    <div className="inline-flex rounded-full bg-black/[0.04] p-1">
      {([true, false] as const).map((b) => (
        <button
          type="button"
          key={String(b)}
          aria-pressed={nilai === b}
          onClick={() => ubah(nilai === b ? undefined : b)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition",
            nilai === b ? (b ? "bg-brand text-white shadow-sm" : "bg-surface text-ink shadow-sm") : "text-muted",
          )}
        >
          {b ? "Ya" : "Tidak"}
        </button>
      ))}
    </div>
  );
}

/** Tampilan baca-saja satu catatan sesuai kamus data. */
/**
 * Isi satu catatan sebagai daftar label–nilai. Tekanan darah dibaca sebagai satu angka (145/95),
 * label "Kunjungan ke-" menjadi "Kunjungan · ke-5", dan nilai yang ditandai (`tandai`) diberi warna.
 */
export function TampilCatatan({ tabel, data, ringkas, tandai }: { tabel: string; data: Data; ringkas?: boolean; tandai?: Record<string, Tanda> }) {
  const u = usePengguna();
  const def = kamus.tabel[tabel];
  const ada = (v: unknown) => !(v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length));
  const baris = Object.entries(def.kolom).filter(([k, kol]) => {
    if (!ada(data[k])) return false;
    if (kol.tipe === "ref" || ["ibu_id", "kehamilan_id", "anak_id", "rujukan_id"].includes(k)) return false;
    return bolehLihatKolom(u, k);
  });
  const td = ada(data.td_sistolik) && ada(data.td_diastolik);
  return (
    <dl className={cn("-mx-2.5 grid gap-x-6", ringkas ? "grid-cols-1" : "sm:grid-cols-2")}>
      {baris.map(([k, kol]) => {
        if (td && k === "td_diastolik") return null;
        let label = kol.label;
        let nilai = format(kol, data[k]);
        let t = tandai?.[k];
        if (td && k === "td_sistolik") {
          label = "Tekanan darah";
          nilai = `${data.td_sistolik}/${data.td_diastolik} mmHg`;
          t = tandai?.td;
        } else if (kol.tipe === "number" && /\s?ke-$/.test(label)) {
          label = label.replace(/\s?ke-$/, "");
          nilai = `ke-${nilai}`;
        } else if (kol.tipe === "number" && !kol.satuan && k.endsWith("_minggu")) {
          nilai = `${nilai} minggu`;
        }
        return (
          <div key={k} className={cn("flex items-baseline justify-between gap-4 border-b border-line/70 px-2.5 py-2 text-sm", t && cn("my-0.5 rounded-xl border-transparent", WARNA_TANDA[t.level]))}>
            <dt className={t ? "font-medium" : "text-muted"}>{label}</dt>
            <dd className="text-right font-semibold">
              {nilai}
              {t && (
                <span className="block text-[11.5px] font-semibold">
                  {t.judul}
                  {t.ket && <span className="font-normal"> ({t.ket})</span>}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function format(kol: Kolom, v: Nilai): string {
  if (v === undefined || v === null || v === "") return "–";
  if (kol.tipe === "boolean") return v ? "Ya" : "Tidak";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return String((v as Record<string, unknown>).catatan ?? JSON.stringify(v));
  if (kol.tipe === "date") return new Date(String(v)).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  if (kol.tipe === "datetime") return new Date(String(v)).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  if (kol.tipe === "number") return `${String(v).replace(".", ",")}${kol.satuan ? ` ${kol.satuan}` : ""}`;
  return String(v);
}
