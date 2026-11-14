# Rangkul: Buku KIA yang tidak berhenti di kertas

> Logicodix 2026 · Subtema **Inclusive Health & Well-being** · Tim **TUNG3SAHOOR**

Rangkul (MVP) mengubah isian **Buku KIA Kemenkes 2024** menjadi daftar tugas harian untuk kader, bidan, dan dokter. Tujuannya agar **tidak ada ibu hamil, ibu nifas, atau bayi baru lahir di wilayah posyandu yang terlewat**. Rangkul terdiri dari dua aplikasi yang memakai aturan klinis yang sama:

- **Web** (Next.js, folder ini): kader dan nakes melihat siapa yang **Merah** (hubungi hari ini), **Kuning** (cek kunjungan terdekat), dan **Hijau**. Ibu juga bisa memakai tampilan sederhananya di web: sedang di tahap apa, apa yang perlu dilakukan hari ini, dan tanda bahaya.
- **Aplikasi Android Rangkul** (React Native/Expo, folder [`mobile/`](mobile/)): tampilan ibu yang sama sebagai aplikasi HP, termasuk buku bergambar yang dibalik seperti kertas.

- **Demo:** _isi URL deploy di sini_ (mis. `https://momcare-xxx.vercel.app`)
- **Video demo:** _opsional_

## Tim

| Nama | Peran |
| --- | --- |
| _isi nama_ | _mis. Product & riset_ |
| _isi nama_ | _mis. Frontend_ |
| _isi nama_ | _mis. Data & aturan klinis_ |

## Masalah

Buku KIA berisi jadwal kunjungan (K1–K6, KF1–KF4, KN1–KN3), lembar pemantauan, dan tanda bahaya, tetapi semuanya di kertas. Kader sulit tahu ibu mana yang terlambat periksa, hasil tekanan darah tinggi tidak langsung sampai ke bidan, dan keluarga sering tidak ikut diingatkan.

## Fitur utama

| Fitur | Untuk | Keterangan |
| --- | --- | --- |
| **Tahap otomatis** | semua | T1 ≤ 12 mgg, T2 > 12–24, T3 > 24, nifas 0–42 hari, bayi 0–28 hari. HPL dari USG T1 → dokter T1 → HPHT + 280 hari. |
| **Mesin peringatan Merah/Kuning** | kader, bidan, dokter | ±30 aturan dari Buku KIA & kamus data: TD ≥ 140/90, Hb, LiLA, DJJ, preeklamsia (hlm. 102), DM gestasional, tripel eliminasi, skrining jiwa, lembar pemantauan, nifas, neonatal, BBLR, warna tinja, rujukan tanpa rujukan balik, kunjungan terlambat. Setiap peringatan menautkan halaman Buku KIA. |
| **Jadwal kunjungan** | semua | K1–K6 (1× T1, 2× T2, 3× T3) + dokter T1/T3, skrining preeklamsia & DM, KF1–KF4, KN1–KN3. Status: selesai / jatuh tempo / terlambat. |
| **Foto Buku KIA → AI → konfirmasi** | kader, bidan | Foto dikompres di perangkat (≤ 1600 px), dibaca Gemini dengan **skema JSON dari kamus data**, nilai keyakinan per kolom (< 85 % diberi kotak kuning). Tanpa kunci Gemini, foto dibaca **di perangkat dengan Tesseract** (tidak dikirim ke server) dan semua isiannya ditandai untuk dicek. Hasil **selalu draf** sampai dikonfirmasi; nama & waktu konfirmasi dicatat; foto dihapus setelahnya. |
| **Form dari kamus data** | semua | 28 tabel / 327 kolom → form, validasi rentang, pilihan, kolom wajib, isian otomatis (HPL, IMT, MAP, skor preeklamsia). |
| **Lembar pemantauan ibu** | ibu | Ceklis mingguan hamil, harian nifas, harian bayi, persiapan P4K, KB, warna tinja. |
| **Tindak lanjut & penutupan** | kader → bidan/dokter | Kader mencatat tindak lanjut (bila ibu menolak/tak bisa dihubungi → diteruskan ke bidan). **Hanya bidan/dokter yang bisa menutup peringatan.** |
| **Pengingat WhatsApp** | kader, bidan | H-2, H, H+2 dari tanggal kembali ke ibu **dan** suami/keluarga lewat tautan `wa.me` (tanpa biaya API). Pesan tidak berisi data sensitif. |
| **Grafik** | nakes, ibu | Kenaikan BB vs target IMT pra-hamil (hlm. 108), TFU & DJJ. |
| **Edukasi bergambar (flipbook)** | ibu | 13 "buku" per tahap (hamil T1–T3, P4K, melahirkan, nifas, menyusui, ASI perah, bayi baru lahir, perawatan bayi, kesehatan jiwa, KB) yang dibalik seperti buku: geser atau tombol Lanjut. Ilustrasi diambil dari Buku KIA 2024, bahasa disederhanakan, setiap lembar menyebut halaman bukunya. Tanda bahaya juga ditampilkan dengan gambar. |
| **Pantau bergambar** | ibu | Lembar pemantauan mingguan/harian memakai gambar kolom asli Buku KIA (hlm. 10–11, 28–31, 42–45): ibu cukup mengetuk gambar keluhan yang dialami, tanpa kotak centang. |
| **Catatan (Buku KIA Saya)** | ibu | Semua catatan ibu dikelompokkan per bab dengan warna mengikuti buku. Jadwal kunjungan dan grafik ada di halaman tersendiri supaya isi pemeriksaan tidak tampil dua kali. |

