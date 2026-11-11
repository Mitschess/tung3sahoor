"use client";

import { Camera, CheckCircle2, ImageUp, Loader2, ScanLine, ShieldCheck, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BATAS_YAKIN, KamusForm } from "@/components/kamus-form";
import { KepalaHalaman } from "@/components/kepala";
import { JudulBagian, Kartu, Kosong, Memuat, Pilihan, Tombol } from "@/components/ui";
import { TABEL_OCR, bolehOcr } from "@/lib/akses";
import { kompres, ukuranKb } from "@/lib/gambar";
import { namaPengguna, useDaftarRingkasan, type Ringkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna, useStore } from "@/lib/store";
import { parse, tampilWaktu } from "@/lib/tanggal";
import { ukPada } from "@/lib/tahap";
import type { Data, DrafOcr } from "@/lib/types";

/** Draf yang baru saja dikonfirmasi: tampilkan "memuat" (bukan "tidak ditemukan") selama pindah halaman. */
let barusDikonfirmasi: string | null = null;

export default function HalamanFoto() {
  return (
    <Suspense fallback={<Memuat />}>
      <Foto />
    </Suspense>
  );
}

function Foto() {
  const u = usePengguna();
  const sp = useSearchParams();
  const rs = useDaftarRingkasan();
  const semuaDraf = useStore((s) => s.draf);
  const idsBoleh = useMemo(() => new Set(rs.map((r) => r.ibu.id)), [rs]);
  const draf = semuaDraf.filter((d) => idsBoleh.has(d.ibuId));
  const drafId = sp.get("draf");

  if (!u) return <Memuat />;
  if (!bolehOcr(u)) return <Kosong judul="Tidak diizinkan" teks="Foto Buku KIA dibaca oleh kader atau nakes, lalu dikonfirmasi sebelum tersimpan." />;

  const aktif = drafId ? draf.find((d) => d.id === drafId) : undefined;
  if (drafId && !aktif && drafId === barusDikonfirmasi) return <Memuat />;
  if (drafId && !aktif) return <Kosong judul="Draf tidak ditemukan" teks="Mungkin sudah dikonfirmasi atau dihapus." aksi={<Link href="/app/foto" className="font-semibold text-brand">Kembali</Link>} />;
  if (aktif) {
    const r = rs.find((x) => x.ibu.id === aktif.ibuId);
    if (!r) return <Memuat />;
    return <Konfirmasi d={aktif} r={r} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <KepalaHalaman judul="Foto Buku KIA" sub="Potret tabel pemeriksaan → AI membaca → Anda cek & konfirmasi. Tidak ada yang tersimpan sebelum dikonfirmasi." />
      <Unggah rs={rs} ibuAwal={sp.get("ibu") ?? undefined} />
      <section>
        <JudulBagian>Draf menunggu konfirmasi {draf.length ? `· ${draf.length}` : ""}</JudulBagian>
        {draf.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {draf.map((d) => (
              <ItemDraf key={d.id} d={d} nama={String(rs.find((r) => r.ibu.id === d.ibuId)?.ibu.profil.nama ?? "–")} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Belum ada draf.</p>
        )}
      </section>
    </div>
  );
}

function ItemDraf({ d, nama }: { d: DrafOcr; nama: string }) {
  const hapus = useStore((s) => s.hapusDraf);
  const rendah = Object.values(d.yakin).filter((y) => y < BATAS_YAKIN).length;
  return (
    <Kartu className="flex gap-3 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.fotoDataUrl} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{nama}</p>
        <p className="text-xs text-muted">
          {kamus.tabel[d.tabel].judul} · {tampilWaktu(d.dibuat_pada)}
        </p>
        <p className="mt-1 text-xs">
          {Object.keys(d.hasil).length} kolom terbaca{rendah ? <span className="text-kuning"> · {rendah} perlu dicek</span> : null}
        </p>
        <div className="mt-2 flex gap-2">
          <Link href={`/app/foto?draf=${d.id}`} className="inline-flex h-8 items-center rounded-full bg-brand px-3 text-xs font-semibold text-white">
            Cek & konfirmasi
          </Link>
          <button
            type="button"
            onClick={() => {
              hapus(d.id);
              toast("Draf dan fotonya dihapus");
            }}
            className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs text-muted hover:text-merah"
          >
            <Trash2 className="size-3.5" /> Hapus
          </button>
        </div>
      </div>
    </Kartu>
  );
}

function opsiKunjungan(tabel: string): { nilai: string; label: string }[] {
  if (tabel === "anc") return [1, 2, 3, 4, 5, 6].map((n) => ({ nilai: String(n), label: `K${n}` }));
  if (tabel === "kf") return [1, 2, 3, 4].map((n) => ({ nilai: String(n), label: `KF${n}` }));
  return ["KN1", "KN2", "KN3"].map((n) => ({ nilai: n, label: n }));
}

function kunjunganBerikutnya(r: Ringkasan | undefined, tabel: string): string {
  if (!r) return opsiKunjungan(tabel)[0].nilai;
  const n = r.cari(tabel).length;
  if (tabel === "anc") return String(Math.min(6, n + 1));
  if (tabel === "kf") return String(Math.min(4, n + 1));
  const kn = r.cari("kn").filter((k) => String(k.data.kn_ke).startsWith("KN")).length;
  return ["KN1", "KN2", "KN3"][Math.min(2, kn)];
}

function Unggah({ rs, ibuAwal }: { rs: Ringkasan[]; ibuAwal?: string }) {
  const router = useRouter();
  const tambahDraf = useStore((s) => s.tambahDraf);
  const [ibuId, setIbuId] = useState(ibuAwal && rs.some((r) => r.ibu.id === ibuAwal) ? ibuAwal : (rs[0]?.ibu.id ?? ""));
  const r = rs.find((x) => x.ibu.id === ibuId);
  const tabelAwal = r?.tahap.set === "nifas" ? "kf" : "anc";
  const [tabel, setTabel] = useState(tabelAwal);
  const [ke, setKe] = useState(() => kunjunganBerikutnya(r, tabelAwal));
  const [foto, setFoto] = useState<string | null>(null);
  const [proses, setProses] = useState<"diam" | "kompres" | "baca">("diam");
  const inputKamera = useRef<HTMLInputElement>(null);
  const inputBerkas = useRef<HTMLInputElement>(null);

  const gantiIbu = (id: string) => {
    setIbuId(id);
    const rr = rs.find((x) => x.ibu.id === id);
    const t = rr?.tahap.set === "nifas" ? "kf" : "anc";
    setTabel(t);
    setKe(kunjunganBerikutnya(rr, t));
  };
  const gantiTabel = (t: string) => {
    setTabel(t);
    setKe(kunjunganBerikutnya(r, t));
  };

  const pilihBerkas = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Pilih berkas gambar.");
    setProses("kompres");
    try {
      setFoto(await kompres(f, 1600));
    } catch {
      toast.error("Foto tidak bisa dibaca peramban ini.");
    } finally {
      setProses("diam");
    }
  };

  const baca = async () => {
    if (!foto || !r) return;
    setProses("baca");
    try {
      const res = await fetch("/api/ocr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tabel, gambar: foto, kunjungan: ke }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.pesan ?? "Gagal membaca foto");
      // Simpan miniatur yang lebih kecil untuk perbandingan saat konfirmasi (hemat penyimpanan perangkat).
      const mini = await kompres(await (await fetch(foto)).blob(), 1100, 0.7);
      const d = tambahDraf({ ibuId: r.ibu.id, tabel, fotoDataUrl: mini, hasil: json.hasil ?? {}, yakin: json.yakin ?? {}, mode: json.mode, model: json.model });
      toast.success(json.mode === "demo" ? "Mode demo: contoh hasil dibuat (tanpa kunci AI)" : "Foto terbaca. Silakan cek hasilnya.");
      router.push(`/app/foto?draf=${d.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProses("diam");
    }
  };

  if (!rs.length) return <Kosong judul="Belum ada ibu di wilayah Anda" />;

  return (
    <Kartu className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <label className="block text-sm font-semibold">
          Ibu
          <Pilihan value={ibuId} onChange={(e) => gantiIbu(e.target.value)} className="mt-1.5">
            {rs.map((x) => (
              <option key={x.ibu.id} value={x.ibu.id}>
                {String(x.ibu.profil.nama)} · {x.tahap.label}
              </option>
            ))}
          </Pilihan>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">
            Tabel di buku
            <Pilihan value={tabel} onChange={(e) => gantiTabel(e.target.value)} className="mt-1.5">
              {TABEL_OCR.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()} · {kamus.tabel[t].judul.replace(/^Pemeriksaan\s*/i, "")}
                </option>
              ))}
            </Pilihan>
          </label>
          <label className="block text-sm font-semibold">
            Kolom kunjungan
            <Pilihan value={ke} onChange={(e) => setKe(e.target.value)} className="mt-1.5">
              {opsiKunjungan(tabel).map((o) => (
                <option key={o.nilai} value={o.nilai}>
                  {o.label}
                </option>
              ))}
            </Pilihan>
          </label>
        </div>
        <ul className="space-y-1.5 rounded-2xl bg-bg p-3 text-xs text-muted">
          <li className="flex gap-2"><Camera className="size-3.5 shrink-0" /> Foto tegak lurus, satu halaman penuh, cahaya cukup tanpa bayangan.</li>
          <li className="flex gap-2"><ShieldCheck className="size-3.5 shrink-0" /> Foto dikompres di perangkat (maks 1600 px) dan dihapus setelah data dikonfirmasi.</li>
          <li className="flex gap-2"><TriangleAlert className="size-3.5 shrink-0" /> Kotak kuning = AI kurang yakin. Wajib dicek dengan buku aslinya.</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex min-h-56 flex-1 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-bg">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="Pratinjau foto Buku KIA" className="max-h-80 w-full object-contain" />
          ) : (
            <div className="p-6 text-center text-sm text-muted">
              <ScanLine className="mx-auto mb-2 size-8 text-brand" />
              Belum ada foto
            </div>
          )}
          {proses !== "diam" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/80 text-sm font-semibold backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-brand" />
              {proses === "kompres" ? "Mengompres foto…" : "AI sedang membaca tulisan…"}
            </div>
          )}
        </div>
        {foto && <p className="text-center text-xs text-muted">± {ukuranKb(foto)} kB setelah kompres</p>}
        <input ref={inputKamera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pilihBerkas(e.target.files?.[0])} />
        <input ref={inputBerkas} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pilihBerkas(e.target.files?.[0])} />
        <div className="grid grid-cols-2 gap-2">
          <Tombol varian="garis" type="button" onClick={() => inputKamera.current?.click()}>
            <Camera className="size-4" /> Kamera
          </Tombol>
          <Tombol varian="garis" type="button" onClick={() => inputBerkas.current?.click()}>
            <ImageUp className="size-4" /> Pilih berkas
          </Tombol>
        </div>
        <Tombol type="button" onClick={baca} disabled={!foto || proses !== "diam"} memuat={proses === "baca"}>
          <Sparkles className="size-4" /> Baca dengan AI
        </Tombol>
      </div>
    </Kartu>
  );
}

function Konfirmasi({ d, r }: { d: DrafOcr; r: Ringkasan }) {
  const router = useRouter();
  const konfirmasi = useStore((s) => s.konfirmasiDraf);
  const hapus = useStore((s) => s.hapusDraf);
  const [memuat, setMemuat] = useState(false);
  const def = kamus.tabel[d.tabel];
  const rendah = Object.entries(d.yakin).filter(([, y]) => y < BATAS_YAKIN);

  const onSimpan = (data: Data) => {
    setMemuat(true);
    try {
      const out = { ...data };
      if (d.tabel === "anc" && out.tanggal) out.usia_kehamilan_minggu = ukPada(r.tahap.hpl, parse(out.tanggal) ?? new Date());
      barusDikonfirmasi = d.id;
      konfirmasi(d.id, out);
      toast.success("Data dikonfirmasi & tersimpan. Foto dihapus dari perangkat.");
      router.push(`/app/ibu/${r.ibu.id}`);
    } catch (e) {
      toast.error((e as Error).message);
      setMemuat(false);
    }
  };

  return (
    <div className="space-y-5">
      <KepalaHalaman judul={`Konfirmasi: ${def.judul}`} sub={`${String(r.ibu.profil.nama)} · difoto oleh ${namaPengguna(d.dibuat_oleh)} · ${tampilWaktu(d.dibuat_pada)}`} kembali="/app/foto" />
      <div className={d.mode === "demo" ? "rounded-2xl bg-kuning-soft px-4 py-3 text-sm text-kuning" : "rounded-2xl bg-brand-soft/60 px-4 py-3 text-sm text-brand-ink"}>
        {d.mode === "demo" ? (
          <>
            <b>Mode demo.</b> Server belum memiliki <code>GEMINI_API_KEY</code>, jadi isian di bawah adalah <b>contoh</b>, bukan hasil membaca foto Anda.
          </>
        ) : (
          <>
            Dibaca oleh <b>{d.model}</b>. Status: <b>draf</b>, belum menjadi data resmi sampai Anda menekan konfirmasi.
          </>
        )}{" "}
        {rendah.length > 0 && <span>{rendah.length} kolom berkotak kuning perlu dicocokkan dengan buku.</span>}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Kartu className="p-2">
            <a href={d.fotoDataUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.fotoDataUrl} alt="Foto Buku KIA yang dibaca" className="max-h-[70vh] w-full rounded-xl object-contain" />
            </a>
          </Kartu>
          <Tombol
            varian="hantu"
            kecil
            className="mt-2"
            type="button"
            onClick={() => {
              hapus(d.id);
              toast("Draf dihapus");
              router.push("/app/foto");
            }}
          >
            <Trash2 className="size-4" /> Buang draf & foto
          </Tombol>
        </div>
        <Kartu>
          <KamusForm
            key={d.id}
            tabel={d.tabel}
            nilaiAwal={d.hasil}
            yakin={d.yakin}
            labelSimpan="Konfirmasi & simpan"
            onSimpan={onSimpan}
            onBatal={() => router.push("/app/foto")}
            memuat={memuat}
            ekstra={
              <p className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 className="size-3.5 text-hijau" /> Nama Anda dan waktu konfirmasi dicatat pada data ini.
              </p>
            }
          />
        </Kartu>
      </div>
    </div>
  );
}
