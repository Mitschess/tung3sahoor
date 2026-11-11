/**
 * Data demo. SEMUA NAMA, NIK, DAN NOMOR TELEPON DI SINI PALSU.
 * Tanggal dibuat relatif terhadap hari ini supaya tahap tiap ibu selalu masuk akal saat demo.
 */
import type { Catatan, Data, Ibu, Pengguna, StatusPeringatan } from "./types";
import { iso, tambahHari } from "./tanggal";

export const POSYANDU = ["Melati", "Mawar", "Anggrek"];
export const PUSKESMAS = "Puskesmas Sukamaju";
export const VERSI_PERSETUJUAN = "v1-2026-11";

export const PENGGUNA_DEMO: Pengguna[] = [
  { id: "u_ibu_siti", nama: "Siti Aminah", peran: "ibu", ibuId: "i_siti", keterangan: "Hamil trimester 3" },
  { id: "u_ibu_dewi", nama: "Dewi Puspita", peran: "ibu", ibuId: "i_dewi", keterangan: "Nifas + bayi baru lahir" },
  { id: "u_kader", nama: "Rina Marlina", peran: "kader", posyandu: ["Melati"], keterangan: "Kader Posyandu Melati" },
  { id: "u_bidan", nama: "Bidan Lestari Wulandari", peran: "bidan", posyandu: ["Melati", "Mawar"], keterangan: "Bidan desa, wilayah Melati & Mawar" },
  { id: "u_dokter", nama: "dr. Andi Pratama", peran: "dokter", keterangan: `Dokter ${PUSKESMAS}` },
];

interface Seed {
  ibu: Ibu[];
  catatan: Catatan[];
  status: Record<string, StatusPeringatan>;
}

