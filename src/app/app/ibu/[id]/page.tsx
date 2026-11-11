"use client";

import { Camera, ClipboardPlus, Lock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { GrafikBB, GrafikTfuDjj } from "@/components/grafik";
import { DaftarPeringatan } from "@/components/peringatan";
import { RiwayatTabel } from "@/components/riwayat";
import { DaftarJadwal, KartuTahap } from "@/components/tahap";
import { TombolWa } from "@/components/tombol-wa";
import { Baris, JudulBagian, Kartu, Kosong, LABEL_LEVEL, Lencana, Memuat, Tab, TautanTombol } from "@/components/ui";
import { bolehIsi, bolehLihatSensitif, bolehOcr } from "@/lib/akses";
import { useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { usePengguna } from "@/lib/store";
import { tampil, umurTahun } from "@/lib/tanggal";
import type { Catatan } from "@/lib/types";

const FORM_HAMIL = ["riwayat", "anc", "lab_t1", "preeklamsia", "dm", "dokter_t1", "dokter_t3", "rujukan", "persiapan", "amanat", "persalinan", "bayi_lahir"];
const FORM_NIFAS = ["kf", "kn", "imunisasi", "bayi_lahir", "persalinan", "riwayat_persalinan", "rujukan", "tinja"];
const TABEL_PERIKSA = ["riwayat", "anc", "dokter_t1", "lab_t1", "preeklamsia", "dm", "dokter_t3", "rujukan", "persalinan", "bayi_lahir", "imunisasi", "kf", "kn", "amanat", "persiapan", "kb"];
const TABEL_PANTAU = ["pemantauan_hamil", "pemantauan_nifas", "pemantauan_bayi", "tinja", "tindak_lanjut"];

type TabNama = "ringkasan" | "periksa" | "pantau" | "identitas";

export default function DetailIbu() {
  const { id } = useParams<{ id: string }>();
  const u = usePengguna();
  const r = useRingkasan(id);
  const [tab, setTab] = useState<TabNama>("ringkasan");
  if (!r) return <Kosong judul="Ibu tidak ditemukan atau di luar wilayah Anda" teks="Kader hanya bisa melihat ibu di wilayah posyandunya." />;
  if (!u) return <Memuat />;

  const p = r.ibu.profil;
  const daftarForm = (r.tahap.set === "nifas" ? FORM_NIFAS : FORM_HAMIL).filter((t) => bolehIsi(u, t));
  const hrefUbah = (c: Catatan) => (bolehIsi(u, c.tabel) && !c.tabel.startsWith("pemantauan") ? `/app/ibu/${r.ibu.id}/isi/${c.tabel}?ubah=${c.id}` : null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{String(p.nama)}</h1>
            <Lencana warna={r.warna}>{LABEL_LEVEL[r.warna]}</Lencana>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{umurTahun(p.tanggal_lahir) ?? "–"} th</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> Posyandu {String(p.wilayah_posyandu)}, RT/RW {String(p.rt_rw ?? "–")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3.5" /> {String(p.telepon ?? "–")}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TombolWa r={r} ke="ibu" />
          <TombolWa r={r} ke="pendamping" />
          {bolehOcr(u) && (
            <TautanTombol href={`/app/foto?ibu=${r.ibu.id}`} kecil>
              <Camera className="size-4" /> Foto Buku KIA
            </TautanTombol>
          )}
        </div>
      </div>

      <Tab
        nilai={tab}
        setNilai={setTab}
        pilihan={[
          { nilai: "ringkasan", label: `Ringkasan${r.peringatan.length ? ` · ${r.peringatan.length}` : ""}` },
          { nilai: "periksa", label: "Pemeriksaan" },
          { nilai: "pantau", label: "Pemantauan ibu" },
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
            {daftarForm.length > 0 && (
              <section>
                <JudulBagian>Isi / input manual</JudulBagian>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {daftarForm.map((t) => (
                    <Link key={t} href={`/app/ibu/${r.ibu.id}/isi/${t}`} className="flex items-start gap-2 rounded-2xl border border-line bg-surface p-3 text-sm font-semibold hover:border-brand/40 hover:bg-brand-soft/40">
                      <ClipboardPlus className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span className="leading-snug">{kamus.tabel[t].judul}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="space-y-6">
            <KartuTahap t={r.tahap} />
            {r.jadwal.length > 0 && (
              <section>
                <JudulBagian>Jadwal kunjungan</JudulBagian>
                <DaftarJadwal js={r.jadwal} />
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
            <Baris label="NIK (tersamar, disimpan sebagai hash)">{r.ibu.nikSamaran}</Baris>
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
