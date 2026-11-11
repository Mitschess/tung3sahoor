/**
 * Materi edukasi bergambar per tahap, disusun sebagai "flipbook" (lembar demi lembar).
 * Isi diringkas dengan bahasa sederhana dari Buku KIA Kemenkes RI 2024; ilustrasi dipotong
 * dari buku yang sama (lihat src/data/gambar-kia.ts). Setiap materi menyebut halaman cetaknya
 * dan tombol "Baca halaman aslinya" membuka halaman itu di PDF.
 * Isi medis tidak diubah; bila ragu, ikuti buku dan tenaga kesehatan.
 */
import type { KodeTahap } from "@/lib/tahap";
import type { NamaGambar } from "./gambar-kia";

/** Warna bab, mengikuti pita warna di Buku KIA (kehamilan, melahirkan, nifas, menyusui, bayi). */
export type Tema = "rose" | "brand" | "ungu" | "hijau" | "teal";

export const TEMA: Record<Tema, { bab: string; pita: string; lembut: string; teks: string; titik: string }> = {
  rose: { bab: "Kehamilan", pita: "bg-rose", lembut: "bg-rose-soft", teks: "text-rose", titik: "bg-rose" },
  brand: { bab: "Melahirkan", pita: "bg-brand", lembut: "bg-brand-soft", teks: "text-brand", titik: "bg-brand" },
  ungu: { bab: "Setelah melahirkan", pita: "bg-ungu", lembut: "bg-ungu-soft", teks: "text-ungu", titik: "bg-ungu" },
  hijau: { bab: "Menyusui", pita: "bg-hijau", lembut: "bg-hijau-soft", teks: "text-hijau", titik: "bg-hijau" },
  teal: { bab: "Bayi 0–28 hari", pita: "bg-teal", lembut: "bg-teal-soft", teks: "text-teal", titik: "bg-teal" },
};

export interface ItemGambar {
  gambar: NamaGambar;
  label: string;
}

/** Satu lembar flipbook. Semua bagian opsional kecuali judul; urutan tampil: gambar → judul → teks → kisi → poin. */
export interface Lembar {
  judul: string;
  teks?: string;
  gambar?: NamaGambar;
  /** Kumpulan gambar kecil berlabel (tanda bahaya, hal yang dilarang, perbandingan). */
  kisi?: ItemGambar[];
  poin?: string[];
  /** bahaya = pita merah "segera ke fasilitas kesehatan"; jangan = hal yang tidak boleh; tips = anjuran. */
  nada?: "bahaya" | "jangan" | "tips";
  /** Halaman cetak Buku KIA untuk lembar ini. */
  halaman?: number;
  /** Tampilkan kartu warna tinja (halaman 47). */
  warnaTinja?: boolean;
  aksi?: { label: string; href: string };
}

export interface Materi {
  slug: string;
  judul: string;
  sub: string;
  tahap: (KodeTahap | "semua")[];
  kategori: "Tahap" | "Tanda bahaya" | "Kesehatan jiwa" | "Menyusui" | "Bayi" | "Persiapan";
  tema: Tema;
  /** Halaman cetak pertama di Buku KIA. */
  halaman: number;
  sampul: NamaGambar;
  /** Hal yang perlu diingat; tampil di lembar terakhir. */
  ringkas: string[];
  lembar: Lembar[];
}

export interface TandaBahaya {
  tahap: KodeTahap[];
  judul: string;
  halaman: number;
  untuk: "ibu" | "bayi";
  butir: { teks: string; gambar?: NamaGambar }[];
}

