import type { Data, Ibu } from "./types";
import type { Pencari } from "./tahap";
import { imt, terakhir } from "./tahap";
import { umurTahun, parse } from "./tanggal";

export const LABEL_RISIKO: Record<string, string> = {
  rs_multipara_pasangan_baru: "Multipara dengan pasangan baru",
  rs_teknologi_reproduksi: "Kehamilan dengan teknologi reproduksi berbantu",
  rs_umur_35: "Umur ≥ 35 tahun",
  rs_nulipara: "Nulipara",
  rs_jarak_10th: "Jarak kehamilan > 10 tahun",
  rs_riwayat_keluarga: "Riwayat preeklamsia pada ibu/saudara perempuan",
  rs_obesitas: "Obesitas sebelum hamil (IMT > 30)",
  rt_riwayat_pe: "Riwayat preeklamsia sebelumnya",
  rt_kembar: "Kehamilan multipel",
  rt_diabetes: "Diabetes dalam kehamilan",
  rt_hipertensi_kronik: "Hipertensi kronik",
  rt_ginjal: "Penyakit ginjal",
  rt_autoimun: "Penyakit autoimun, SLE",
  rt_aps: "Anti phospholipid syndrome",
};

/**
 * Isian otomatis skrining preeklamsia (kamus: "otomatis": true) dari identitas,
 * riwayat kehamilan, dan pemeriksaan pertama. Nakes tetap bisa mengubahnya.
 */
export function isiOtomatisPreeklamsia(ibu: Ibu, cari: Pencari, tanggal?: string): Data {
  const r = terakhir(cari, "riwayat")?.data ?? {};
  const umur = umurTahun(ibu.profil.tanggal_lahir, parse(tanggal) ?? new Date());
  const paritas = r.paritas === undefined || r.paritas === null || r.paritas === "" ? undefined : Number(r.paritas);
  const jarak = r.jarak_kehamilan_tahun === undefined || r.jarak_kehamilan_tahun === "" ? undefined : Number(r.jarak_kehamilan_tahun);
  const nilaiImt = (r.imt_prahamil as number | undefined) ?? imt(Number(r.bb_prahamil_kg), Number(r.tb_cm));
  const penyakit = (r.riwayat_penyakit as string[] | undefined) ?? [];
  const dt1 = terakhir(cari, "dokter_t1")?.data;
  const anc = cari("anc").find((a) => a.data.td_sistolik && a.data.td_diastolik);
  const map = anc ? hitungMap(Number(anc.data.td_sistolik), Number(anc.data.td_diastolik)) : undefined;
  return {
    rs_umur_35: umur !== null ? umur >= 35 : undefined,
    rs_nulipara: paritas !== undefined ? paritas === 0 : undefined,
    rs_jarak_10th: jarak !== undefined && paritas !== undefined ? paritas > 0 && jarak > 10 : undefined,
    rs_obesitas: nilaiImt !== undefined ? nilaiImt > 30 : undefined,
    rt_kembar: dt1?.usg_jumlah_gs ? dt1.usg_jumlah_gs === "kembar" : undefined,
    rt_diabetes: penyakit.includes("diabetes") || undefined,
    rt_hipertensi_kronik: penyakit.includes("hipertensi") || undefined,
    rt_autoimun: penyakit.includes("autoimun") || undefined,
    map,
  };
}

export function hitungMap(sis: number, dia: number): number {
  return Math.round(((2 * dia + sis) / 3) * 10) / 10;
}

export interface HasilPreeklamsia {
  sedang: string[];
  tinggi: string[];
  rujuk: boolean;
  kesimpulan: string;
}

/** Aturan hlm. 102: ≥ 2 risiko sedang atau ≥ 1 risiko tinggi → rujukan terencana ke RS. */
export function nilaiPreeklamsia(d: Data): HasilPreeklamsia {
  const sedang = Object.keys(LABEL_RISIKO).filter((k) => k.startsWith("rs_") && d[k] === true).map((k) => LABEL_RISIKO[k]);
  const tinggi = Object.keys(LABEL_RISIKO).filter((k) => k.startsWith("rt_") && d[k] === true).map((k) => LABEL_RISIKO[k]);
  const map = d.map === undefined || d.map === null || d.map === "" ? undefined : Number(d.map);
  if (map !== undefined && map > 90) tinggi.push(`MAP ${map} mmHg (> 90)`);
  if (d.proteinuria === true) tinggi.push("Proteinuria");
  const rujuk = sedang.length >= 2 || tinggi.length >= 1;
  const kesimpulan = rujuk
    ? "Rujuk: rujukan terencana ke RS; ANC, persalinan, dan nifas di RS"
    : "Tidak memenuhi kriteria rujukan; lanjut ANC di FKTP";
  return { sedang, tinggi, rujuk, kesimpulan };
}
