# Video demo Rangkul (Remotion)

Video animasi ±4 menit 21 detik (1920×1080, 30 fps) untuk mendemokan Rangkul:

1. **Masalah (0:00–1:18)**: Buku KIA harus dibawa ke setiap kunjungan, bisa basah (tinta luntur), bisa tertinggal/hilang, dan catatan ibu–kader–bidan–puskesmas tidak saling terhubung.
2. **Solusi (1:18–4:21)**: Rangkul. Tampilan Ibu memakai web versi HP (masuk dengan PIN, beranda, pantau bergambar, buku edukasi, jadwal & tanda bahaya). Tampilan kader/bidan/dokter memakai web desktop (dasbor Merah/Kuning/Hijau, detail ibu, foto Buku KIA → draf AI → konfirmasi, pengingat WhatsApp). Ditutup dengan rangkuman masalah yang terjawab, privasi & etika, dan logo.

Semua tangkapan layar diambil dari aplikasi asli dalam **mode demo (data fiktif)**. Musik latar dibuat secara sintetis oleh `scripts/buat-musik.mjs` (bebas hak cipta); efek suara dari `remotion.media`.

## Render

```bash
cd video
npm install
npm run render          # hasil: video/out/rangkul-demo.mp4 (1080p)
```

Render 1080p di laptop biasa memakan waktu sekitar 10–25 menit. Untuk pratinjau cepat 720p: `npm run render:cepat`.

Melihat dan menyunting di Remotion Studio (setiap adegan juga ada sebagai komposisi tersendiri di folder **Adegan**):

```bash
npm run dev
```

## Struktur

```
src/
  Root.tsx            komposisi utama "Rangkul" + tiap adegan
  Video.tsx           urutan adegan dengan transisi + musik latar
  daftar-adegan.ts    daftar adegan dan durasinya (ubah di sini untuk memendekkan/memanjangkan)
  tema.ts             warna (sama dengan globals.css aplikasi), font Plus Jakarta Sans
  komponen.tsx        bingkai ponsel, jendela browser, sorotan, Buku KIA, logo, kursor
  adegan/masalah.tsx      babak 1
  adegan/solusi-ibu.tsx   logo, satu data, layar Ibu
  adegan/solusi-nakes.tsx layar kader/bidan/dokter, rangkuman, privasi, penutup
public/layar/         tangkapan layar aplikasi
public/musik/         musik latar (dibuat ulang dengan npm run musik)
public/sfx/           efek suara
scripts/              ambil tangkapan layar, buat musik, cek frame
```

## Mengambil ulang tangkapan layar

Bila tampilan aplikasi berubah:

1. Dari folder akar proyek jalankan server demo (Supabase dikosongkan, data contoh di browser):
   `node video/scripts/server-demo.cjs` (port 3300).
2. Di folder `video/`: `npm run tangkap`. Skrip masuk sebagai Siti Aminah (layar HP 430×932) dan Bidan Lestari (desktop 1440×900).
3. Layar `ibu-masuk.jpg` diambil manual dari mode tersambung (mode demo tidak punya layar masuk).

Bila durasi total berubah, sesuaikan argumen `npm run musik` (`<detik_total> <detik_mulai_babak_solusi>`).