## Etika, privasi & keamanan

- **Persetujuan ibu wajib** sebelum data disimpan (teks dibacakan, saksi = kader/bidan yang login, versi teks dicatat).
- **NIK disimpan sebagai hash SHA-256**; yang ditampilkan hanya 4 digit terakhir.
- **Akses berbasis peran**: kader hanya melihat ibu di posyandunya; bidan sesuai wilayah kerja; dokter seluruh puskesmas; ibu hanya datanya sendiri dan **tidak bisa mengubah hasil pemeriksaan**.
- **Data sensitif** (tripel eliminasi HIV/sifilis/hepatitis B, skrining kesehatan jiwa) hanya terlihat oleh bidan/dokter, tidak diekstrak oleh OCR, dan tidak pernah ikut pesan WhatsApp ke keluarga.
- **AI tidak membuat keputusan klinis**: OCR hanya mengusulkan draf; keputusan peringatan berasal dari aturan yang dapat diaudit (`src/lib/aturan.ts`) dengan rujukan halaman Buku KIA.
- **Jejak audit**: setiap catatan menyimpan pembuat, sumber (ketik manual / foto OCR), siapa yang mengonfirmasi, dan riwayat perubahan.
- Kunci API hanya di server (`/api/ocr`), dibatasi ukuran gambar & laju permintaan.
- Semua data demo **fiktif**.

## Teknologi

Aplikasi Ibu (`mobile/`): **Expo SDK 58** · **React Native 0.88** (New Architecture) · Expo Router · Reanimated 4 + Gesture Handler 3 (flipbook dihitung di thread UI) · react-native-svg (grafik & ilustrasi) · expo-image · AsyncStorage.

Web:

- **Next.js 16** (App Router, Turbopack, Cache Components) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · `motion` · `lucide-react` · `recharts` · `sonner` · Radix Dialog
- **zustand** (persist ke `localStorage` di mode demo)
- **Supabase** (opsional): Postgres + Row Level Security, Auth (PIN ibu / sandi petugas), Realtime; skema di `supabase/migrations/`
- **Google Gemini** (`@google/genai`, structured output `responseJsonSchema`) untuk OCR tulisan tangan
- **Tesseract.js** sebagai OCR cadangan di peramban bila `GEMINI_API_KEY` tidak diisi (baik untuk huruf cetak, lemah untuk tulisan tangan)
- `date-fns` (locale `id`)

