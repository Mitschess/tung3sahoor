/**
 * Ringkasan edukasi per tahap. Setiap butir diringkas dari Buku KIA Kemenkes 2024 dan
 * menyertakan nomor halaman cetak; tombol "Baca lengkap" membuka halaman itu di PDF.
 * Isi medis tidak diubah; bila ragu, ikuti buku dan tenaga kesehatan.
 */
import type { KodeTahap } from "@/lib/tahap";

export interface Materi {
  slug: string;
  judul: string;
  tahap: (KodeTahap | "semua")[];
  kategori: "Tahap" | "Tanda bahaya" | "Kesehatan jiwa" | "Menyusui" | "Bayi" | "Persiapan";
  halaman: number;
  ringkas: string[];
}

export const MATERI: Materi[] = [
  {
    slug: "t1",
    judul: "Hamil 1–3 bulan (trimester 1)",
    tahap: ["T1"],
    kategori: "Tahap",
    halaman: 6,
    ringkas: [
      "Mual, muntah, dan mudah lelah itu wajar; masa ini rentan keguguran.",
      "Periksa ke dokter paling sedikit sekali, termasuk USG dan laboratorium lengkap.",
      "Makan porsi kecil tapi sering: 3 kali makan utama dan 2 kali selingan.",
      "Minum tablet tambah darah/multivitamin setiap hari selama hamil.",
      "Jangan minum obat yang tidak diresepkan dan hindari asap rokok.",
    ],
  },
  {
    slug: "t2",
    judul: "Hamil 4–6 bulan (trimester 2)",
    tahap: ["T2"],
    kategori: "Tahap",
    halaman: 16,
    ringkas: [
      "Keluhan awal kehamilan mulai berkurang; gerak bayi mulai terasa sekitar bulan ke-5.",
      "Periksa ke dokter atau bidan paling sedikit dua kali di trimester ini.",
      "Pantau gerak bayi dan kenali tanda bahaya trimester 2.",
      "Mulai rencanakan proses melahirkan bersama tenaga kesehatan.",
    ],
  },
  {
    slug: "t3",
    judul: "Hamil 7–9 bulan (trimester 3)",
    tahap: ["T3"],
    kategori: "Tahap",
    halaman: 19,
    ringkas: [
      "Mudah lelah, sering buang air kecil, dan kaki bengkak sering dialami.",
      "Periksa paling sedikit tiga kali; salah satunya oleh dokter dengan USG dan lab.",
      "Kenali tanda awal melahirkan dan tanda bahaya saat melahirkan.",
      "Diskusikan metode KB setelah melahirkan, IMD, dan perawatan bayi baru lahir.",
    ],
  },
  {
    slug: "persiapan",
    judul: "Persiapan melahirkan (P4K)",
    tahap: ["T2", "T3"],
    kategori: "Persiapan",
    halaman: 18,
    ringkas: [
      "Persiapan dimulai sejak trimester kedua, bukan menjelang hari-H.",
      "Siapkan pendamping, dana/kartu JKN, dokumen (KTP, KK), dan kendaraan.",
      "Siapkan lebih dari satu calon pendonor darah dengan golongan darah yang sama.",
      "Sepakati amanat persalinan dan tempel stiker P4K di depan rumah.",
    ],
  },
  {
    slug: "jiwa-hamil",
    judul: "Kesehatan jiwa ibu hamil",
    tahap: ["T1", "T2", "T3"],
    kategori: "Kesehatan jiwa",
    halaman: 14,
    ringkas: [
      "Mudah sedih, marah, cemas, atau stres bisa terjadi dan memengaruhi ibu serta bayi.",
      "Waspadai cemas berlebihan, gelisah, berdebar, lelah tapi sulit tidur.",
      "Tidur cukup, makan bergizi, dan minta suami/keluarga mendampingi.",
      "Periksakan masalah kesehatan jiwa ke Puskesmas; ini bagian dari pelayanan.",
    ],
  },
  {
    slug: "melahirkan",
    judul: "Tanda awal dan proses melahirkan",
    tahap: ["T3"],
    kategori: "Tahap",
    halaman: 21,
    ringkas: [
      "Tanda awal: mulas teratur yang makin sering dan lama, keluar lendir bercampur darah atau air ketuban.",
      "Melahirkan di Puskesmas, rumah sakit, atau klinik bersalin agar masalah cepat ditangani.",
      "Lakukan Inisiasi Menyusu Dini (IMD): kontak kulit ke kulit paling sedikit 1 jam.",
      "Ibu dan bayi dirawat paling sedikit 24 jam setelah melahirkan normal.",
    ],
  },
  {
    slug: "nifas",
    judul: "Setelah melahirkan (nifas)",
    tahap: ["nifas"],
    kategori: "Tahap",
    halaman: 26,
    ringkas: [
      "Kematian ibu tertinggi terjadi pada masa setelah melahirkan: tetap waspada.",
      "Periksa 4 kali: 6–48 jam, hari 3–7, hari 8–28, dan hari 29–42.",
      "Lanjutkan tablet tambah darah untuk mencegah anemia.",
      "Jangan membuang kolostrum dan jangan mengikat perut terlalu kencang.",
    ],
  },
  {
    slug: "baby-blues",
    judul: "Baby blues dan depresi setelah melahirkan",
    tahap: ["nifas"],
    kategori: "Kesehatan jiwa",
    halaman: 32,
    ringkas: [
      "Baby blues: perasaan naik-turun, mudah menangis, sulit tidur; memuncak dalam 2 minggu.",
      "Bila sedih berat ≥ 2 minggu, tidak bergairah, atau muncul pikiran melukai diri/bayi, segera ke nakes.",
      "Dukungan suami dan keluarga, bantuan mengasuh, dan diajak bicara sangat membantu.",
      "Konseling di Puskesmas tersedia; ini bukan kelemahan.",
    ],
  },
  {
    slug: "kb",
    judul: "KB setelah melahirkan",
    tahap: ["nifas", "T3"],
    kategori: "Tahap",
    halaman: 33,
    ringkas: [
      "KB pasca melahirkan dimulai sampai 42 hari setelah melahirkan.",
      "Pilih metode yang tidak mengganggu ASI dan sesuai kondisi ibu.",
      "Jarak kehamilan ideal paling sedikit 2 tahun.",
      "KB suntik 1 bulan tidak disarankan untuk ibu menyusui.",
    ],
  },
  {
    slug: "menyusui",
    judul: "Menyusui: posisi dan pelekatan",
    tahap: ["nifas", "T3"],
    kategori: "Menyusui",
    halaman: 34,
    ringkas: [
      "Beri ASI saja sampai 6 bulan, lanjutkan sampai 2 tahun.",
      "Susui sesering mungkin, 8–12 kali sehari; bangunkan bayi bila tidur > 3 jam.",
      "Kepala dan badan bayi segaris, dagu menempel payudara, bibir bawah dower.",
      "Bila payudara masih penuh, perah dan simpan ASI untuk mencegah mastitis.",
    ],
  },
  {
    slug: "asi-perah",
    judul: "Memerah dan menyimpan ASI",
    tahap: ["nifas"],
    kategori: "Menyusui",
    halaman: 36,
    ringkas: [
      "Suhu ruang (< 25 °C): 6–8 jam; kulkas (< 4 °C): 2–3 hari.",
      "Freezer 1 pintu: 2 minggu; freezer 2 pintu: 3–6 bulan.",
      "Simpan 15–60 ml per wadah dan beri label tanggal.",
      "Jangan rebus atau panaskan ASI di microwave.",
    ],
  },
  {
    slug: "bayi-baru-lahir",
    judul: "Bayi baru lahir (0–28 hari)",
    tahap: ["nifas"],
    kategori: "Bayi",
    halaman: 40,
    ringkas: [
      "Pastikan pemeriksaan bayi pada 0–6 jam, 6–48 jam, hari 3–7, dan hari 8–28.",
      "Imunisasi HB0 sebelum 24 jam; skrining hipotiroid (SHK) dan jantung bawaan (PJB).",
      "Jaga bayi tetap hangat dan tidur telentang di alas yang rata.",
      "Cek tanda bahaya setiap hari dan isi lembar pemantauan bayi.",
    ],
  },
  {
    slug: "hangat-tali-pusat",
    judul: "Menjaga bayi hangat & merawat tali pusat",
    tahap: ["nifas"],
    kategori: "Bayi",
    halaman: 47,
    ringkas: [
      "Mandikan dengan air hangat 6 jam setelah lahir bila kondisi stabil; sebelum tali pusat lepas cukup dilap.",
      "Beri pakaian dan selimut, ganti popok segera bila basah.",
      "Bayi < 2500 gram: lakukan perawatan metode kanguru.",
      "Perhatikan warna tinja sampai 4 bulan; tinja pucat (nomor 1–3) segera ke dokter.",
    ],
  },
];

