/** Pengaturan tampilan form di atas kamus data: kolom wajib, kolom yang disembunyikan, dan pengelompokan. */

export const WAJIB: Record<string, string[]> = {
  riwayat: ["hpht"],
  anc: ["kunjungan_ke", "tanggal"],
  dokter_t1: ["tanggal", "kesimpulan"],
  dokter_t3: ["tanggal"],
  lab_t1: ["tanggal"],
  preeklamsia: ["tanggal"],
  dm: ["tanggal"],
  persalinan: ["tanggal_jam", "keadaan_ibu"],
  bayi_lahir: ["berat_lahir_g", "jenis_kelamin"],
  kf: ["kf_ke", "tanggal"],
  kn: ["kn_ke", "tanggal_jam"],
  imunisasi: ["vaksin", "tanggal"],
  rujukan: ["tanggal_rujuk", "tujuan", "resume_fktp"],
  tindak_lanjut: ["cara", "hasil"],
  ibu: ["nama", "wilayah_posyandu", "persetujuan_tanggal"],
  kb: ["metode_dipilih"],
  tinja: ["tanggal", "nomor_warna"],
};

/** Kolom yang diisi sistem (ID, ref pengisi) sehingga tidak ditampilkan di form. */
export const DISEMBUNYIKAN = new Set([
  "ibu_id", "kehamilan_id", "anak_id", "rujukan_id", "paraf_kader", "nama_dokter", "dokter_pemeriksa",
  "kader_id", "peringatan_id", "diteruskan_ke", "minggu_kehamilan", "hari_ke", "usia_kehamilan_minggu",
  "hpl_hpht", "imt_prahamil",
]);

const TEKS_PANJANG = /catatan|resume|tata_laksana|anjuran|keterangan|rencana_tindak_lanjut|hasil_lain|kesimpulan_akhir|diagnosis|pf_keadaan_umum/;
export function teksPanjang(kolom: string): boolean {
  return TEKS_PANJANG.test(kolom);
}

const GRUP: [RegExp, string][] = [
  [/^pf_|^inspekulo|^pemeriksaan_fisik/, "Pemeriksaan fisik"],
  [/^usg|^uk_|^jumlah_bayi|^letak_bayi|^presentasi|^keadaan_bayi|^lokasi_plasenta|^cairan_ketuban|^biometri|^djj$/, "USG & janin"],
  [/^rs_/, "Risiko sedang"],
  [/^rt_/, "Risiko tinggi"],
  [/^map$|^proteinuria|^kesimpulan$/, "Hasil"],
  [/^tripel_/, "Tripel eliminasi (sensitif)"],
  [/^skrining_jiwa/, "Skrining kesehatan jiwa (sensitif)"],
  [/^lab_|^hb$|^golongan_darah|^protein_urine|^gula_darah|^gds$/, "Laboratorium"],
  [/^riwayat_penyakit|^perilaku|^status_imunisasi|^imunisasi_lain/, "Riwayat & imunisasi"],
  [/^rencana_|^kebutuhan_konseling/, "Rencana"],
];

export function grupKolom(tabel: string, kolom: string): string {
  if (!["dokter_t1", "dokter_t3", "preeklamsia", "anc", "lab_t1"].includes(tabel)) return "";
  for (const [re, nama] of GRUP) if (re.test(kolom)) return nama;
  return "Umum";
}