## Arsitektur

```mermaid
flowchart LR
  subgraph Browser["Browser (PWA-ready, local-first)"]
    UI["UI per peran<br/>ibu · kader · bidan · dokter"]
    Form["KamusForm<br/>(form dari kamus data)"]
    Store["zustand store<br/>localStorage"]
    Engine["Mesin aturan<br/>tahap · jadwal · peringatan"]
    Akses["Kontrol akses<br/>peran · wilayah · sensitif"]
    Kompres["Kompres foto<br/>≤1600 px"]
  end
  Kamus[("kamus-data-momcare.json<br/>28 tabel · 327 kolom")]
  API["/api/ocr<br/>(Next.js Route Handler)"]
  Gemini["Google Gemini<br/>vision + JSON schema"]
  WA["wa.me<br/>(WhatsApp)"]
  PDF["Buku KIA 2024 (PDF)"]

  Kamus --> Form & Engine & API
  UI --> Form --> Store
  Store --> Engine --> UI
  Akses --> UI
  UI --> Kompres --> API --> Gemini
  API -- "draf + keyakinan" --> UI
  UI -- "pengingat" --> WA
  UI -- "tautan halaman" --> PDF
```

Struktur penting:

```
src/
  app/
    page.tsx               landing
    masuk/                 pemilih akun demo
    ibu/                   tampilan ibu (beranda, pantau, persiapan, hasil, edukasi, profil, kb)
    app/                   tampilan kader/bidan/dokter
      ibu/[id]/            detail ibu + isi/[tabel] (form generik)
      foto/                foto Buku KIA → OCR → konfirmasi
      daftar/              pendaftaran ibu (persetujuan → identitas → keluarga → kehamilan)
      pengingat/  kamus/
    api/ocr/route.ts       OCR Gemini (atau mode demo)
  lib/                     dipakai bersama oleh web dan aplikasi Ibu
    kamus.ts  aturan.ts  jadwal.ts  tahap.ts  skrining.ts  akses.ts  store.ts  seed.ts ...
    penyimpanan.ts / .native.ts   localStorage di web, AsyncStorage di Android
  data/kamus-data-momcare.json, edukasi.ts (isi flipbook), gambar-kia.ts (daftar ilustrasi)
  components/ilustrasi.tsx  ikon bergambar buatan tim (SVG) untuk menu Fitur dan keadaan kosong
public/kia/                ilustrasi Buku KIA 2024 (WebP, ±1,4 MB total)
scripts/cek-aturan.ts      uji mesin peringatan terhadap data demo
mobile/                    aplikasi Android Rangkul (Expo)
  src/app/                 layar (Expo Router): masuk, ibu/(tab) beranda·fitur·catatan·profil,
                           pantau, persiapan, hasil, kb, tanda-bahaya, edukasi/[slug], profil/*
  src/ui/                  komponen native (kartu, flipbook, lembar materi, grafik SVG, ilustrasi)
  metro.config.js          alias @/ → ../src supaya aturan klinis tidak disalin
  scripts/build-apk.mjs    membuat APK rilis di komputer sendiri
  plugins/cmake-baru.js    plugin Expo: CMake 3.31 untuk semua modul native (jalur panjang di Windows)
```

Aplikasi Ibu **tidak menyalin** logika klinis: `@/lib/...` dan `@/data/...` di `mobile/` menunjuk langsung ke `src/` proyek web lewat Metro, dan ilustrasi diambil dari `public/kia/`. Mengubah aturan di `src/lib/aturan.ts` berlaku untuk kedua aplikasi.

## Menjalankan secara lokal

Prasyarat: Node.js ≥ 20.

