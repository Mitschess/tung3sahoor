"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { KamusForm } from "@/components/kamus-form";
import { KepalaHalaman } from "@/components/kepala";
import { Kartu, Kosong, Memuat, TautanBuku } from "@/components/ui";
import { bolehIsi } from "@/lib/akses";
import { useRingkasan } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { hitungMap, isiOtomatisPreeklamsia, nilaiPreeklamsia } from "@/lib/skrining";
import { usePengguna, useStore } from "@/lib/store";
import { imt, terakhir, ukPada } from "@/lib/tahap";
import { iso, parse, tambahHari } from "@/lib/tanggal";
import type { Data } from "@/lib/types";
import { uid } from "@/lib/util";

export default function HalamanIsi() {
  return (
    <Suspense fallback={<Memuat />}>
      <Isi />
    </Suspense>
  );
}

function Isi() {
  const { id, tabel } = useParams<{ id: string; tabel: string }>();
  const sp = useSearchParams();
  const ubahId = sp.get("ubah");
  const u = usePengguna();
  const r = useRingkasan(id);
  const router = useRouter();
  const simpan = useStore((s) => s.simpan);
  const ubahProfil = useStore((s) => s.ubahProfil);
  const [memuat, setMemuat] = useState(false);
  const def = kamus.tabel[tabel];

  if (!r || !u) return <Memuat />;
  if (!def) return <Kosong judul="Form tidak dikenal" />;
  if (!bolehIsi(u, tabel)) return <Kosong judul="Tidak diizinkan" teks={`Form "${def.judul}" diisi oleh ${def.diisi_oleh.toLowerCase()}.`} />;

  const lama = ubahId ? r.cari(tabel).find((c) => c.id === ubahId) : undefined;
  const hariIni = iso(new Date());
  const halamanCetak = def.halaman_pdf[0] ? (def.halaman_pdf[0] - 2) * 2 : undefined;

  // Nilai awal & isian otomatis per tabel
  let nilaiAwal: Data | undefined = lama?.data;
  let otomatis: Data | undefined;
  let kolom: string[] | undefined;
  if (tabel === "ibu") {
    nilaiAwal = r.ibu.profil;
    kolom = Object.keys(def.kolom).filter((k) => !["ibu_id", "nik"].includes(k));
  } else if (tabel === "keluarga") {
    nilaiAwal = r.ibu.keluarga;
  } else if (!lama) {
    const n = r.cari(tabel).length;
    if (tabel === "anc") nilaiAwal = { kunjungan_ke: Math.min(6, n + 1), tanggal: hariIni };
    if (tabel === "kf") nilaiAwal = { kf_ke: Math.min(4, n + 1), tanggal: hariIni };
    if (tabel === "kn") nilaiAwal = { kn_ke: ["KN1", "KN2", "KN3"][Math.min(2, r.cari("kn").filter((k) => k.data.kn_ke !== "0–6 jam").length)], tanggal_jam: new Date().toISOString() };
    if (["lab_t1", "preeklamsia", "dm", "dokter_t1", "dokter_t3", "imunisasi"].includes(tabel)) nilaiAwal = { tanggal: hariIni };
    if (tabel === "rujukan") nilaiAwal = { tanggal_rujuk: hariIni };
    if (tabel === "persalinan") nilaiAwal = { tanggal_jam: new Date().toISOString(), usia_kehamilan_minggu: r.tahap.ukMinggu };
    if (tabel === "riwayat" && terakhir(r.cari, "riwayat")) nilaiAwal = terakhir(r.cari, "riwayat")!.data;
    if (["persiapan", "amanat"].includes(tabel) && terakhir(r.cari, tabel)) nilaiAwal = terakhir(r.cari, tabel)!.data;
  }
  if (tabel === "preeklamsia") {
    otomatis = isiOtomatisPreeklamsia(r.ibu, r.cari, String(nilaiAwal?.tanggal ?? hariIni));
    kolom = Object.keys(def.kolom).filter((k) => k !== "kesimpulan");
  }
  if (tabel === "dokter_t3" && r.tahap.ukMinggu) otomatis = { uk_hpht: r.tahap.ukMinggu };

  // Catatan tunggal per kehamilan: perbarui catatan lama
  const tunggal = ["riwayat", "persiapan", "amanat"].includes(tabel) ? terakhir(r.cari, tabel) : undefined;
  const targetUbah = lama ?? tunggal;

  const lengkapi = (d: Data): Data => {
    const out = { ...d };
    if (tabel === "anc" && out.tanggal) out.usia_kehamilan_minggu = ukPada(r.tahap.hpl, parse(out.tanggal) ?? new Date());
    if (tabel === "riwayat") {
      const hpht = parse(out.hpht);
      if (hpht) out.hpl_hpht = iso(tambahHari(hpht, 280));
      out.imt_prahamil = imt(Number(out.bb_prahamil_kg), Number(out.tb_cm));
      out.kehamilan_id ??= uid("k");
    }
    if (tabel === "preeklamsia") {
      const anc = r.cari("anc").find((a) => a.data.td_sistolik);
      if ((out.map === undefined || out.map === null) && anc) out.map = hitungMap(Number(anc.data.td_sistolik), Number(anc.data.td_diastolik));
      out.kesimpulan = nilaiPreeklamsia(out).kesimpulan;
    }
    if (tabel === "dokter_t1" || tabel === "dokter_t3") out.nama_dokter = u.id;
    if (tabel === "dm") out.dokter_pemeriksa = u.id;
    if (tabel === "rujukan") out.rujukan_id ??= uid("rj");
    if (tabel === "bayi_lahir") out.anak_id ??= uid("a");
    return out;
  };

  const onSimpan = async (d: Data) => {
    setMemuat(true);
    try {
      if (tabel === "ibu") ubahProfil(r.ibu.id, d, {});
      else if (tabel === "keluarga") ubahProfil(r.ibu.id, {}, d);
      else {
        const data = lengkapi(d);
        simpan(tabel, r.ibu.id, data, targetUbah ? { catatanId: targetUbah.id } : {});
        if (tabel === "preeklamsia" && nilaiPreeklamsia(data).rujuk) toast.warning("Skrining preeklamsia: memenuhi kriteria rujukan → peringatan Merah dibuat");
        if (tabel === "persalinan" && !targetUbah) toast.info("Tahap ibu berpindah ke nifas; jadwal KF dan KN dimulai.");
      }
      toast.success(`${def.judul} tersimpan`);
      router.push(`/app/ibu/${r.ibu.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <KepalaHalaman judul={def.judul} sub={`${String(r.ibu.profil.nama)} · ${r.tahap.label} · diisi oleh ${def.diisi_oleh.toLowerCase()}`} kembali={`/app/ibu/${r.ibu.id}`} />
      <p className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-muted">
        <span>{targetUbah ? "Perubahan dicatat di riwayat." : "Salin sesuai yang tertulis di Buku KIA."}</span>
        {halamanCetak && halamanCetak > 0 && <TautanBuku halaman={halamanCetak} />}
      </p>
      {tabel === "preeklamsia" && <PratinjauPreeklamsia />}
      <Kartu>
        <KamusForm tabel={tabel} nilaiAwal={nilaiAwal} otomatis={otomatis} kolom={kolom} onSimpan={onSimpan} onBatal={() => router.back()} memuat={memuat} labelSimpan={targetUbah ? "Simpan perubahan" : "Simpan"} />
      </Kartu>
    </div>
  );
}

function PratinjauPreeklamsia() {
  return (
    <p className="mb-4 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
      Aturan hlm. 102: <b className="text-ink">≥ 2 risiko sedang atau ≥ 1 risiko tinggi</b> (termasuk MAP &gt; 90 mmHg dan proteinuria) → rujukan terencana ke RS. Isian bertanda <i>otomatis</i> diambil dari umur ibu, paritas, IMT, jarak kehamilan, USG T1, dan TD pertama.
    </p>
  );
}
