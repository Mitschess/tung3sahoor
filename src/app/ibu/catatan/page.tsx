"use client";

import { AlertOctagon, ChevronRight, Lock } from "lucide-react";
import { useState } from "react";
import { TampilCatatan } from "@/components/kamus-form";
import { Ilustrasi } from "@/components/ilustrasi";
import { judulCatatan } from "@/components/riwayat";
import { Kosong, Memuat, Modal, Tab, TautanBuku } from "@/components/ui";
import { TEMA, type Tema } from "@/data/edukasi";
import { bolehLihatKolom } from "@/lib/akses";
import { BAB_TABEL, halamanCetakTabel, judulTabelIbu, keteranganCatatan, tanggalCatatan } from "@/lib/bab";
import { namaPengguna, useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { WARNA_TANDA, tandaiNilai, tandaUtama, type Tanda } from "@/lib/nilai-catatan";
import { usePengguna } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";
import { tampilWaktu } from "@/lib/tanggal";
import type { Catatan as TCatatan, Peringatan } from "@/lib/types";
import { cn } from "@/lib/util";

/** Bab yang sedang dijalani ibu tampil paling atas. */
const URUTAN_BAB: Record<SetMenu, Tema[]> = {
  hamil: ["rose", "brand", "ungu", "teal"],
  nifas: ["ungu", "teal", "brand", "rose"],
  tumbuh: ["teal", "ungu", "brand", "rose"],
  belum: ["rose", "brand", "ungu", "teal"],
};

/** Label tab yang pendek supaya semua tab muat satu baris di layar HP. */
const LABEL_TAB: Record<Tema, string> = { rose: "Hamil", brand: "Lahir", ungu: "Nifas", teal: "Bayi", hijau: "Menyusui" };

const ASAL: Record<string, string | null> = { "foto (OCR)": "dari foto Buku KIA", impor: "dari data lama", "Ketik manual": null };

/** Catatan: semua riwayat Ibu dari seluruh tahap, dikelompokkan per bab Buku KIA. */
export default function Catatan() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const [bab, setBab] = useState<Tema | "semua">("semua");
  const [buka, setBuka] = useState<TCatatan | null>(null);
  if (!r) return <Memuat />;

  const urutan = URUTAN_BAB[r.tahap.set];
  const terbaru = (cs: TCatatan[]) => cs.reduce((a, c) => (tanggalCatatan(c) > a ? tanggalCatatan(c) : a), "");
  const grup = BAB_TABEL.map((b) => ({
    ...b,
    // Di dalam bab, jenis catatan yang terakhir diisi tampil lebih dulu.
    isi: b.tabel
      .filter((t) => kamus.tabel[t])
      .map((t) => ({ tabel: t, catatan: r.cari(t) }))
      .filter((x) => x.catatan.length)
      .sort((a, b) => terbaru(b.catatan).localeCompare(terbaru(a.catatan))),
  }))
    .filter((b) => b.isi.length)
    .sort((a, b) => urutan.indexOf(a.tema) - urutan.indexOf(b.tema));
  const total = grup.reduce((a, b) => a + b.isi.reduce((x, y) => x + y.catatan.length, 0), 0);
  const tampilkan = bab === "semua" ? grup : grup.filter((g) => g.tema === bab);

  const pengisi = (c: TCatatan) => (c.meta.dibuat_oleh === u?.id ? "Ibu sendiri" : namaPengguna(c.meta.dibuat_oleh));
  const tandaDari = (c: TCatatan) => tandaiNilai(c.tabel, c.data, (k) => bolehLihatKolom(u, k));
  const peringatanDari = (c: TCatatan) => r.peringatan.filter((p) => p.catatanId === c.id);

  return (
    <div className="space-y-5 px-4 pt-5">
      {/* Catatan adalah tab di menu bawah, jadi judulnya tanpa tombol kembali (sama seperti Fitur dan Profil). */}
      <header>
        <h1 className="text-xl font-bold">Catatan</h1>
        <p className="text-sm text-muted">{total ? `${total} catatan dari Buku KIA Ibu` : "Buku KIA digital milik Ibu"}</p>
      </header>

      {grup.length === 0 ? (
        <Kosong ikon={<Ilustrasi nama="catatan" className="size-20" />} judul="Belum ada catatan" teks="Catatan muncul setelah kader atau bidan mengisi hasil periksa Ibu." />
      ) : (
        <>
          {grup.length > 1 && <Tab nilai={bab} setNilai={setBab} pilihan={[{ nilai: "semua" as const, label: "Semua" }, ...grup.map((g) => ({ nilai: g.tema, label: LABEL_TAB[g.tema] }))]} />}
          {tampilkan.map((g) => (
            <section key={g.tema} className="space-y-3">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <span className={cn("h-4 w-1.5 rounded-full", TEMA[g.tema].pita)} />
                {g.judul}
              </h2>
              {g.isi.map(({ tabel, catatan }) => {
                const hlm = halamanCetakTabel(tabel);
                const urut = [...catatan].sort((a, b) => tanggalCatatan(b).localeCompare(tanggalCatatan(a)));
                return (
                  <div key={tabel} className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
                    <div className="flex items-start justify-between gap-3 px-4 pb-1 pt-3.5">
                      <h3 className="min-w-0 font-bold leading-snug">{judulTabelIbu(tabel)}</h3>
                      {hlm && <TautanBuku halaman={hlm} label={`hlm. ${hlm}`} className="mt-0.5" />}
                    </div>
                    <ul className="divide-y divide-line">
                      {urut.map((c) => {
                        const judul = judulCatatan(c);
                        const tanda = tandaUtama(tandaDari(c));
                        const p = tanda ? undefined : peringatanDari(c)[0];
                        const asal = ASAL[c.meta.sumber];
                        return (
                          <li key={c.id}>
                            <button type="button" onClick={() => setBuka(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-bg">
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px] font-semibold">{judul}</span>
                                <span className="block truncate text-xs text-muted">
                                  {keteranganCatatan(c, judul, pengisi(c))}
                                  {asal && ` · ${asal}`}
                                </span>
                                {(tanda || p) && <PilTanda level={(tanda ?? p)!.level} teks={tanda ? tanda.judul + (tanda.lain ? ` +${tanda.lain} lainnya` : "") : p!.judul} />}
                              </span>
                              <ChevronRight className="size-5 shrink-0 text-muted" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}

      {grup.length > 0 && (
        <p className="flex items-start gap-2 rounded-2xl bg-black/[0.03] p-4 text-xs text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" />
          Hasil tripel eliminasi dan skrining kesehatan jiwa tidak ditampilkan di aplikasi untuk menjaga privasi Ibu. Bidan akan menjelaskannya langsung.
        </p>
      )}

      <Modal buka={!!buka} setBuka={() => setBuka(null)} judul={buka ? judulTabelIbu(buka.tabel) : ""} deskripsi={buka ? judulCatatan(buka) : undefined}>
        {buka && <DetailCatatan c={buka} tanda={tandaDari(buka)} peringatan={peringatanDari(buka)} pengisi={pengisi(buka)} />}
      </Modal>
    </div>
  );
}

function PilTanda({ level, teks }: { level: Tanda["level"]; teks: string }) {
  return (
    <span className={cn("mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold", WARNA_TANDA[level])}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">{teks}</span>
    </span>
  );
}

/** Isi catatan: ringkasan hal yang perlu perhatian di atas, lalu semua isian dengan nilai bertanda. */
function DetailCatatan({ c, tanda, peringatan, pengisi }: { c: TCatatan; tanda: Record<string, Tanda>; peringatan: Peringatan[]; pengisi: string }) {
  const daftar = Object.values(tanda);
  // Bila tidak ada nilai bertanda, pakai peringatan yang dihitung dari catatan ini (mis. kenaikan berat badan).
  const butir = daftar.length ? daftar.map((t) => t.judul) : peringatan.map((p) => p.judul);
  const merah = daftar.some((t) => t.level === "merah") || (!daftar.length && peringatan.some((p) => p.level === "merah"));
  const asal = ASAL[c.meta.sumber];
  return (
    <>
      {butir.length > 0 && (
        <div className={cn("mb-3 flex gap-3 rounded-2xl p-3.5", WARNA_TANDA[merah ? "merah" : "kuning"])}>
          <AlertOctagon className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0 text-sm">
            <p className="font-bold">Perlu perhatian</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink/80">
              {[...new Set(butir)].map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs font-semibold">{merah ? "Bila belum ditangani, segera hubungi bidan atau ke Puskesmas." : "Tanyakan ke bidan saat periksa berikutnya."}</p>
          </div>
        </div>
      )}
      <TampilCatatan tabel={c.tabel} data={c.data} ringkas tandai={tanda} />
      <p className="mt-3 text-xs text-muted">
        Diisi {pengisi}
        {asal && ` ${asal}`}
        {c.meta.dikonfirmasi_oleh && `, dicek ${namaPengguna(c.meta.dikonfirmasi_oleh)} ${tampilWaktu(c.meta.dikonfirmasi_pada)}`}
      </p>
    </>
  );
}