```bash
git clone <repo-ini>
cd tung3sahoor
npm install
cp .env.example .env.local   # opsional: isi GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Perintah lain:

```bash
npm run build && npm start   # build produksi
npm run lint                 # ESLint
npm run typecheck            # TypeScript
npm run cek                  # cetak hasil mesin peringatan untuk data demo
```

### Aplikasi Android (Rangkul)

```bash
cd mobile
npm install
npx expo start               # pindai QR dengan Expo Go di HP Android, atau tekan "a" untuk emulator
npm run typecheck && npm run lint
```

Membuat APK untuk dibagikan (butuh Android SDK dan JDK 17+; di Windows JDK bawaan Android Studio dipakai otomatis):

```bash
cd mobile
npm run build:apk            # hasil: mobile/dist/rangkul.apk
```

APK ditandatangani dengan kunci debug: cukup untuk demo dan dipasang langsung, bukan untuk Play Store (untuk itu pakai EAS Build). Folder `mobile/android/` dibuat ulang dari `app.json` saat build dan tidak disimpan di git. Kode native hanya dikompilasi untuk arm64 (ponsel); untuk emulator tambahkan `x86_64` lewat `ARSITEKTUR=arm64-v8a,x86_64`.

Catatan Windows: kode C++ New Architecture menghasilkan jalur berkas di atas 260 karakter, jadi build butuh:

- CMake **3.31.6** di Android SDK (Android Studio → SDK Manager → SDK Tools → centang *Show Package Details* → CMake 3.31.6). Ninja di CMake 3.22 bawaan belum mendukung jalur panjang; plugin `mobile/plugins/cmake-baru.js` memaksa semua modul memakai 3.31.6.
- Jalur panjang aktif di Windows (`LongPathsEnabled = 1`, lihat dokumentasi Microsoft "Maximum Path Length Limitation").
- Bila proyek berada di folder yang dalam, skrip menyalin `mobile/`, `src/`, dan `public/kia/` ke `C:\mi` (ganti lewat `FOLDER_BUILD`) dan membangun di sana; salinan berikutnya hanya memperbarui yang berubah. Sediakan ruang disk ±10 GB untuk build pertama (NDK, CMake, dan hasil kompilasi).

### Variabel lingkungan

| Nama | Wajib | Keterangan |
| --- | --- | --- |
| `GEMINI_API_KEY` | tidak | Tanpa kunci, foto Buku KIA dibaca di perangkat dengan Tesseract. Kunci gratis dari Google AI Studio. |
| `GEMINI_MODEL` | tidak | Default `gemini-3.8-flash`. |
| `NEXT_PUBLIC_URL_APK` | tidak | Tautan unduhan APK Rangkul; bila diisi, tautan unduh muncul di tab Ibu pada layar masuk. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | tidak | Sambungkan ke Supabase (lihat di bawah). Kosong = mode demo di browser. |
| `SUPABASE_SECRET_KEY` | tidak | Hanya untuk `npm run seed:supabase` di komputer sendiri. Jangan diisi di Vercel. |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | tidak | Di `mobile/.env`, nilai sama dengan versi web, agar aplikasi Android tersambung. |

### Menyambungkan ke Supabase (data bersama web + Android)

Tanpa Supabase, Rangkul berjalan dalam **mode demo** (data contoh di perangkat masing-masing, pilih akun tanpa sandi). Dengan Supabase, data ibu, catatan, dan status peringatan tersimpan di satu database: isian ibu di HP langsung muncul di web petugas (realtime), dan akun dibuat lewat layar **Daftar**:

- **Ibu**: Syarat & Ketentuan → Lengkapi Identitas Diri (nomor HP atau email, nama, NIK, tanggal lahir, posyandu) → **buat PIN 6 angka** → konfirmasi PIN. Masuk berikutnya: nomor HP/email lalu PIN. Bila kader sudah mendaftarkan ibu dengan NIK + tanggal lahir yang sama, akun langsung tertaut ke data itu.
- **Kader / bidan / dokter** (web): Syarat & Ketentuan → nama, email, peran, posyandu, **kata sandi** (min. 8 karakter, huruf + angka).

Langkah:

1. Buat proyek di [supabase.com](https://supabase.com) (paket gratis cukup).
2. **SQL Editor** → tempel isi `supabase/migrations/20261114000000_momcare_awal.sql` → *Run*. Ini membuat tabel, Row Level Security yang meniru `src/lib/akses.ts`, trigger pendaftaran (NIK langsung disandikan SHA-256 di database), dan realtime.
3. **Authentication → Sign In / Providers → Email**: matikan **Confirm email**. Akun ibu yang memakai nomor HP disimpan sebagai `628…@hp.momcare.app` (Supabase butuh layanan SMS berbayar untuk login nomor HP), jadi tidak ada email konfirmasi yang bisa diterima.
4. **Project Settings → API Keys**: salin URL proyek dan *publishable key* ke `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) dan ke `mobile/.env` (`EXPO_PUBLIC_…`). Salin juga *secret key* ke `SUPABASE_SECRET_KEY` di `.env.local`.
5. `npm run seed:supabase` untuk membuat data contoh kecil (2 ibu, 2 petugas; lihat tabel akun di bawah). Bisa dijalankan ulang untuk mengembalikan data contoh.
6. Jalankan ulang `npm run dev` / `npx expo start`. Untuk Vercel, tambahkan dua variabel `NEXT_PUBLIC_SUPABASE_*` lalu deploy ulang.