export function buatSeed(now: Date): Seed {
  const H = (n: number) => iso(tambahHari(now, n));
  const ibu: Ibu[] = [];
  const catatan: Catatan[] = [];
  let seq = 0;

  const rec = (ibuId: string, tabel: string, data: Data, oleh = "u_bidan", tanggal?: string, sumber: Catatan["meta"]["sumber"] = "Ketik manual"): Catatan => {
    const t = tanggal ?? (data.tanggal as string) ?? (data.tanggal_jam as string) ?? H(0);
    const c: Catatan = {
      id: `c${String(++seq).padStart(3, "0")}`,
      tabel,
      ibuId,
      data,
      meta: {
        dibuat_oleh: oleh,
        dibuat_pada: `${t.slice(0, 10)}T09:00:00.000Z`,
        sumber,
        ...(sumber === "foto (OCR)"
          ? { foto_id: `foto_demo_${seq}`, dikonfirmasi_oleh: "u_kader", dikonfirmasi_pada: `${t.slice(0, 10)}T10:15:00.000Z`, ocr_yakin: { td_sistolik: 0.93, td_diastolik: 0.91, bb_kg: 0.97, protein_urine: 0.78 } }
          : {}),
      },
    };
    catatan.push(c);
    return c;
  };

  const tambahIbu = (id: string, profil: Data, keluarga: Data, nikAkhir: string) => {
    ibu.push({
      id,
      profil: { ibu_id: id, faskes_tk1: PUSKESMAS, puskesmas_domisili: PUSKESMAS, faskes_rujukan: "RSUD Kota (contoh)", ...profil, persetujuan_tanggal: H(-60) },
      keluarga,
      nikHash: `demo-${id}`,
      nikSamaran: `••••••••••••${nikAkhir}`,
      persetujuan: { tanggal: H(-60), versi: VERSI_PERSETUJUAN, saksi: "u_kader" },
    });
  };

  /** HPHT untuk usia kehamilan tertentu hari ini. */
  const hphtUntuk = (minggu: number, hari = 0) => tambahHari(now, -(minggu * 7 + hari));
  const tglPadaMinggu = (hpht: Date, minggu: number) => iso(tambahHari(hpht, minggu * 7));

  // 1) Siti Aminah: T3 34 minggu, TD tinggi + pusing berat → MERAH
  {
    const id = "i_siti";
    const hpht = hphtUntuk(34, 2);
    tambahIbu(id, { nama: "Siti Aminah", tempat_lahir: "Bandung", tanggal_lahir: "1997-03-14", pendidikan: "SMA", pekerjaan: "Pedagang", alamat: "Jl. Kenanga No. 12", rt_rw: "03/05", wilayah_posyandu: "Melati", telepon: "081200000001", golongan_darah: "O", rhesus: "+", no_jkn: "000000000001" },
      { nama_pendamping: "Budi Santoso", hubungan: "Suami", pekerjaan_pendamping: "Buruh pabrik", telepon_pendamping: "081200000002", golongan_darah_pendamping: "O" }, "0001");
    rec(id, "riwayat", { kehamilan_id: "k_siti_2", gravida: 2, paritas: 1, abortus: 0, anak_hidup: 1, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 155, bb_prahamil_kg: 52, imt_prahamil: 21.6, jarak_kehamilan_tahun: 4, riwayat_penyakit: [] }, "u_bidan", tglPadaMinggu(hpht, 10));
    const k = [
      { ke: 1, m: 10, bb: 52.5, s: 110, d: 70, tfu: undefined, djj: undefined, hb: 11.8, extra: { tb_cm: 155, lila_cm: 24.5, golongan_darah: "O", tripel_hiv: "non-reaktif", tripel_sifilis: "non-reaktif", tripel_hepb: "non-reaktif", skrining_dokter: true, usg: true } },
      { ke: 2, m: 16, bb: 54, s: 112, d: 72, tfu: 16, djj: 148, hb: undefined, extra: {} },
      { ke: 3, m: 22, bb: 56.5, s: 115, d: 75, tfu: 21, djj: 145, hb: undefined, extra: {} },
      { ke: 4, m: 28, bb: 59.5, s: 120, d: 80, tfu: 27, djj: 142, hb: 11.2, extra: { protein_urine: "Negatif" } },
    ];
    for (const v of k) {
      rec(id, "anc", { kunjungan_ke: v.ke, tanggal: tglPadaMinggu(hpht, v.m), tempat: "Posyandu Melati / Bidan Lestari", usia_kehamilan_minggu: v.m, bb_kg: v.bb, td_sistolik: v.s, td_diastolik: v.d, tfu_cm: v.tfu, djj: v.djj, letak_janin: v.m >= 28 ? "Kepala" : "belum dapat ditentukan", hb: v.hb, konseling: true, ttd_mms: true, status_imunisasi_td: "T4", ...v.extra });
    }
    rec(id, "anc", { kunjungan_ke: 5, tanggal: H(-2), tempat: "Posyandu Melati / Bidan Lestari", usia_kehamilan_minggu: 34, bb_kg: 62, td_sistolik: 145, td_diastolik: 95, tfu_cm: 31, djj: 140, letak_janin: "Kepala", protein_urine: "+1", konseling: true, ttd_mms: true, catatan: "Kaki bengkak, mengeluh pusing. Disarankan istirahat dan kontrol ulang.", tanggal_kembali: H(2) }, "u_kader", H(-2), "foto (OCR)");
    rec(id, "dokter_t1", { nama_dokter: "u_dokter", tanggal: tglPadaMinggu(hpht, 10), faskes: PUSKESMAS, bb_kg: 52.5, tb_cm: 155, lila_cm: 24.5, imt_kategori: "normal", pf_konjungtiva: "tidak anemia", pf_sklera: "tidak ikterik", usg_uk: 10, usg_jumlah_gs: "Tunggal", kesimpulan: "Kehamilan normal", rekomendasi: "ANC di FKTP" }, "u_dokter");
    rec(id, "lab_t1", { tanggal: tglPadaMinggu(hpht, 10), hb: 11.8, golongan_darah_rhesus: "O+", gds: 96, tripel_hiv: "non-reaktif", tripel_sifilis: "non-reaktif", tripel_hepb: "non-reaktif", skrining_jiwa_tanggal: tglPadaMinggu(hpht, 10), skrining_jiwa_hasil: false });
    rec(id, "preeklamsia", { tanggal: tglPadaMinggu(hpht, 12), rs_umur_35: false, rs_nulipara: false, rs_jarak_10th: false, rs_obesitas: false, map: 83.3, proteinuria: false, kesimpulan: "Tidak memenuhi kriteria rujukan; lanjut ANC di FKTP" });
    rec(id, "dm", { tanggal: tglPadaMinggu(hpht, 26), gdp: 84, gd2pp: 128, dokter_pemeriksa: "u_dokter" }, "u_dokter");
    rec(id, "persiapan", { tanya_tanggal_persalinan: true, pendamping_siap: true, tabungan_persalinan: true, kartu_jkn: true, penolong_dipilih: true, dokumen_siap: false, donor_darah_siap: false, kendaraan_siap: false }, "u_ibu_siti", H(-10));
    for (let m = 29; m <= 34; m++) {
      rec(id, "pemantauan_hamil", { minggu_kehamilan: m, periksa_kehamilan: m === 34 || m === 28, kelas_ibu_hamil: m === 30, pusing_berat: m === 34, sulit_tidur_cemas: m === 33 }, "u_ibu_siti", iso(tambahHari(hpht, m * 7 + 1)));
    }
  }

  // 2) Dewi Puspita: nifas hari ke-5, bayi umur 4 hari → KUNING (payudara, tali pusat)
  {
    const id = "i_dewi";
    const lahir = tambahHari(now, -4);
    lahir.setHours(8, 30, 0, 0);
    const hpht = tambahHari(lahir, -(39 * 7 + 2));
    tambahIbu(id, { nama: "Dewi Puspita", tempat_lahir: "Garut", tanggal_lahir: "2000-08-02", pendidikan: "S1", pekerjaan: "Guru honorer", alamat: "Gg. Mawar Merah No. 4", rt_rw: "01/05", wilayah_posyandu: "Melati", telepon: "081200000003", golongan_darah: "A", rhesus: "+" },
      { nama_pendamping: "Rizki Hidayat", hubungan: "Suami", telepon_pendamping: "081200000004", golongan_darah_pendamping: "A" }, "0003");
    rec(id, "riwayat", { kehamilan_id: "k_dewi_1", gravida: 1, paritas: 0, abortus: 0, anak_hidup: 0, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 160, bb_prahamil_kg: 50, imt_prahamil: 19.5, riwayat_penyakit: [] }, "u_bidan", iso(tambahHari(hpht, 70)));
    [9, 16, 22, 29, 34, 38].forEach((m, i) =>
      rec(id, "anc", { kunjungan_ke: i + 1, tanggal: iso(tambahHari(hpht, m * 7)), tempat: "Bidan Lestari", usia_kehamilan_minggu: m, bb_kg: 50 + m * 0.33, td_sistolik: 110, td_diastolik: 70, djj: m > 12 ? 144 : undefined, konseling: true, ttd_mms: true }));
    rec(id, "persalinan", { tanggal_jam: lahir.toISOString(), usia_kehamilan_minggu: 39, penolong: "bidan", cara: "Normal", keadaan_ibu: "Sehat", kb_pasca: "Belum memilih" }, "u_bidan", iso(lahir));
    rec(id, "bayi_lahir", { anak_id: "a_arka", anak_ke: 1, nama_anak: "Arka Hidayat", jenis_kelamin: "Laki-laki", jenis_kelahiran: "Tunggal", berat_lahir_g: 3100, panjang_cm: 49, lingkar_kepala_cm: 34, kondisi_lahir: ["Segera menangis", "seluruh tubuh kemerahan"], imd: true, vit_k1: true, salep_mata: true, hb0: true }, "u_bidan", iso(lahir));
    rec(id, "imunisasi", { vaksin: "HB0", tanggal: iso(lahir), no_batch: "DEMO-HB0-01" }, "u_bidan", iso(lahir));
    rec(id, "kn", { kn_ke: "KN1", tanggal_jam: new Date(lahir.getTime() + 20 * 3600_000).toISOString(), tempat: "Puskesmas Sukamaju", bb_g: 3050, pb_cm: 49, lk_cm: 34, menyusu: true, tali_pusat: "Baik", tanda_bahaya: false, kuning: false, vit_k1: true, salep_mata: true, hb0: true, pjb_kritis: true }, "u_bidan", iso(tambahHari(lahir, 1)));
    rec(id, "kf", { kf_ke: 1, tanggal: iso(tambahHari(lahir, 1)), tempat: "Puskesmas Sukamaju", kondisi_umum: true, td_sistolik: 118, td_diastolik: 76, suhu_c: 36.8, nadi: 84, napas: 18, lokhia_perdarahan: "Normal", jalan_lahir: "Normal", kontraksi_tfu: "Normal", payudara_asi: "Normal", vit_a: true, konseling: true }, "u_bidan", iso(tambahHari(lahir, 1)));
    for (let h = 1; h <= 4; h++) {
      rec(id, "pemantauan_nifas", { hari_ke: h, periksa_nifas: h === 2, vit_a: h <= 2, ttd: true, gizi_cukup: true, payudara_bermasalah: h === 4 }, "u_ibu_dewi", iso(tambahHari(lahir, h - 1)));
      rec(id, "pemantauan_bayi", { hari_ke: h, tali_pusat_infeksi: h === 4 }, "u_ibu_dewi", iso(tambahHari(lahir, h - 1)));
    }
  }

  // 3) Rahma Yuliani: T1 9 minggu, umur 37 + nulipara + obesitas → preeklamsia MERAH
  {
    const id = "i_rahma";
    const hpht = hphtUntuk(9, 3);
    tambahIbu(id, { nama: "Rahma Yuliani", tempat_lahir: "Cianjur", tanggal_lahir: "1989-05-21", pendidikan: "SMP", pekerjaan: "Ibu rumah tangga", alamat: "Kp. Babakan RT 02", rt_rw: "02/06", wilayah_posyandu: "Melati", telepon: "081200000005", golongan_darah: "belum tahu", rhesus: "belum tahu" },
      { nama_pendamping: "Asep Saepudin", hubungan: "Suami", telepon_pendamping: "081200000006" }, "0005");
    rec(id, "riwayat", { kehamilan_id: "k_rahma_1", gravida: 1, paritas: 0, abortus: 0, anak_hidup: 0, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 150, bb_prahamil_kg: 68, imt_prahamil: 30.2, riwayat_penyakit: [] }, "u_kader", H(-9));
    rec(id, "anc", { kunjungan_ke: 1, tanggal: H(-9), tempat: "Posyandu Melati", usia_kehamilan_minggu: 8, bb_kg: 68.5, tb_cm: 150, lila_cm: 27, td_sistolik: 128, td_diastolik: 84, hb: 10.4, golongan_darah: "B", konseling: true, ttd_mms: true, tanggal_kembali: H(19) });
    rec(id, "lab_t1", { tanggal: H(-9), hb: 10.4, golongan_darah_rhesus: "B+", gds: 110, tripel_hiv: "non-reaktif", tripel_sifilis: "non-reaktif", tripel_hepb: "non-reaktif", skrining_jiwa_tanggal: H(-9), skrining_jiwa_hasil: true, skrining_jiwa_tindak_lanjut: "konseling", skrining_jiwa_rujuk: false });
    rec(id, "preeklamsia", { tanggal: H(-9), rs_umur_35: true, rs_nulipara: true, rs_jarak_10th: false, rs_obesitas: true, map: 98.7, proteinuria: false, kesimpulan: "Rujuk: rujukan terencana ke RS; ANC, persalinan, dan nifas di RS" });
    rec(id, "rujukan", { rujukan_id: "rj_rahma_1", resume_fktp: "G1P0A0 hamil 8 minggu, umur 37 th, IMT 30,2, MAP 98,7. Skrining preeklamsia: risiko tinggi.", tanggal_rujuk: H(-9), tujuan: "Poli Kebidanan RSUD Kota (contoh)" }, "u_dokter", H(-9));
    rec(id, "pemantauan_hamil", { minggu_kehamilan: 9, sulit_tidur_cemas: true }, "u_kader", H(-1));
  }

  // 4) Nur Halimah: T2 22 minggu (Mawar), K2 + skrining preeklamsia terlewat → KUNING
  {
    const id = "i_nur";
    const hpht = hphtUntuk(22, 1);
    tambahIbu(id, { nama: "Nur Halimah", tempat_lahir: "Sumedang", tanggal_lahir: "1999-11-30", pendidikan: "SMA", pekerjaan: "Karyawan toko", alamat: "Jl. Pahlawan No. 77", rt_rw: "04/02", wilayah_posyandu: "Mawar", telepon: "081200000007", golongan_darah: "B", rhesus: "+" },
      { nama_pendamping: "Hendra Gunawan", hubungan: "Suami", telepon_pendamping: "081200000008" }, "0007");
    rec(id, "riwayat", { kehamilan_id: "k_nur_2", gravida: 2, paritas: 1, abortus: 0, anak_hidup: 1, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 158, bb_prahamil_kg: 49, imt_prahamil: 19.6, jarak_kehamilan_tahun: 3, riwayat_penyakit: [] }, "u_bidan", tglPadaMinggu(hpht, 11));
    rec(id, "anc", { kunjungan_ke: 1, tanggal: tglPadaMinggu(hpht, 11), tempat: "Posyandu Mawar", usia_kehamilan_minggu: 11, bb_kg: 49.5, tb_cm: 158, lila_cm: 24, td_sistolik: 108, td_diastolik: 68, hb: 11.5, konseling: true, ttd_mms: true, tanggal_kembali: tglPadaMinggu(hpht, 15) });
    rec(id, "dokter_t1", { nama_dokter: "u_dokter", tanggal: tglPadaMinggu(hpht, 11), faskes: PUSKESMAS, lila_cm: 24, imt_kategori: "normal", usg_uk: 11, usg_jumlah_gs: "Tunggal", kesimpulan: "Kehamilan normal", rekomendasi: "ANC di FKTP" }, "u_dokter");
  }

  // 5) Ayu Kartika: T2 18 minggu, semua sesuai jadwal → HIJAU
  {
    const id = "i_ayu";
    const hpht = hphtUntuk(18, 0);
    tambahIbu(id, { nama: "Ayu Kartika", tempat_lahir: "Bogor", tanggal_lahir: "1995-01-09", pendidikan: "D3", pekerjaan: "Penjahit", alamat: "Jl. Flamboyan No. 3", rt_rw: "05/05", wilayah_posyandu: "Melati", telepon: "081200000009", golongan_darah: "AB", rhesus: "+" },
      { nama_pendamping: "Dimas Prakoso", hubungan: "Suami", telepon_pendamping: "081200000010" }, "0009");
    rec(id, "riwayat", { kehamilan_id: "k_ayu_2", gravida: 2, paritas: 1, abortus: 0, anak_hidup: 1, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 156, bb_prahamil_kg: 50, imt_prahamil: 20.5, jarak_kehamilan_tahun: 3, riwayat_penyakit: [] }, "u_bidan", tglPadaMinggu(hpht, 9));
    rec(id, "anc", { kunjungan_ke: 1, tanggal: tglPadaMinggu(hpht, 9), tempat: "Bidan Lestari", usia_kehamilan_minggu: 9, bb_kg: 50.4, tb_cm: 156, lila_cm: 25, td_sistolik: 110, td_diastolik: 70, hb: 12.1, konseling: true, ttd_mms: true, tripel_hiv: "non-reaktif", tripel_sifilis: "non-reaktif", tripel_hepb: "non-reaktif" });
    rec(id, "anc", { kunjungan_ke: 2, tanggal: tglPadaMinggu(hpht, 16), tempat: "Posyandu Melati", usia_kehamilan_minggu: 16, bb_kg: 52.2, td_sistolik: 112, td_diastolik: 72, tfu_cm: 16, djj: 150, konseling: true, ttd_mms: true, tanggal_kembali: H(14) });
    rec(id, "dokter_t1", { nama_dokter: "u_dokter", tanggal: tglPadaMinggu(hpht, 9), faskes: PUSKESMAS, lila_cm: 25, imt_kategori: "normal", usg_uk: 9, usg_jumlah_gs: "Tunggal", kesimpulan: "Kehamilan normal", rekomendasi: "ANC di FKTP" }, "u_dokter");
    rec(id, "preeklamsia", { tanggal: tglPadaMinggu(hpht, 12), rs_umur_35: false, rs_nulipara: false, rs_jarak_10th: false, rs_obesitas: false, map: 83.3, proteinuria: false, kesimpulan: "Tidak memenuhi kriteria rujukan; lanjut ANC di FKTP" });
    rec(id, "pemantauan_hamil", { minggu_kehamilan: 17, periksa_kehamilan: false }, "u_kader", H(-6));
    rec(id, "pemantauan_hamil", { minggu_kehamilan: 18, periksa_kehamilan: false, kelas_ibu_hamil: true }, "u_kader", H(0));
  }

  // 6) Fitri Handayani: T3 37 minggu (Mawar), gerak bayi berkurang → MERAH; LiLA < 23,5 → KUNING
  {
    const id = "i_fitri";
    const hpht = hphtUntuk(37, 2);
    tambahIbu(id, { nama: "Fitri Handayani", tempat_lahir: "Tasikmalaya", tanggal_lahir: "2003-06-17", pendidikan: "SMA", pekerjaan: "Ibu rumah tangga", alamat: "Kp. Cibeber No. 9", rt_rw: "02/03", wilayah_posyandu: "Mawar", telepon: "081200000011", golongan_darah: "A", rhesus: "+" },
      { nama_pendamping: "Ujang Supriatna", hubungan: "Suami", telepon_pendamping: "081200000012" }, "0011");
    rec(id, "riwayat", { kehamilan_id: "k_fitri_1", gravida: 1, paritas: 0, abortus: 0, anak_hidup: 0, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 152, bb_prahamil_kg: 44, imt_prahamil: 19, riwayat_penyakit: [] }, "u_bidan", tglPadaMinggu(hpht, 10));
    [10, 17, 23, 29, 34].forEach((m, i) =>
      rec(id, "anc", { kunjungan_ke: i + 1, tanggal: tglPadaMinggu(hpht, m), tempat: "Posyandu Mawar", usia_kehamilan_minggu: m, bb_kg: Math.round((44 + (m <= 13 ? 1 : 1 + (m - 13) * 0.47)) * 10) / 10, lila_cm: 22.8, td_sistolik: 105, td_diastolik: 68, tfu_cm: m > 12 ? m - 2 : undefined, djj: m > 12 ? 146 : undefined, konseling: true, ttd_mms: true }));
    rec(id, "dokter_t1", { nama_dokter: "u_dokter", tanggal: tglPadaMinggu(hpht, 10), faskes: PUSKESMAS, lila_cm: 22.8, imt_kategori: "normal", usg_uk: 10, usg_jumlah_gs: "Tunggal", kesimpulan: "Kehamilan normal", rekomendasi: "ANC di FKTP" }, "u_dokter");
    rec(id, "preeklamsia", { tanggal: tglPadaMinggu(hpht, 12), rs_umur_35: false, rs_nulipara: true, rs_jarak_10th: false, rs_obesitas: false, map: 80.3, proteinuria: false, kesimpulan: "Tidak memenuhi kriteria rujukan; lanjut ANC di FKTP" });
    rec(id, "dm", { tanggal: tglPadaMinggu(hpht, 26), gdp: 80, gd2pp: 120 }, "u_dokter");
    rec(id, "dokter_t3", { nama_dokter: "u_dokter", tanggal: tglPadaMinggu(hpht, 34), usg_t3_dilakukan: true, uk_hpht: 34, uk_biometri: 33, jumlah_bayi: "Tunggal", letak_bayi: "Intrauterin", presentasi: "Kepala", keadaan_bayi: "Hidup", djj: 146, lokasi_plasenta: "Fundus", lab_hb: 11.3, rencana_persalinan: "Normal", cairan_ketuban_kategori: "Cukup" }, "u_dokter");
    rec(id, "persiapan", { tanya_tanggal_persalinan: true, pendamping_siap: true, kartu_jkn: true, penolong_dipilih: true, donor_darah_siap: false, kendaraan_siap: true }, "u_bidan", H(-20));
    rec(id, "pemantauan_hamil", { minggu_kehamilan: 36 }, "u_bidan", H(-7));
    rec(id, "pemantauan_hamil", { minggu_kehamilan: 37, gerak_bayi_kurang: true, nyeri_perut_hebat: false }, "u_bidan", H(0));
  }

  // 7) Lina Marlina: Posyandu Anggrek, tidak terlihat oleh kader Melati / bidan Melati-Mawar
  {
    const id = "i_lina";
    const hpht = hphtUntuk(15, 4);
    tambahIbu(id, { nama: "Lina Marlina", tempat_lahir: "Bekasi", tanggal_lahir: "1998-02-02", pendidikan: "S1", pekerjaan: "Admin", alamat: "Perum Asri Blok C2", rt_rw: "07/08", wilayah_posyandu: "Anggrek", telepon: "081200000013", golongan_darah: "O", rhesus: "+" },
      { nama_pendamping: "Yusuf Maulana", hubungan: "Suami", telepon_pendamping: "081200000014" }, "0013");
    rec(id, "riwayat", { kehamilan_id: "k_lina_1", gravida: 1, paritas: 0, abortus: 0, anak_hidup: 0, hpht: iso(hpht), haid_teratur: true, hpl_hpht: iso(tambahHari(hpht, 280)), tb_cm: 162, bb_prahamil_kg: 56, imt_prahamil: 21.3, riwayat_penyakit: [] }, "u_bidan", tglPadaMinggu(hpht, 8));
    rec(id, "anc", { kunjungan_ke: 1, tanggal: tglPadaMinggu(hpht, 8), tempat: "Posyandu Anggrek", usia_kehamilan_minggu: 8, bb_kg: 56.5, tb_cm: 162, lila_cm: 26, td_sistolik: 112, td_diastolik: 74, hb: 12.4, konseling: true, ttd_mms: true });
    rec(id, "dokter_t1", { nama_dokter: "u_dokter", tanggal: tglPadaMinggu(hpht, 8), faskes: PUSKESMAS, usg_uk: 8, usg_jumlah_gs: "Tunggal", kesimpulan: "Kehamilan normal", rekomendasi: "ANC di FKTP" }, "u_dokter");
    rec(id, "preeklamsia", { tanggal: tglPadaMinggu(hpht, 8), rs_umur_35: false, rs_nulipara: true, rs_obesitas: false, map: 86.7, proteinuria: false, kesimpulan: "Tidak memenuhi kriteria rujukan; lanjut ANC di FKTP" });
  }

  // Tindak lanjut kader yang sudah tercatat (contoh) untuk peringatan preeklamsia Rahma
  const pe = catatan.find((c) => c.ibuId === "i_rahma" && c.tabel === "preeklamsia");
  if (pe) {
    rec("i_rahma", "tindak_lanjut", { peringatan_id: `preeklamsia:${pe.id}`, tanggal: `${H(-8)}T10:00:00.000Z`, cara: "Kunjungan rumah", hasil: "dijadwalkan", catatan: "Ibu dan suami setuju ke RSUD, menunggu jadwal poli." }, "u_kader", H(-8));
  }

  return { ibu, catatan, status: {} };
}