/** Daftar tanda bahaya per tahap, sesuai halaman Buku KIA, lengkap dengan gambarnya. */
export const TANDA_BAHAYA: TandaBahaya[] = [
  {
    tahap: ["T1"],
    judul: "Tanda bahaya trimester 1",
    halaman: 8,
    untuk: "ibu",
    butir: [
      { teks: "Nyeri perut hebat", gambar: "tb1-nyeri-perut" },
      { teks: "Demam tinggi", gambar: "tb1-demam" },
      { teks: "Sakit saat kencing, keputihan, atau gatal di kemaluan", gambar: "tb1-kencing" },
      { teks: "Perdarahan", gambar: "tb1-perdarahan" },
      { teks: "Mual dan muntah hebat", gambar: "tb1-muntah" },
    ],
  },
  {
    tahap: ["T2"],
    judul: "Tanda bahaya trimester 2",
    halaman: 17,
    untuk: "ibu",
    butir: [
      { teks: "Pusing/sakit kepala berat", gambar: "tb2-pusing" },
      { teks: "Pandangan kabur", gambar: "tb2-pandangan" },
      { teks: "Perdarahan", gambar: "tb2-perdarahan" },
      { teks: "Keluar cairan sangat banyak atau berbau dari jalan lahir", gambar: "tb2-cairan" },
      { teks: "Nyeri perut hebat", gambar: "tb2-nyeri-perut" },
      { teks: "Napas pendek dan jantung berdebar kencang", gambar: "tb2-napas" },
      { teks: "Demam tinggi", gambar: "tb2-demam" },
      { teks: "Muntah darah", gambar: "tb2-muntah-darah" },
      { teks: "Sakit saat kencing, keputihan, atau gatal di kemaluan", gambar: "tb2-kencing" },
    ],
  },
  {
    tahap: ["T3"],
    judul: "Tanda bahaya trimester 3",
    halaman: 20,
    untuk: "ibu",
    butir: [
      { teks: "Gerakan bayi tidak ada atau kurang dari 10 kali dalam 12 jam", gambar: "tb3-gerak-bayi" },
      { teks: "Ketuban pecah tanpa kontraksi", gambar: "tb3-ketuban" },
      { teks: "Nyeri perut hebat di antara kontraksi", gambar: "tb3-nyeri" },
      { teks: "Perdarahan hebat", gambar: "tb3-perdarahan" },
      { teks: "Pusing/sakit kepala berat", gambar: "tb3-pusing" },
    ],
  },
  {
    tahap: ["T3"],
    judul: "Tanda bahaya saat melahirkan",
    halaman: 23,
    untuk: "ibu",
    butir: [
      { teks: "Tali pusat atau tangan bayi keluar dari jalan lahir", gambar: "tbl-tali-pusat" },
      { teks: "Ibu kejang", gambar: "tbl-kejang" },
      { teks: "Ibu gelisah atau kesakitan hebat", gambar: "tbl-gelisah" },
      { teks: "Air ketuban hijau dan berbau", gambar: "tbl-ketuban-hijau" },
      { teks: "Perdarahan lewat jalan lahir", gambar: "tbl-perdarahan" },
      { teks: "Ibu tidak kuat mengejan", gambar: "tbl-tidak-kuat" },
    ],
  },
  {
    tahap: ["nifas"],
    judul: "Tanda bahaya ibu nifas",
    halaman: 27,
    untuk: "ibu",
    butir: [
      { teks: "Perdarahan lewat jalan lahir", gambar: "tbn-perdarahan" },
      { teks: "Keluar cairan berbau dari jalan lahir", gambar: "tbn-cairan" },
      { teks: "Demam lebih dari 2 hari", gambar: "tbn-demam" },
      { teks: "Nyeri ulu hati, mual muntah, sakit kepala, pandangan kabur, atau kejang (dengan/tanpa bengkak)", gambar: "tbn-ulu-hati" },
      { teks: "Payudara bengkak, merah, dan sakit", gambar: "tbn-payudara" },
      { teks: "Ibu terlihat sedih, murung, menangis tanpa sebab", gambar: "tbn-sedih" },
    ],
  },
  {
    tahap: ["nifas"],
    judul: "Tanda bahaya bayi 0–28 hari",
    halaman: 41,
    untuk: "bayi",
    butir: [
      { teks: "Tidak mau menyusu", gambar: "tbb-tidak-menyusu" },
      { teks: "Kejang", gambar: "tbb-kejang" },
      { teks: "Lemah", gambar: "tbb-lemah" },
      { teks: "Sesak napas", gambar: "tbb-sesak" },
      { teks: "Merintih atau menangis terus-menerus", gambar: "tbb-merintih" },
      { teks: "Demam/panas tinggi", gambar: "tbb-demam" },
      { teks: "Tubuh dingin", gambar: "tbb-dingin" },
      { teks: "Kulit dan mata kuning", gambar: "tbb-kuning" },
      { teks: "Tali pusat kemerahan sampai dinding perut, berbau, bernanah", gambar: "tbb-tali-pusat" },
      { teks: "Diare", gambar: "tbb-diare" },
      { teks: "Muntah-muntah", gambar: "tbb-muntah" },
      { teks: "Tinja berwarna pucat", gambar: "tbb-tinja-pucat" },
    ],
  },
];

/** Ubah daftar tanda bahaya menjadi lembar flipbook (maksimal 6 gambar per lembar). */
function lembarBahaya(judul: string, teks?: string): Lembar[] {
  const tb = TANDA_BAHAYA.find((t) => t.judul === judul);
  if (!tb) return [];
  const kisi = tb.butir.filter((b) => b.gambar).map((b) => ({ gambar: b.gambar!, label: b.teks }));
  const per = kisi.length > 6 ? Math.ceil(kisi.length / 2) : 6;
  const out: Lembar[] = [];
  for (let i = 0; i < kisi.length; i += per) {
    out.push({ judul: out.length ? `${tb.judul} (lanjutan)` : tb.judul, teks: out.length ? undefined : teks, kisi: kisi.slice(i, i + per), nada: "bahaya", halaman: tb.halaman });
  }
  return out;
}