### Deploy (Vercel)

1. Import repo di Vercel → framework terdeteksi Next.js.
2. Tambahkan `GEMINI_API_KEY` (dan opsional `GEMINI_MODEL`) di *Environment Variables*.
3. Opsional: tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` agar data tersimpan di Supabase. Tanpa keduanya, data demo dibuat di browser setiap pengguna.
4. Deploy.

## Akun demo

**Dengan Supabase** (setelah `npm run seed:supabase`; semua data fiktif):

| Akun | Peran | Masuk dengan |
| --- | --- | --- |
| **Siti Aminah** | Ibu, hamil 34 minggu (Merah: TD tinggi) | Telepon `081200000001`, PIN `246810` |
| **Dewi Puspita** | Ibu, nifas + bayi | Telepon `081200000003`, PIN `246810` |
| **Bidan Lestari Wulandari** | Bidan, Posyandu Melati & Mawar | `bidan@momcare.test`, sandi `Momcare2026` |
| **Rina Marlina** | Kader Posyandu Melati | `kader@momcare.test`, sandi `Momcare2026` |

Pemeriksaan dokter di data contoh dicatat atas nama bidan karena belum ada akun dokter; daftarkan dokter lewat layar **Daftar**. Tanggal data contoh dihitung saat skrip dijalankan, jadi jalankan ulang skrip bila usia kehamilan sudah tidak cocok.

**Mode demo** (tanpa Supabase):

Buka `/masuk` lalu pilih akun (tanpa kata sandi; data demo fiktif dan tersimpan di browser Anda). Akun ibu juga tersedia di aplikasi Rangkul (tekan **Masuk**), dengan data yang tersimpan di HP. Tombol **Kembalikan data demo** mengatur ulang semuanya.

| Akun | Peran | Yang bisa dicoba |
| --- | --- | --- |
| **Siti Aminah** | Ibu, hamil 34 minggu | Beranda tahap, "Hari ini", banner Merah (TD 145/95 + protein), lembar pemantauan, persiapan P4K, hasil periksa |
| **Dewi Puspita** | Ibu, nifas hari ke-5 + bayi | Pemantauan nifas & bayi, KF/KN, warna tinja |
| **Rina Marlina** | Kader Posyandu Melati | Hanya melihat 4 ibu Melati; foto Buku KIA; catat tindak lanjut; WA pengingat; tidak melihat data sensitif |
| **Bidan Lestari Wulandari** | Bidan (Melati & Mawar) | Semua ibu wilayahnya, rujukan menunggu balik, tutup peringatan, skrining preeklamsia, daftarkan ibu |
| **dr. Andi Pratama** | Dokter puskesmas | Seluruh wilayah, pemeriksaan dokter T1/T3, skrining DM, rujukan |

Skenario data: Siti (Merah, TD tinggi; K5 diinput lewat foto), Rahma (Merah, risiko preeklamsia; anemia; skrining jiwa sensitif; rujukan tanpa balik), Fitri (Merah, gerak bayi berkurang; KEK), Dewi (Kuning, nifas), Nur (Kuning, K2 & skrining terlambat), Ayu & Lina (Hijau; Lina di Posyandu Anggrek, tidak terlihat oleh kader/bidan Melati).

## Penggunaan AI

| Di mana | AI | Untuk apa | Batasan |
| --- | --- | --- | --- |
| Fitur **Foto Buku KIA** (`src/app/api/ocr/route.ts`) | Google Gemini (default `gemini-3.8-flash`) | Membaca tulisan tangan di tabel K1–K6, KF, KN menjadi JSON sesuai kamus data + keyakinan per kolom | Hasil hanya draf; wajib dicek & dikonfirmasi kader/nakes; nilai di luar rentang wajar diturunkan keyakinannya; kolom sensitif tidak diekstrak |
| Pengembangan | Claude Code (Anthropic) | Membantu menelaah dokumen spesifikasi & Buku KIA, menulis kode, dan pengujian | Aturan klinis ditinjau tim terhadap Buku KIA & kamus data; keputusan desain tetap oleh tim |

Mesin peringatan **tidak** memakai AI: seluruhnya aturan deterministik yang dapat diaudit.

## Catatan & keterbatasan

- Tanpa Supabase, data tersimpan di `localStorage` browser (web) dan AsyncStorage HP (aplikasi Ibu) dan **tidak saling tersambung**. Dengan Supabase, keduanya memakai database yang sama (`src/lib/awan.ts`); draf foto OCR tetap hanya di perangkat yang memotret.
- Siapa pun bisa mendaftar sebagai kader/bidan/dokter dan langsung melihat ibu di wilayah yang dipilihnya. Sebelum dipakai sungguhan, tambahkan persetujuan admin atau kode pendaftaran puskesmas.
- Kolom sensitif (tripel eliminasi, kesehatan jiwa) disembunyikan dari kader di aplikasi, tetapi RLS menyaring per baris, bukan per kolom: kader yang memanggil API langsung masih bisa membacanya. Untuk produksi, pisahkan kolom sensitif ke tabel sendiri.
- Lupa PIN/kata sandi belum ada di aplikasi; admin dapat mengatur ulang lewat dasbor Supabase (Authentication → Users).
- Beberapa level peringatan mengikuti kamus data bila berbeda dengan bagian 5b spesifikasi (mis. BBLR dan tripel eliminasi reaktif = **Merah**).
- Aturan klinis adalah alat bantu skrining, bukan pengganti penilaian tenaga kesehatan.

## Atribusi

- **Buku Kesehatan Ibu dan Anak (KIA) 2024**, Kementerian Kesehatan RI: sumber isi tabel, jadwal, tanda bahaya, dan nomor halaman. Tautan PDF di aplikasi diarahkan ke salinan publik buku tersebut.
- Ilustrasi di `public/kia/` dipotong dari PDF Buku KIA 2024 (Kemenkes RI) untuk materi edukasi, tanda bahaya, lembar pemantauan, dan potret akun demo; hak cipta ilustrasi tetap milik Kemenkes RI dan sumbernya dicantumkan di aplikasi.
- Rekomendasi anemia kehamilan merujuk WHO (2024) sebagaimana dicantumkan di spesifikasi tim.
- Ikon: [Lucide](https://lucide.dev) (ISC). Font: Plus Jakarta Sans (SIL OFL) via `next/font`.
- Pustaka open-source: Expo, React Native, Reanimated, Gesture Handler, react-native-svg, Next.js, React, Tailwind CSS, zustand, motion, recharts, sonner, Radix UI, date-fns, @google/genai (lisensi masing-masing).
