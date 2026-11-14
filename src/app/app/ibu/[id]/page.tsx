"use client";

import { ArrowLeft, CalendarClock, Camera, ChevronRight, ClipboardPlus, Lock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { tahapSingkat } from "@/components/baris-ibu";
import { GrafikBB, GrafikTfuDjj } from "@/components/grafik";
import { DaftarPeringatan } from "@/components/peringatan";
import { RiwayatTabel } from "@/components/riwayat";
import { DaftarJadwal, KartuTahap } from "@/components/tahap";
import { TombolWa, perluSegera } from "@/components/tombol-wa";
import { Baris, JudulBagian, Kartu, Kosong, LABEL_LEVEL, Lencana, Memuat, Modal, Tab, TautanTombol, Tombol } from "@/components/ui";
import { bolehIsi, bolehLihatSensitif, bolehOcr } from "@/lib/akses";
import { useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { useKembali } from "@/lib/navigasi";
import { ringkasKlinis, type ButirKlinis } from "@/lib/ringkas-klinis";
import { usePengguna } from "@/lib/store";
import { tampil, umurTahun } from "@/lib/tanggal";
import type { Catatan } from "@/lib/types";
import { cn } from "@/lib/util";

const FORM_HAMIL = ["riwayat", "anc", "lab_t1", "preeklamsia", "dm", "dokter_t1", "dokter_t3", "rujukan", "persiapan", "amanat", "persalinan", "bayi_lahir"];
const FORM_NIFAS = ["kf", "kn", "imunisasi", "bayi_lahir", "persalinan", "riwayat_persalinan", "rujukan", "tinja"];
/** Form yang paling sering dipakai tampil langsung; sisanya dilipat di "Form lain". */
const FORM_UTAMA = ["anc", "lab_t1", "kf", "kn", "rujukan"];
const TABEL_PERIKSA = ["riwayat", "anc", "dokter_t1", "lab_t1", "preeklamsia", "dm", "dokter_t3", "rujukan", "persalinan", "bayi_lahir", "imunisasi", "kf", "kn", "amanat", "persiapan", "kb"];
const TABEL_PANTAU = ["pemantauan_hamil", "pemantauan_nifas", "pemantauan_bayi", "tinja", "tindak_lanjut"];

type TabNama = "ringkasan" | "periksa" | "pantau" | "identitas";

const NADA = { merah: "text-merah", kuning: "text-kuning", hijau: "text-hijau" } as const;
const tgl = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

export default function DetailIbu() {
  const { id } = useParams<{ id: string }>();
  const u = usePengguna();
  const r = useRingkasan(id);
  const [tab, setTab] = useState<TabNama>("ringkasan");
  const [catat, setCatat] = useState(false);
  const kembali = useKembali("/app/ibu");
  if (!r) return <Kosong judul="Ibu tidak ditemukan atau di luar wilayah Anda" teks="Kader hanya bisa melihat ibu di wilayah posyandunya." />;
  if (!u) return <Memuat />;

  const p = r.ibu.profil;
  const daftarForm = (r.tahap.set === "nifas" ? FORM_NIFAS : FORM_HAMIL).filter((t) => bolehIsi(u, t));
  const klinis = ringkasKlinis(r);
  // Kunjungan yang sedang jatuh tempo dan boleh diisi peran ini menjadi aksi utama.
  const tempo = r.berikut && (r.berikut.status === "sekarang" || r.berikut.status === "terlambat") && bolehIsi(u, r.berikut.tabel) ? r.berikut : undefined;
  const sisaForm = daftarForm.filter((t) => t !== tempo?.tabel);
  const formUtama = sisaForm.filter((t) => FORM_UTAMA.includes(t));
  const formLain = sisaForm.filter((t) => !FORM_UTAMA.includes(t));
  const bisaCatat = !!tempo || sisaForm.length > 0;
  const jadwalBelum = r.jadwal.filter((k) => k.status !== "selesai");
  const jadwalSelesai = r.jadwal.filter((k) => k.status === "selesai");
  const tautanForm = (t: string) => (
    <Link key={t} href={`/app/ibu/${r.ibu.id}/isi/${t}`} className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold transition hover:border-brand/40 hover:bg-brand-soft/40">
      <ClipboardPlus className="size-4 shrink-0 text-brand" />
      <span className="leading-snug">{kamus.tabel[t].judul}</span>
    </Link>
  );
  const hrefUbah = (c: Catatan) => (bolehIsi(u, c.tabel) && !c.tabel.startsWith("pemantauan") ? `/app/ibu/${r.ibu.id}/isi/${c.tabel}?ubah=${c.id}` : null);

  return (
    <div className="space-y-5">
      <button type="button" onClick={kembali} className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted transition hover:bg-black/5 hover:text-ink">
        <ArrowLeft className="size-4" /> Daftar ibu
      </button>

      <header className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{String(p.nama)}</h1>
                <Lencana warna={r.warna}>{LABEL_LEVEL[r.warna]}</Lencana>
              </div>
              <p className="mt-1 text-sm font-semibold">
                {umurTahun(p.tanggal_lahir) ?? "–"} tahun · {tahapSingkat(r)}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> Posyandu {String(p.wilayah_posyandu)}
                  {p.rt_rw ? `, RT/RW ${String(p.rt_rw)}` : ""}
                </span>
                {p.telepon ? (
                  <a href={`tel:${String(p.telepon)}`} className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                    <Phone className="size-3.5" /> {String(p.telepon)}
                  </a>
                ) : null}
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {/* Aksi utama halaman ini: selalu di atas, di semua tab, tidak tenggelam di bawah peringatan. */}
              {bisaCatat ? (
                <Tombol kecil onClick={() => setCatat(true)}>
                  <ClipboardPlus className="size-4" /> Catat pemeriksaan
                </Tombol>
              ) : bolehOcr(u) ? (
                <TautanTombol href={`/app/foto?ibu=${r.ibu.id}`} kecil>
                  <Camera className="size-4" /> Foto Buku KIA
                </TautanTombol>
              ) : null}
              <TombolWa r={r} ke="ibu" jenis="otomatis" />
              <TombolWa r={r} ke="pendamping" jenis="otomatis" />
            </div>
            {/* Satu tempat untuk WhatsApp; isi pesannya mengikuti status ibu dan tidak pernah memuat hasil pemeriksaan. */}
            <p className="mt-1.5 text-xs text-muted">Pesan WA: {perluSegera(r) ? "ajakan segera periksa ke bidan" : "pengingat jadwal periksa"}</p>
          </div>
        </div>

        {klinis.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-5">
            {klinis.map((k) => (
              <Butir key={k.id} k={k} />
            ))}
          </dl>
        )}
      </header>

      <Tab
        nilai={tab}
        setNilai={setTab}
        pilihan={[
          { nilai: "ringkasan", label: `Ringkasan${r.peringatan.length ? ` · ${r.peringatan.length}` : ""}` },
          { nilai: "periksa", label: "Pemeriksaan" },
          { nilai: "pantau", label: "Diisi ibu" },
          { nilai: "identitas", label: "Identitas" },
        ]}
      />

      {tab === "ringkasan" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <section>
              <JudulBagian>Peringatan</JudulBagian>
              <DaftarPeringatan r={r} />
            </section>
          </div>
          <div className="space-y-6">
            <KartuTahap t={r.tahap} petugas />
            {r.jadwal.length > 0 && (
              <section>
                <JudulBagian>Jadwal kunjungan</JudulBagian>
                {jadwalBelum.length > 0 ? <DaftarJadwal js={jadwalBelum} /> : <p className="rounded-2xl bg-surface px-4 py-3.5 text-sm text-muted shadow-[var(--shadow-kartu)]">Semua kunjungan terjadwal sudah selesai.</p>}
                {jadwalSelesai.length > 0 && (
                  <details className="group mt-2">
                    <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
                      <ChevronRight className="size-4 transition group-open:rotate-90" /> {jadwalSelesai.length} kunjungan sudah selesai
                    </summary>
                    <div className="mt-1">
                      <DaftarJadwal js={jadwalSelesai} />
                    </div>
                  </details>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      {tab === "periksa" && (
        <div className="space-y-6">
          {r.tahap.set === "hamil" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Kartu>
                <JudulBagian>Grafik kenaikan berat badan</JudulBagian>
                <GrafikBB r={r} />
              </Kartu>
              <Kartu>
                <JudulBagian>TFU & DJJ</JudulBagian>
                <GrafikTfuDjj r={r} />
              </Kartu>
            </div>
          )}
          <div className="space-y-5">
            {TABEL_PERIKSA.map((t) => (
              <RiwayatTabel key={t} tabel={t} catatan={r.cari(t)} hrefUbah={hrefUbah} />
            ))}
          </div>
          {!bolehLihatSensitif(u) && (
            <p className="flex items-center gap-2 text-xs text-muted">
              <Lock className="size-3.5" /> Hasil tripel eliminasi dan skrining kesehatan jiwa disembunyikan untuk peran kader.
            </p>
          )}
        </div>
      )}

      {tab === "pantau" && (
        <div className="space-y-5">
          {TABEL_PANTAU.some((t) => r.cari(t).length) ? TABEL_PANTAU.map((t) => <RiwayatTabel key={t} tabel={t} catatan={r.cari(t)} />) : <Kosong judul="Ibu belum mengisi lembar pemantauan" teks="Kirim pengingat lewat WhatsApp agar ibu mengisi pemantauan mingguan/harian." />}
        </div>
      )}

      <Modal buka={catat} setBuka={setCatat} judul="Catat pemeriksaan" deskripsi={`${String(p.nama)} · ${tahapSingkat(r)}`} lebar="max-w-xl">
        {tempo && (
          <Link href={`/app/ibu/${r.ibu.id}/isi/${tempo.tabel}`} className="mb-4 flex items-center gap-3 rounded-2xl bg-brand p-4 text-white transition hover:bg-brand-ink">
            <CalendarClock className="size-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-white/85">{tempo.status === "terlambat" ? "Terlambat, isi bila sudah diperiksa" : "Jatuh tempo sekarang"}</span>
              <span className="block font-bold leading-snug">{tempo.nama}</span>
              <span className="block text-xs text-white/85">
                {tgl(tempo.mulai)} – {tgl(tempo.selesai)} · Buku KIA hlm. {tempo.halamanCetak}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0" />
          </Link>
        )}
        {formUtama.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{formUtama.map(tautanForm)}</div>}
        {formLain.length > 0 && (
          <>
            {(formUtama.length > 0 || tempo) && <p className="mb-2 mt-4 text-xs font-semibold text-muted">Form lain</p>}
            <div className="grid gap-2 sm:grid-cols-2">{formLain.map(tautanForm)}</div>
          </>
        )}
        {bolehOcr(u) && (
          <Link href={`/app/foto?ibu=${r.ibu.id}`} className="mt-4 flex items-center gap-3 border-t border-line pt-4 text-sm transition hover:text-brand">
            <Camera className="size-5 shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Isi dari foto Buku KIA</span>
              <span className="block text-xs text-muted">Foto halamannya, isian dibaca otomatis lalu Anda cek.</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted" />
          </Link>
        )}
      </Modal>

      {tab === "identitas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Kartu>
            <JudulBagian aksi={bolehIsi(u, "ibu") ? <Link href={`/app/ibu/${r.ibu.id}/isi/ibu`} className="text-sm font-semibold text-brand">Ubah</Link> : null}>Identitas ibu</JudulBagian>
            {Object.entries(kamus.tabel.ibu.kolom)
              .filter(([k]) => k !== "nik" && k !== "ibu_id" && p[k] !== undefined)
              .map(([k, kol]) => (
                <Baris key={k} label={kol.label}>
                  {kol.tipe === "date" ? tampil(p[k]) : String(p[k])}
                </Baris>
              ))}
            <Baris label="NIK (disamarkan)">{r.ibu.nikSamaran}</Baris>
          </Kartu>
          <Kartu>
            <JudulBagian>Suami / keluarga</JudulBagian>
            {Object.entries(kamus.tabel.keluarga.kolom)
              .filter(([k]) => r.ibu.keluarga[k] !== undefined && k !== "nik_pendamping")
              .map(([k, kol]) => (
                <Baris key={k} label={kol.label}>
                  {kol.tipe === "date" ? tampil(r.ibu.keluarga[k]) : String(r.ibu.keluarga[k])}
                </Baris>
              ))}
            <div className="mt-4 rounded-xl bg-hijau-soft/60 p-3 text-xs text-ink/80">
              Persetujuan ibu: {tampil(r.ibu.persetujuan.tanggal)} · teks {r.ibu.persetujuan.versi}
            </div>
          </Kartu>
        </div>
      )}
    </div>
  );
}

/** Satu angka di ringkasan klinis; nilai di luar batas diberi warna dan keterangan. */
function Butir({ k }: { k: ButirKlinis }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted">{k.label}</dt>
      <dd className={cn("mt-0.5 text-lg font-extrabold leading-tight tracking-tight", k.nada && k.nada !== "hijau" && NADA[k.nada])}>
        {k.nilai}
        {k.satuan && <span className="ml-1 text-xs font-semibold text-muted">{k.satuan}</span>}
      </dd>
      {k.ket && <dd className="mt-0.5 truncate text-xs text-muted">{k.ket}</dd>}
    </div>
  );
}
