# Video demo Rangkul (Remotion)

Video animasi ±4 menit 40 detik (1920×1080, 30 fps) untuk mendemokan Rangkul:

1. **Masalah (0:00–1:18)**: Buku KIA harus dibawa ke setiap kunjungan, bisa basah (tinta luntur), bisa tertinggal/hilang, dan catatan ibu–kader–bidan–puskesmas tidak saling terhubung.
2. **Solusi (1:18–4:40)**: Rangkul. Tampilan Ibu memakai web versi HP (masuk dengan PIN, beranda, pantau bergambar, buku edukasi, jadwal & tanda bahaya). Tampilan kader/bidan/dokter memakai web desktop (dasbor Merah/Kuning/Hijau, detail ibu, foto Buku KIA → draf AI → konfirmasi, pengingat WhatsApp). Ditutup dengan rangkuman masalah yang terjawab, diagram arsitektur (pengguna → Next.js dengan mesin aturan → Supabase, Gemini, WhatsApp; tanpa VO), privasi & etika, dan logo.

Semua tangkapan layar diambil dari aplikasi asli dalam **mode demo (data fiktif)**. Musik latar dibuat secara sintetis oleh `scripts/buat-musik.mjs` (bebas hak cipta); efek suara dari `remotion.media`.

## Render

```bash
cd video
npm install
npm run render          # hasil: video/out/rangkul-demo.mp4 (1080p)
```

Render 1080p di laptop biasa memakan waktu sekitar 10–25 menit. Untuk pratinjau cepat 720p: `npm run render:cepat`.

## Voice over (VO)

VO dibuat terpisah dari render, lalu digabung ke video yang sudah jadi. Waktu tiap kalimat dihitung dari `src/durasi.json`, berkas yang sama yang dipakai video, jadi selalu pas dengan adegannya.

```bash
pip install edge-tts      # sekali saja (TTS Microsoft Edge, suara id-ID-GadisNeural, gratis)
npm run vo                # buat public/vo/<adegan>.mp3, public/vo/vo-lengkap.mp3, vo/subtitle.srt
npm run render            # bila belum
npm run gabung            # hasil: out/rangkul-demo-vo.mp4 (musik otomatis mengecil saat VO berbicara)
```

- Naskah ada di `vo/naskah.json`: `teks` per adegan dan `jeda` (detik setelah adegan mulai). Adegan yang tidak ada di naskah (mis. `22-Arsitektur`) tampil tanpa VO. Ganti suara di `suara` (mis. `id-ID-ArdiNeural` untuk suara laki-laki) atau atur `kecepatan` (mis. `"+5%"`). Setelah mengubah teks, jalankan `python scripts/buat-vo.py --ulang`.
- **Merekam suara sendiri:** simpan satu berkas per kalimat sebagai `public/vo/<id>.mp3` atau `.wav` (contoh `public/vo/01-Pembuka.wav`), lalu `npm run vo:rekaman`. Kalimat yang terlalu panjang untuk adegannya dipercepat sedikit (maks. 1,2×) dan muncul peringatan.
- Subtitle sebagai trek terpisah: `npm run gabung:subtitle`. Volume VO: `node scripts/gabung-vo.mjs --vo-volume=1.3`.
- Nama berkas lain: `node scripts/gabung-vo.mjs out/rangkul-demo-720p.mp4 out/rangkul-720p-vo.mp4`.

Melihat dan menyunting di Remotion Studio (setiap adegan juga ada sebagai komposisi tersendiri di folder **Adegan**):

```bash
npm run dev
```

## Struktur

```
src/
  Root.tsx            komposisi utama "Rangkul" + tiap adegan
  Video.tsx           urutan adegan dengan transisi + musik latar
  durasi.json         durasi tiap adegan (dipakai video dan VO; ubah di sini untuk memendekkan/memanjangkan)
  daftar-adegan.ts    urutan adegan dan transisinya
  tema.ts             warna (sama dengan globals.css aplikasi), font Plus Jakarta Sans
  komponen.tsx        bingkai ponsel, jendela browser, sorotan, Buku KIA, logo, kursor
  adegan/masalah.tsx      babak 1
  adegan/solusi-ibu.tsx   logo, satu data, layar Ibu
  adegan/solusi-nakes.tsx layar kader/bidan/dokter, rangkuman, privasi, penutup
  adegan/arsitektur.tsx   diagram arsitektur (di balik layar)
public/layar/         tangkapan layar aplikasi
public/musik/         musik latar (dibuat ulang dengan npm run musik)
public/sfx/           efek suara
public/vo/            suara VO per adegan + trek lengkap (dibuat npm run vo)
vo/naskah.json        naskah VO
scripts/              ambil tangkapan layar, buat musik, buat & gabung VO, cek frame
```

## Mengambil ulang tangkapan layar

Bila tampilan aplikasi berubah:

1. Dari folder akar proyek jalankan server demo (Supabase dikosongkan, data contoh di browser):
   `node video/scripts/server-demo.cjs` (port 3300).
2. Di folder `video/`: `npm run tangkap`. Skrip masuk sebagai Siti Aminah (layar HP 430×932) dan Bidan Lestari (desktop 1440×900).
3. Layar `ibu-masuk.jpg` diambil manual dari mode tersambung (mode demo tidak punya layar masuk).

Bila durasi total berubah, sesuaikan argumen `npm run musik` (`<detik_total> <detik_mulai_babak_solusi>`).