export const MATERI: Materi[] = [
  {
    slug: "t1",
    judul: "Hamil 1–3 bulan",
    sub: "Trimester 1: masa pembentukan tubuh bayi",
    tahap: ["T1"],
    kategori: "Tahap",
    tema: "rose",
    halaman: 6,
    sampul: "buah-jeruk-nipis",
    ringkas: [
      "Mual, muntah, dan mudah lelah itu wajar.",
      "Periksa ke dokter paling sedikit 1 kali: USG dan laboratorium.",
      "Makan sedikit tapi sering, minum tablet tambah darah setiap hari.",
      "Jangan minum obat tanpa resep dan jauhi asap rokok.",
    ],
    lembar: [
      {
        judul: "Si kecil mulai tumbuh",
        teks: "Di bulan pertama, bayi masih sebesar biji beras. Di akhir bulan ke-3, kira-kira sebesar jeruk nipis. Bagian tubuhnya, termasuk otak, mulai terbentuk.",
        kisi: [
          { gambar: "buah-beras", label: "Panjang ±0,64 cm" },
          { gambar: "buah-jeruk-nipis", label: "±10 cm, berat ±28 g" },
        ],
        halaman: 6,
      },
      {
        judul: "Yang wajar Ibu alami",
        gambar: "hamil-periksa",
        poin: ["Mual, muntah, dan mudah lelah.", "Berat badan naik sekitar 1–3 kg.", "Masa ini rentan keguguran, jadi jaga diri baik-baik."],
        halaman: 6,
      },
      {
        judul: "Yang perlu Ibu lakukan",
        nada: "tips",
        poin: [
          "Periksa kehamilan ke dokter paling sedikit 1 kali, termasuk USG dan cek laboratorium lengkap.",
          "Makan porsi kecil tapi sering: 3 kali makan utama dan 2 kali selingan.",
          "Minum tablet tambah darah/multivitamin setiap hari.",
          "Tidur malam 6–7 jam dan tidur siang 1–2 jam.",
          "Ajak bayi bicara dan usap perut Ibu.",
        ],
        halaman: 6,
      },
      {
        judul: "Hindari hal-hal ini",
        nada: "jangan",
        kisi: [
          { gambar: "jangan-obat", label: "Minum obat tanpa resep dokter" },
          { gambar: "jangan-rokok", label: "Merokok atau terkena asap rokok" },
          { gambar: "jangan-alkohol", label: "Minuman beralkohol dan jamu" },
          { gambar: "jangan-capek", label: "Kerja berat sampai kelelahan" },
          { gambar: "jangan-stres", label: "Stres berlebihan" },
          { gambar: "jangan-telentang", label: "Tidur telentang > 10 menit (trimester 2 & 3)" },
        ],
        halaman: 9,
      },
      {
        judul: "Gerakan yang tidak boleh",
        teks: "Pemanasan, peregangan, dan senam panggul boleh dilakukan.",
        nada: "jangan",
        kisi: [
          { gambar: "jangan-lompat", label: "Melompat" },
          { gambar: "jangan-jongkok", label: "Jongkok terlalu lama" },
          { gambar: "jangan-sepeda", label: "Kegiatan yang mudah jatuh" },
          { gambar: "jangan-membungkuk", label: "Membungkuk tanpa pegangan" },
          { gambar: "jangan-mengejan", label: "Mengejan" },
        ],
        halaman: 9,
      },
      ...lembarBahaya("Tanda bahaya trimester 1"),
    ],
  },
  {
    slug: "t2",
    judul: "Hamil 4–6 bulan",
    sub: "Trimester 2: saatnya merencanakan kelahiran",
    tahap: ["T2"],
    kategori: "Tahap",
    tema: "rose",
    halaman: 16,
    sampul: "buah-jagung",
    ringkas: [
      "Gerak bayi mulai terasa sekitar bulan ke-5.",
      "Periksa ke dokter atau bidan paling sedikit 2 kali.",
      "Tetap minum tablet tambah darah setiap hari.",
      "Mulai rencanakan persalinan bersama keluarga dan bidan.",
    ],
    lembar: [
      {
        judul: "Si kecil makin besar",
        teks: "Bayi tumbuh dari sebesar apel hingga sebesar jagung. Fungsi organ dan tubuhnya terus berkembang.",
        kisi: [
          { gambar: "buah-apel", label: "Panjang ±12,5 cm" },
          { gambar: "buah-jagung", label: "±34 cm, berat ±1 kg" },
        ],
        halaman: 16,
      },
      {
        judul: "Yang wajar Ibu alami",
        poin: ["Mual dan lelah di awal kehamilan mulai berkurang.", "Berat badan naik 4–8 kg, sesuai gizi Ibu sebelum hamil.", "Mulai terasa gerakan bayi, seperti menendang, sekitar bulan ke-5."],
        halaman: 16,
      },
      {
        judul: "Yang perlu Ibu lakukan",
        nada: "tips",
        poin: [
          "Periksa ke dokter atau bidan paling sedikit 2 kali.",
          "Makan sedikit tapi sering: 3 kali makan utama dan 1–2 kali selingan.",
          "Minum tablet tambah darah setiap hari.",
          "Pantau gerak bayi.",
          "Mulai rencanakan proses melahirkan bersama tenaga kesehatan.",
        ],
        halaman: 16,
      },
      {
        judul: "Ikut Kelas Ibu Hamil",
        gambar: "kelas-ibu",
        teks: "Di kelas ibu hamil, Ibu belajar tentang kehamilan, persalinan, nifas, dan merawat bayi, sambil berbagi dengan ibu-ibu lain. Ajak suami ikut paling sedikit 1 kali.",
        halaman: 15,
      },
      ...lembarBahaya("Tanda bahaya trimester 2"),
    ],
  },
  {
    slug: "jiwa-hamil",
    judul: "Kesehatan jiwa ibu hamil",
    sub: "Cemas itu wajar, tapi jangan dipendam sendiri",
    tahap: ["T1", "T2", "T3"],
    kategori: "Kesehatan jiwa",
    tema: "rose",
    halaman: 14,
    sampul: "jiwa-hamil",
    ringkas: [
      "Mudah sedih, marah, atau cemas bisa terjadi saat hamil.",
      "Tidur cukup, makan bergizi, dan minta keluarga mendampingi.",
      "Periksakan kesehatan jiwa ke Puskesmas; itu bagian dari pelayanan.",
    ],
    lembar: [
      {
        judul: "Perasaan Ibu ikut berubah",
        teks: "Selama hamil, Ibu bisa mudah sedih, mudah marah, stres, cemas, bahkan depresi. Ini bisa memengaruhi kesehatan Ibu dan perkembangan bayi.",
        halaman: 14,
      },
      {
        judul: "Kenali tandanya",
        gambar: "lain-sulit-tidur",
        poin: [
          "Cemas dan khawatir berlebihan.",
          "Gelisah, gemetar, sulit rileks, otot tegang, sakit kepala.",
          "Berdebar, berkeringat, sesak, tidak nyaman di ulu hati.",
          "Lelah berkepanjangan tapi sulit tidur.",
          "Mudah tersinggung dan marah.",
        ],
        halaman: 14,
      },
      {
        judul: "Ibu tidak sendirian",
        nada: "tips",
        poin: [
          "Tidur cukup.",
          "Makan makanan bergizi.",
          "Minta suami atau keluarga mendampingi dan membantu.",
          "Periksakan kesehatan jiwa ke Puskesmas. Ini bukan tanda lemah.",
        ],
        halaman: 14,
      },
    ],
  },
  {
    slug: "persiapan",
    judul: "Persiapan melahirkan (P4K)",
    sub: "Siapkan jauh-jauh hari, mulai trimester 2",
    tahap: ["T2", "T3"],
    kategori: "Persiapan",
    tema: "rose",
    halaman: 18,
    sampul: "p4k",
    ringkas: [
      "Persiapan dimulai sejak trimester kedua.",
      "Siapkan pendamping, dana/kartu JKN, dokumen, dan kendaraan.",
      "Siapkan lebih dari satu calon pendonor darah.",
    ],
    lembar: [
      {
        judul: "Kenapa harus disiapkan?",
        teks: "Supaya persalinan lancar dan kalau ada masalah, Ibu bisa cepat dibawa ke fasilitas kesehatan. Persiapan dimulai sejak trimester kedua.",
        halaman: 18,
      },
      {
        judul: "Yang perlu disiapkan",
        nada: "tips",
        poin: [
          "Tanya bidan/dokter perkiraan tanggal lahir.",
          "Suami atau keluarga mendampingi periksa dan melahirkan.",
          "Tabungan atau dana cadangan untuk biaya persalinan.",
          "Kartu JKN, KTP, dan KK.",
          "Lebih dari 1 calon pendonor darah dengan golongan darah sama.",
          "Kendaraan yang siap kapan saja.",
          "Rencana KB setelah melahirkan.",
          "Stiker P4K ditempel di depan rumah.",
        ],
        aksi: { label: "Centang persiapan Ibu", href: "/ibu/persiapan" },
        halaman: 18,
      },
    ],
  },
  {
    slug: "t3",
    judul: "Hamil 7–9 bulan",
    sub: "Trimester 3: siap menyambut si kecil",
    tahap: ["T3"],
    kategori: "Tahap",
    tema: "rose",
    halaman: 19,
    sampul: "buah-semangka",
    ringkas: [
      "Mudah lelah dan sering buang air kecil itu wajar.",
      "Periksa paling sedikit 3 kali; salah satunya ke dokter (USG & lab).",
      "Kenali tanda awal dan tanda bahaya melahirkan.",
      "Diskusikan KB, IMD, dan ASI dengan tenaga kesehatan.",
    ],
    lembar: [
      {
        judul: "Hampir bertemu si kecil",
        teks: "Bayi tumbuh dari sebesar pepaya hingga sebesar semangka. Organ tubuhnya makin siap untuk hidup di luar rahim.",
        kisi: [
          { gambar: "buah-pepaya", label: "±40 cm, berat ±1,3 kg" },
          { gambar: "buah-semangka", label: "≥48 cm, 2,5–4 kg" },
        ],
        halaman: 19,
      },
      {
        judul: "Yang wajar Ibu alami",
        poin: ["Sering lelah, tidak nyaman, dan sulit tidur.", "Sering buang air kecil dan kaki bengkak.", "Berat badan naik 4–8 kg, sesuai gizi Ibu sebelum hamil."],
        halaman: 19,
      },
      {
        judul: "Yang perlu Ibu lakukan",
        nada: "tips",
        poin: [
          "Periksa paling sedikit 3 kali; salah satunya oleh dokter dengan USG dan laboratorium.",
          "Makan sedikit tapi sering dan minum tablet tambah darah setiap hari.",
          "Pelajari tanda awal melahirkan.",
          "Bicarakan KB setelah melahirkan, IMD, dan ASI dengan bidan.",
        ],
        halaman: 19,
      },
      {
        judul: "Mitos atau fakta?",
        teks: "Ada yang bilang makanan berminyak dan pedas bisa mempercepat kelahiran. Itu mitos dan tidak terbukti. Yang penting, makan gizi seimbang supaya Ibu dan bayi sehat.",
        halaman: 19,
      },
      ...lembarBahaya("Tanda bahaya trimester 3"),
    ],
  },
  {
    slug: "melahirkan",
    judul: "Tanda awal & proses melahirkan",
    sub: "Melahirkan di fasilitas kesehatan, lalu IMD",
    tahap: ["T3"],
    kategori: "Tahap",
    tema: "brand",
    halaman: 21,
    sampul: "melahirkan",
    ringkas: [
      "Tanda awal: mulas teratur yang makin sering, lendir bercampur darah, atau air ketuban keluar.",
      "Melahirkan di Puskesmas, rumah sakit, atau klinik bersalin.",
      "Lakukan IMD: kulit ke kulit paling sedikit 1 jam.",
      "Ibu dan bayi dirawat paling sedikit 24 jam setelah melahirkan normal.",
    ],
    lembar: [
      {
        judul: "Melahirkan di fasilitas kesehatan",
        teks: "Melahirkan di Puskesmas, rumah sakit, atau klinik bersalin, supaya kalau ada masalah bisa cepat ditangani. Ibu dan bayi dirawat paling sedikit 24 jam setelah melahirkan normal.",
        halaman: 21,
      },
      {
        judul: "Tanda awal melahirkan",
        kisi: [
          { gambar: "tanda-awal-mulas", label: "Perut mulas teratur, makin sering dan makin lama" },
          { gambar: "tanda-awal-lendir", label: "Keluar lendir bercampur darah atau air ketuban" },
        ],
        teks: "Kalau tanda ini muncul, segera ke fasilitas kesehatan bersama pendamping.",
        halaman: 22,
      },
      {
        judul: "Saat proses melahirkan",
        gambar: "proses-melahirkan",
        poin: [
          "Anak pertama biasanya lahir sekitar 12 jam sejak mulas; anak berikutnya biasanya lebih cepat.",
          "Ibu boleh memilih pendamping dan posisi melahirkan yang aman.",
          "Tarik napas lewat hidung, keluarkan lewat mulut untuk mengurangi sakit.",
          "Kalau terasa ingin buang air besar, beri tahu petugas.",
        ],
        halaman: 24,
      },
      {
        judul: "Inisiasi Menyusu Dini (IMD)",
        gambar: "imd",
        teks: "Segera setelah lahir, bayi diletakkan di dada Ibu, kulit ke kulit, paling sedikit 1 jam.",
        poin: ["Ibu dan bayi lebih tenang.", "Kolostrum memberi kekebalan untuk bayi.", "ASI lebih cepat keluar.", "Mengurangi perdarahan dan membantu ari-ari lepas."],
        halaman: 25,
      },
      ...lembarBahaya("Tanda bahaya saat melahirkan", "Kalau ada tanda ini, petugas kesehatan harus segera merujuk Ibu ke rumah sakit."),
    ],
  },
  {
    slug: "nifas",
    judul: "Setelah melahirkan (nifas)",
    sub: "42 hari pemulihan: tetap waspada",
    tahap: ["nifas"],
    kategori: "Tahap",
    tema: "ungu",
    halaman: 26,
    sampul: "nifas",
    ringkas: [
      "Kematian ibu paling banyak terjadi setelah melahirkan: tetap waspada.",
      "Periksa 4 kali: 6–48 jam, hari 3–7, hari 8–28, dan hari 29–42.",
      "Lanjutkan tablet tambah darah.",
      "Jangan buang kolostrum dan jangan mengikat perut terlalu kencang.",
    ],
    lembar: [
      {
        judul: "Periksa 4 kali setelah melahirkan",
        teks: "Kematian ibu paling banyak terjadi di masa nifas. Jangan lewatkan pemeriksaan ini.",
        poin: ["KF1: 6 jam – 2 hari", "KF2: hari ke-3 – 7", "KF3: hari ke-8 – 28", "KF4: hari ke-29 – 42 (untuk Ibu)"],
        halaman: 26,
      },
      {
        judul: "Yang wajar Ibu alami",
        poin: [
          "Tubuh, hormon, dan perasaan Ibu banyak berubah.",
          "ASI pertama (kolostrum) keluar sedikit, sekitar 5–10 ml di hari pertama.",
          "ASI makin banyak kalau bayi makin sering menyusu.",
        ],
        halaman: 26,
      },
      {
        judul: "Yang perlu Ibu lakukan",
        nada: "tips",
        poin: [
          "Minum tablet tambah darah untuk mencegah anemia.",
          "Makan lebih banyak dari sebelum hamil: 3 kali makan dan 1–2 kali selingan.",
          "Ayah dan keluarga ikut mengasuh, supaya Ibu bisa istirahat.",
          "Sedih atau murung 2 minggu lebih? Periksa ke tenaga kesehatan.",
        ],
        halaman: 26,
      },
      {
        judul: "Jangan lakukan ini",
        nada: "jangan",
        kisi: [
          { gambar: "nifas-jangan-kolostrum", label: "Membuang ASI pertama (kolostrum)" },
          { gambar: "nifas-jangan-alkohol", label: "Membersihkan payudara dengan alkohol, obat merah, atau sabun" },
          { gambar: "nifas-jangan-ikat-perut", label: "Mengikat perut terlalu kencang" },
          { gambar: "nifas-jangan-daun", label: "Menempelkan daun-daunan di kemaluan" },
          { gambar: "nifas-jangan-telungkup", label: "Latihan fisik posisi telungkup" },
        ],
        halaman: 27,
      },
      ...lembarBahaya("Tanda bahaya ibu nifas"),
    ],
  },
  {
    slug: "baby-blues",
    judul: "Baby blues & depresi",
    sub: "Ceritakan perasaan Ibu, jangan dipendam",
    tahap: ["nifas"],
    kategori: "Kesehatan jiwa",
    tema: "ungu",
    halaman: 32,
    sampul: "depresi",
    ringkas: [
      "Baby blues: perasaan naik-turun dan mudah menangis, memuncak dalam 2 minggu.",
      "Sedih berat 2 minggu lebih atau ada pikiran melukai diri/bayi: segera ke tenaga kesehatan.",
      "Dukungan suami, keluarga, dan konseling di Puskesmas sangat membantu.",
    ],
    lembar: [
      {
        judul: "Baby blues",
        teks: "Muncul setelah melahirkan dan memuncak dalam beberapa hari sampai 2 minggu.",
        poin: ["Perasaan naik-turun.", "Mudah menangis.", "Sulit tidur.", "Mudah cemas dan tersinggung."],
        halaman: 32,
      },
      {
        judul: "Depresi setelah melahirkan",
        nada: "bahaya",
        teks: "Lebih berat dan lebih lama dari baby blues. Segera ke tenaga kesehatan kalau Ibu mengalami:",
        poin: [
          "Sangat sedih dan tertekan 2 minggu atau lebih.",
          "Tidak bergairah, mudah lelah, sulit konsentrasi.",
          "Merasa bersalah atau takut tidak bisa jadi ibu yang baik.",
          "Muncul pikiran melukai diri sendiri atau bayi.",
        ],
        halaman: 32,
      },
      {
        judul: "Yang membantu Ibu",
        nada: "tips",
        poin: [
          "Suami dan keluarga memperhatikan Ibu, bukan hanya bayinya.",
          "Ada yang membantu mengasuh bayi.",
          "Ibu diajak bicara tentang perasaannya.",
          "Konseling di Puskesmas tersedia; ini bukan kelemahan.",
        ],
        halaman: 32,
      },
    ],
  },
  {
    slug: "kb",
    judul: "KB setelah melahirkan",
    sub: "Atur jarak kehamilan paling sedikit 2 tahun",
    tahap: ["nifas", "T3"],
    kategori: "Tahap",
    tema: "ungu",
    halaman: 33,
    sampul: "kb",
    ringkas: [
      "KB pasca melahirkan dimulai sampai 42 hari setelah melahirkan.",
      "Pilih metode yang tidak mengganggu ASI.",
      "Jarak kehamilan ideal paling sedikit 2 tahun.",
      "KB suntik 1 bulan tidak disarankan untuk ibu menyusui.",
    ],
    lembar: [
      {
        judul: "Kenapa perlu ikut KB?",
        poin: [
          "Mengatur jarak kehamilan, paling sedikit 2 tahun.",
          "Ibu tidak terlalu sering melahirkan (sebaiknya tidak lebih dari 3 anak).",
          "Mencegah kehamilan yang tidak diinginkan.",
          "Ibu punya waktu untuk diri sendiri, anak, dan keluarga.",
        ],
        halaman: 33,
      },
      {
        judul: "Kapan mulai?",
        teks: "KB pasca melahirkan dipakai langsung setelah melahirkan sampai 42 hari sesudahnya. Pilih metode yang tidak mengganggu ASI dan cocok dengan kondisi Ibu.",
        halaman: 33,
      },
      {
        judul: "Pilihan metode",
        poin: [
          "Jangka panjang: spiral/AKDR (sampai 10 tahun), implan (3 tahun), MOW/MOP.",
          "Lainnya: pil KB, kondom, suntik 3 bulan (setelah 6 minggu).",
          "Ibu menyusui: hindari suntik 1 bulan karena mengurangi ASI.",
        ],
        aksi: { label: "Catat pilihan KB Ibu", href: "/ibu/kb" },
        halaman: 33,
      },
    ],
  },
  {
    slug: "menyusui",
    judul: "Menyusui: posisi & pelekatan",
    sub: "ASI saja sampai 6 bulan",
    tahap: ["nifas", "T3"],
    kategori: "Menyusui",
    tema: "hijau",
    halaman: 34,
    sampul: "menyusui",
    ringkas: [
      "Beri ASI saja sampai 6 bulan, lanjutkan sampai 2 tahun.",
      "Susui 8–12 kali sehari; bangunkan bayi kalau tidur lebih dari 3 jam.",
      "Kepala dan badan bayi segaris, dagu menempel, bibir bawah dower.",
      "Payudara masih penuh? Perah dan simpan ASI-nya.",
    ],
    lembar: [
      {
        judul: "ASI saja sampai 6 bulan",
        gambar: "asi-saja",
        teks: "ASI berisi semua gizi yang dibutuhkan bayi. Jangan tambahkan air putih, makanan, atau minuman lain kecuali dianjurkan tenaga kesehatan. Lanjutkan menyusui sampai 2 tahun.",
        halaman: 38,
      },
      {
        judul: "Menyusui juga baik untuk Ibu",
        poin: [
          "Mencegah kanker payudara.",
          "Berat badan lebih cepat kembali.",
          "Rahim cepat kembali dan mencegah perdarahan.",
          "Ikatan dengan bayi makin kuat, Ibu lebih tenang.",
        ],
        halaman: 34,
      },
      {
        judul: "Pelekatan yang benar",
        kisi: [
          { gambar: "pelekatan-benar", label: "Benar: mulut terbuka lebar, dagu menempel" },
          { gambar: "pelekatan-salah", label: "Salah: hanya puting yang masuk" },
        ],
        poin: ["Kepala dan badan bayi membentuk garis lurus.", "Badan bayi menempel ke tubuh Ibu.", "Bibir bawah bayi terlipat keluar (dower)."],
        halaman: 35,
      },
      {
        judul: "Seberapa sering?",
        nada: "tips",
        poin: [
          "Sesering mungkin, 8–12 kali sehari atau lebih.",
          "Kalau bayi tidur lebih dari 3 jam, bangunkan lalu susui.",
          "Kosongkan satu payudara, lalu pindah ke sisi lain.",
          "Bayi sudah kenyang tapi payudara masih penuh? Perah ASI-nya.",
        ],
        halaman: 35,
      },
      {
        judul: "Lambung bayi masih kecil",
        gambar: "lambung-bayi",
        teks: "Sedikit ASI sudah cukup, asal sering.",
        poin: ["Hari ke-1: sebesar kelereng.", "Hari ke-3: sebesar bola pingpong.", "Minggu ke-1: sebesar telur ayam.", "Bulan ke-1: sebesar telur bebek."],
        halaman: 39,
      },
      {
        judul: "Bayi kembar juga bisa",
        kisi: [
          { gambar: "kembar-1", label: "Posisi kembar 1" },
          { gambar: "kembar-2", label: "Posisi kembar 2" },
        ],
        teks: "Tanyakan posisi yang nyaman ke bidan atau konselor menyusui. Konseling menyusui gratis di Puskesmas.",
        halaman: 35,
      },
    ],
  },
  {
    slug: "asi-perah",
    judul: "Memerah & menyimpan ASI",
    sub: "Supaya bayi tetap dapat ASI saat Ibu jauh",
    tahap: ["nifas"],
    kategori: "Menyusui",
    tema: "hijau",
    halaman: 36,
    sampul: "perah-tangan",
    ringkas: [
      "Suhu ruang (< 25 °C): 6–8 jam; kulkas (< 4 °C): 2–3 hari.",
      "Freezer kulkas 1 pintu: 2 minggu; 2 pintu: 3–6 bulan.",
      "Simpan 15–60 ml per wadah dan beri label tanggal.",
      "Jangan rebus atau panaskan ASI di microwave.",
    ],
    lembar: [
      {
        judul: "Siapkan wadahnya",
        kisi: [
          { gambar: "perah-cuci", label: "Cuci cangkir dengan sabun" },
          { gambar: "perah-air-panas", label: "Siram air mendidih, diamkan beberapa menit" },
        ],
        teks: "Untuk kolostrum di hari-hari pertama, tampung dengan sendok.",
        halaman: 36,
      },
      {
        judul: "Cara memerah",
        kisi: [
          { gambar: "perah-tangan", label: "Ibu jari di atas, telunjuk di bawah areola" },
          { gambar: "perah-tetes", label: "Tekan dan lepas sampai ASI menetes" },
        ],
        poin: ["Perah tiap payudara 3–5 menit, bergantian.", "Seluruhnya sekitar 20–30 menit."],
        halaman: 36,
      },
      {
        judul: "Berapa lama ASI tahan?",
        gambar: "perah-kulkas",
        poin: [
          "Suhu ruang < 25 °C: 6–8 jam.",
          "Suhu ruang 27–32 °C: 4 jam.",
          "Cooler bag (15 °C): 24 jam.",
          "Kulkas < 4 °C: 2–3 hari.",
          "Freezer kulkas 1 pintu: 2 minggu.",
          "Freezer kulkas 2 pintu: 3–6 bulan.",
        ],
        halaman: 36,
      },
      {
        judul: "Memberikan ASI perah",
        gambar: "perah-hangat",
        nada: "tips",
        poin: [
          "Cairkan ASI beku pelan-pelan di kulkas atau dalam wadah berisi air hangat; habiskan dalam 24 jam.",
          "Jangan direbus atau dipanaskan di microwave.",
          "Simpan 15–60 ml per wadah dan beri label tanggal.",
          "Berikan dengan cangkir, bukan dot.",
        ],
        halaman: 36,
      },
    ],
  },
  {
    slug: "bayi-baru-lahir",
    judul: "Bayi baru lahir (0–28 hari)",
    sub: "Bulan pertama yang paling penting",
    tahap: ["nifas"],
    kategori: "Bayi",
    tema: "teal",
    halaman: 40,
    sampul: "bayi-baru-lahir",
    ringkas: [
      "Periksa bayi pada 0–6 jam, 6–48 jam, hari 3–7, dan hari 8–28.",
      "Imunisasi HB0 sebelum 24 jam; skrining SHK dan PJB.",
      "Jaga bayi tetap hangat, tidur telentang di alas rata.",
      "Cek tanda bahaya setiap hari.",
    ],
    lembar: [
      {
        judul: "Periksa bayi 4 kali",
        teks: "Dua pertiga kematian balita di Indonesia terjadi di 28 hari pertama. Pastikan bayi diperiksa tenaga kesehatan pada:",
        poin: ["0–6 jam setelah lahir", "6–48 jam setelah lahir", "Hari ke-3 – 7", "Hari ke-8 – 28"],
        halaman: 40,
      },
      {
        judul: "Layanan penting untuk bayi",
        poin: [
          "Imunisasi Hepatitis B (HB0) sebelum 24 jam.",
          "Skrining Penyakit Jantung Bawaan (PJB) kritis: 24–48 jam.",
          "Skrining Hipotiroid Kongenital (SHK): 48–72 jam.",
        ],
        halaman: 40,
      },
      {
        judul: "Tidur yang aman",
        nada: "tips",
        teks: "Bayi bisa tidur sampai 16 jam sehari.",
        poin: ["Tidur telentang.", "Pakai alas yang rata.", "Jauhkan benda yang bisa menutupi kepala.", "Pakai kelambu."],
        halaman: 40,
      },
      ...lembarBahaya("Tanda bahaya bayi 0–28 hari", "Kalau bayi mengalami salah satu tanda ini, segera bawa ke bidan, dokter, atau perawat."),
    ],
  },
  {
    slug: "perawatan-bayi",
    judul: "Merawat bayi sehari-hari",
    sub: "Hangat, tali pusat, metode kanguru, warna tinja",
    tahap: ["nifas"],
    kategori: "Bayi",
    tema: "teal",
    halaman: 46,
    sampul: "tinja",
    ringkas: [
      "Mandikan dengan air hangat 6 jam setelah lahir bila stabil; sebelum tali pusat lepas cukup dilap.",
      "Rawat tali pusat terbuka dan kering, jangan diberi apa pun.",
      "Bayi < 2.500 gram: lakukan perawatan metode kanguru.",
      "Tinja pucat (nomor 1–3) sampai usia 4 bulan: segera ke dokter.",
    ],
    lembar: [
      {
        judul: "Jaga bayi tetap hangat",
        poin: [
          "Mandikan dengan air hangat 6 jam setelah lahir, bila kondisi stabil.",
          "Sebelum tali pusat lepas, cukup dilap.",
          "Pakaikan baju dan selimut; topi dan kaos kaki bila dingin.",
          "Segera ganti baju dan popok yang basah.",
          "AC sekitar 25–26 °C; kipas angin jangan langsung ke bayi.",
        ],
        halaman: 46,
      },
      {
        judul: "Merawat tali pusat",
        nada: "tips",
        poin: [
          "Cuci tangan dengan sabun sebelum dan sesudah memegang bayi.",
          "Jangan beri apa pun pada tali pusat.",
          "Biarkan terbuka dan kering.",
          "Kalau kotor atau basah, cuci dengan air bersih dan sabun, lalu keringkan.",
        ],
        halaman: 46,
      },
      {
        judul: "Metode kanguru untuk bayi kecil",
        gambar: "kanguru",
        teks: "Untuk bayi lahir < 2.500 gram atau < 37 minggu: dekap bayi di dada, kulit ke kulit, supaya tetap hangat dan lebih banyak menyusu.",
        halaman: 46,
      },
      {
        judul: "Kanguru bisa bergantian",
        kisi: [
          { gambar: "kanguru-ayah", label: "Ayah bisa bergantian" },
          { gambar: "kanguru-aktivitas", label: "Bisa sambil beraktivitas" },
          { gambar: "kanguru-tidur", label: "Saat tidur dan istirahat" },
          { gambar: "kanguru-gendong", label: "Bayi dalam gendongan kanguru" },
        ],
        halaman: 46,
      },
      {
        judul: "Periksa warna tinja",
        warnaTinja: true,
        teks: "Lihat warna tinja setiap hari sampai bayi berumur 4 bulan. Kalau pucat seperti nomor 1–3, segera bawa ke dokter.",
        aksi: { label: "Catat di lembar pemantauan", href: "/ibu/pantau" },
        halaman: 47,
      },
    ],
  },
];

/** Warna tinja seperti kartu di Buku KIA hlm. 47 (nomor 1–3 pucat = segera ke dokter). Warna layar bisa berbeda dari cetakan. */
export const WARNA_TINJA = ["#f6f0cf", "#f6ebb3", "#efe48e", "#fbe138", "#e6c12a", "#d49c2a", "#a79e34"] as const;

export function materiUntuk(kode: KodeTahap): Materi[] {
  return MATERI.filter((m) => m.tahap.includes(kode) || m.tahap.includes("semua"));
}

export function cariMateri(slug: string): Materi | undefined {
  return MATERI.find((m) => m.slug === slug);
}

export function tandaBahayaUntuk(kode: KodeTahap): TandaBahaya[] {
  return TANDA_BAHAYA.filter((t) => t.tahap.includes(kode));
}

/** Jumlah lembar termasuk sampul dan penutup. */
export function jumlahLembar(m: Materi): number {
  return m.lembar.length + 2;
}