export interface TandaBahaya {
  tahap: KodeTahap[];
  judul: string;
  halaman: number;
  butir: string[];
  untuk: "ibu" | "bayi";
}

/** Daftar tanda bahaya per tahap, sesuai halaman Buku KIA. */
export const TANDA_BAHAYA: TandaBahaya[] = [
  { tahap: ["T1"], judul: "Tanda bahaya trimester 1", halaman: 8, untuk: "ibu", butir: ["Nyeri perut hebat", "Demam tinggi", "Sakit saat kencing, keputihan, atau gatal di kemaluan", "Perdarahan", "Mual dan muntah hebat"] },
  { tahap: ["T2"], judul: "Tanda bahaya trimester 2", halaman: 17, untuk: "ibu", butir: ["Pusing/sakit kepala berat", "Pandangan kabur", "Perdarahan atau keluar cairan sangat banyak/berbau dari jalan lahir", "Nyeri perut hebat", "Napas pendek dan jantung berdebar kencang", "Demam tinggi", "Muntah darah", "Sakit saat kencing atau keputihan/gatal di kemaluan"] },
  { tahap: ["T3"], judul: "Tanda bahaya trimester 3", halaman: 20, untuk: "ibu", butir: ["Pusing/sakit kepala berat", "Perdarahan hebat", "Nyeri perut hebat di antara kontraksi", "Ketuban pecah tanpa kontraksi", "Gerakan bayi tidak ada atau < 10 kali dalam 12 jam"] },
  { tahap: ["T3"], judul: "Tanda bahaya saat melahirkan", halaman: 22, untuk: "ibu", butir: ["Tali pusat atau tangan bayi keluar dari jalan lahir", "Ibu kejang", "Ibu gelisah atau kesakitan hebat", "Air ketuban hijau dan berbau", "Perdarahan lewat jalan lahir", "Ibu tidak kuat mengejan"] },
  { tahap: ["nifas"], judul: "Tanda bahaya ibu nifas", halaman: 27, untuk: "ibu", butir: ["Perdarahan lewat jalan lahir", "Keluar cairan berbau dari jalan lahir", "Demam lebih dari 2 hari", "Nyeri ulu hati, mual muntah, sakit kepala, pandangan kabur, atau kejang (dengan/tanpa bengkak)", "Payudara bengkak, merah, dan sakit", "Ibu terlihat sedih, murung, menangis tanpa sebab"] },
  { tahap: ["nifas"], judul: "Tanda bahaya bayi 0–28 hari", halaman: 41, untuk: "bayi", butir: ["Tidak mau menyusu", "Kejang", "Lemah", "Sesak napas", "Merintih atau menangis terus-menerus", "Demam tinggi atau tubuh dingin", "Kulit dan mata kuning", "Tali pusat kemerahan sampai dinding perut, berbau, bernanah", "Diare atau muntah-muntah", "Tinja berwarna pucat"] },
];

export function materiUntuk(kode: KodeTahap): Materi[] {
  return MATERI.filter((m) => m.tahap.includes(kode) || m.tahap.includes("semua"));
}

export function tandaBahayaUntuk(kode: KodeTahap): TandaBahaya[] {
  return TANDA_BAHAYA.filter((t) => t.tahap.includes(kode));
}
