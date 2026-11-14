import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Bingkai, Ketuk, Latar, LogoRangkul, Muncul, PanelTeks, Ponsel, Sfx, Sorotan, TeksBertahap } from "../komponen";
import { FONT, halus, jepit, masukKeluar, W } from "../tema";

/** Lebar ponsel standar dan skala px halaman web (430) -> px layar. */
const HP = 440;
const SK = (HP - 32) / 430;
const LAYAR_H = Math.round(((HP - 32) * 932) / 430);
/** Kotak sorot di layar ponsel, koordinat halaman web. */
const kotak = (x: number, y: number, w: number, h: number, gulir = 0) => ({ x: x * SK, y: (y - gulir) * SK, w: w * SK, h: h * SK });

/* 9. Logo Rangkul. */
export const AdeganLogo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const naik = spring({ frame: f - 45, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill>
      <Latar jenis="biru" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#fff" }}>
        <div style={{ translate: `0px ${-naik * 60}px` }}>
          <LogoRangkul ukuran={220} dari={6} putih />
        </div>
        <div style={{ marginTop: 10, translate: `0px ${-naik * 40}px`, opacity: naik, fontSize: 130, fontWeight: 800, letterSpacing: "-0.03em" }}>Rangkul</div>
        <Muncul dari={70} style={{ fontSize: 42, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
          Teman Buku KIA untuk ibu, kader, bidan, dan dokter.
        </Muncul>
      </AbsoluteFill>
      <Sfx nama="whoosh" pada={4} volume={0.5} />
      <Sfx nama="ding" pada={36} volume={0.35} />
    </AbsoluteFill>
  );
};

/* 10. Satu data untuk semua. */
const SIMPUL = [
  { ikon: "🤰", nama: "Ibu", alat: "HP · web mobile", x: 960, y: 250 },
  { ikon: "🙋‍♀️", nama: "Kader", alat: "Web", x: 380, y: 560 },
  { ikon: "👩‍⚕️", nama: "Bidan", alat: "Web", x: 1540, y: 560 },
  { ikon: "🩺", nama: "Dokter", alat: "Web", x: 960, y: 870 },
];

export const AdeganSatuData: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pusat = spring({ frame: f - 10, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {SIMPUL.map((s, k) => {
          const t = interpolate(f, [40 + k * 10, 75 + k * 10], [0, 1], { ...jepit, easing: halus });
          const x2 = 960 + (s.x - 960) * t;
          const y2 = 560 + (s.y - 560) * t;
          return (
            <g key={k}>
              <line x1={960} y1={560} x2={x2} y2={y2} stroke={W.brand} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
              {[0, 1, 2].map((d) => {
                const p = ((f - 80 - d * 20 + k * 7) % 60) / 60;
                if (f < 80 || t < 1) return null;
                const arahKeluar = (k + d) % 2 === 0;
                const q = arahKeluar ? p : 1 - p;
                return <circle key={d} cx={960 + (s.x - 960) * q} cy={560 + (s.y - 560) * q} r={9} fill={k === 0 ? W.rose : W.brand} />;
              })}
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 960 - 200,
          top: 560 - 110,
          width: 400,
          height: 220,
          borderRadius: 40,
          background: "#fff",
          boxShadow: "0 40px 80px -30px rgba(47,138,245,0.55)",
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 30px",
          scale: String(pusat),
          fontFamily: FONT,
        }}
      >
        <LogoRangkul ukuran={110} dari={10} />
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, color: W.ink, lineHeight: 1.15 }}>Satu catatan Buku KIA</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: W.muted, marginTop: 6 }}>tersimpan aman, tersambung realtime</div>
        </div>
      </div>
      {SIMPUL.map((s, k) => (
        <Muncul key={s.nama} dari={70 + k * 10} arah="skala" style={{ position: "absolute", left: s.x - 150, top: s.y - 70 }}>
          <div style={{ width: 300, padding: "18px 20px", borderRadius: 28, background: "#fff", boxShadow: "0 20px 44px -22px rgba(15,40,90,0.4)", display: "flex", alignItems: "center", gap: 16, fontFamily: FONT }}>
            <div style={{ fontSize: 56, width: 84, height: 84, borderRadius: 22, background: k === 0 ? W.roseSoft : W.brandSoft, display: "grid", placeItems: "center" }}>{s.ikon}</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: W.ink }}>{s.nama}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: k === 0 ? W.rose : W.brand }}>{s.alat}</div>
            </div>
          </div>
        </Muncul>
      ))}
      <AbsoluteFill style={{ fontFamily: FONT }}>
        <TeksBertahap teks="Satu catatan," dari={120} style={{ position: "absolute", left: 110, top: 90, fontSize: 64, fontWeight: 800, color: W.ink }} />
        <TeksBertahap teks="dipakai bersama." dari={132} sorot={["bersama."]} style={{ position: "absolute", left: 110, top: 168, fontSize: 64, fontWeight: 800, color: W.ink }} />
        <Muncul dari={190} style={{ position: "absolute", right: 110, bottom: 90, width: 560, fontSize: 32, lineHeight: 1.35, color: W.muted, fontWeight: 500, textAlign: "right" }}>
          Isian ibu di HP langsung muncul di layar bidan. Hasil periksa bidan langsung terlihat oleh ibu.
        </Muncul>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* Tata letak umum adegan Ibu: teks kiri, ponsel kanan. */
const TataIbu: React.FC<{ panel: React.ReactNode; ponsel: React.ReactNode; sorotan?: React.ReactNode }> = ({ panel, ponsel, sorotan }) => (
  <AbsoluteFill>
    <Latar jenis="terang" />
    <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>{panel}</div>
    <div style={{ position: "absolute", left: 1000, top: (1080 - LAYAR_H - 32) / 2 }}>{ponsel}</div>
    {sorotan}
  </AbsoluteFill>
);

/* 11. Ibu masuk dengan PIN. */
export const AdeganIbuMasuk: React.FC = () => {
  const f = useCurrentFrame();
  const pin = f >= 160 ? 1 : 0;
  const lapisPin = interpolate(f, [130, 145], [0, 1], { ...jepit, easing: halus });
  const terisi = Math.floor(interpolate(f, [160, 220], [0, 6], jepit));
  const beranda = interpolate(f, [235, 250], [0, 1], { ...jepit, easing: halus });
  return (
    <TataIbu
      panel={
        <PanelTeks
          label="Untuk Ibu · HP"
          warnaLabel={W.rose}
          latarLabel={W.roseSoft}
          judul="Masuk cukup dengan nomor HP dan PIN."
          sorot={["nomor", "HP", "PIN."]}
          dari={6}
          poin={["Tampilan web yang ringan di HP", "Buku tertinggal? Catatan tetap ada di akun Ibu", "Ibu hanya melihat datanya sendiri"]}
        />
      }
      ponsel={
        <Ponsel src="layar/ibu-masuk.jpg" lebar={HP} tutupLencana>
          <Ketuk x={215} y={776} pada={118} skala={SK} />
          <div style={{ position: "absolute", inset: 0, background: W.brand, opacity: lapisPin, fontFamily: FONT, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 90 }}>
            <div style={{ width: 70, height: 70, borderRadius: 99, background: "#fff", display: "grid", placeItems: "center", fontSize: 34 }}>🔒</div>
            <div style={{ marginTop: 26, fontSize: 34, fontWeight: 800 }}>Masukkan PIN</div>
            <div style={{ marginTop: 10, fontSize: 18, opacity: 0.85 }}>PIN 6 angka milik Ibu</div>
            <div style={{ display: "flex", gap: 18, marginTop: 36 }}>
              {[...Array(6)].map((_, k) => (
                <div key={k} style={{ width: 22, height: 22, borderRadius: 99, border: "3px solid #fff", background: k < terisi * pin ? "#fff" : "transparent" }} />
              ))}
            </div>
            <div style={{ marginTop: 50, display: "grid", gridTemplateColumns: "repeat(3, 92px)", gap: 20 }}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((n, k) => (
                <div key={k} style={{ width: 92, height: 92, borderRadius: 99, background: n && n !== "⌫" ? "#fff" : "transparent", color: W.ink, display: "grid", placeItems: "center", fontSize: 36, fontWeight: 600 }}>
                  {n === "⌫" ? <span style={{ color: "#fff" }}>{n}</span> : n}
                </div>
              ))}
            </div>
          </div>
          <Img src={staticFile("layar/ibu-beranda.jpg")} style={{ position: "absolute", left: 0, top: 0, width: HP - 32, opacity: beranda }} />
          <Img src={staticFile("layar/ibu-beranda-nav.jpg")} style={{ position: "absolute", left: 0, bottom: 0, width: HP - 32, opacity: beranda }} />
        </Ponsel>
      }
      sorotan={
        <>
          <Sorotan teks="PIN 6 angka" sub="Tanpa kata sandi yang rumit" ikon="🔢" warna={W.rose} dari={165} sampai={240} style={{ left: 1470, top: 430 }} />
          <Sorotan teks="Langsung ke beranda" sub="Data Ibu siap dipakai" ikon="🏠" warna={W.brand} dari={255} style={{ left: 1470, top: 600 }} />
        </>
      }
    />
  );
};

/* 12. Beranda Ibu. */
export const AdeganBeranda: React.FC = () => {
  const gulir = { f: [0, 190, 250, 330, 390], y: [0, 0, 300, 300, 458] };
  return (
    <TataIbu
      panel={
        <PanelTeks
          label="Beranda Ibu"
          warnaLabel={W.rose}
          latarLabel={W.roseSoft}
          judul="Isi Buku KIA, kini dalam genggaman."
          sorot={["genggaman."]}
          dari={6}
          jedaPoin={60}
          poin={["Usia kehamilan & HPL dihitung otomatis", "Tanda bahaya langsung diberi warna", "Apa yang perlu dilakukan hari ini", "Hasil periksa terakhir dari bidan"]}
        />
      }
      ponsel={
        <Ponsel src="layar/ibu-beranda.jpg" nav="layar/ibu-beranda-nav.jpg" lebar={HP} gulir={gulir}>
          <Bingkai {...kotak(16, 84, 398, 264)} dari={40} sampai={110} warna={W.merah} radius={22} />
          <Bingkai {...kotak(16, 368, 398, 232)} dari={115} sampai={185} warna={W.brand} radius={22} />
          <Bingkai {...kotak(16, 620, 398, 214, 300)} dari={255} sampai={325} warna={W.teal} radius={22} />
          <Bingkai {...kotak(16, 890, 398, 160, 458)} dari={395} warna={W.ungu} radius={22} />
        </Ponsel>
      }
      sorotan={
        <>
          <Sorotan teks="Peringatan Merah" sub="TD 145/95 + protein urine" ikon="⚠️" warna={W.merah} dari={45} sampai={110} style={{ left: 1470, top: 200 }} />
          <Sorotan teks="Hamil 34 minggu" sub="Trimester 3 · HPL otomatis" ikon="🤰" warna={W.brand} dari={120} sampai={185} style={{ left: 1470, top: 430 }} />
          <Sorotan teks="Hari ini" sub="Periksa 2 hari lagi" ikon="📅" warna={W.teal} dari={258} sampai={325} style={{ left: 1470, top: 300 }} />
          <Sorotan teks="Hasil periksa" sub="Tekanan darah & berat badan" ikon="📊" warna={W.ungu} dari={398} style={{ left: 1470, top: 220 }} />
        </>
      }
    />
  );
};

/* 13. Pantau bergambar. */
export const AdeganPantau: React.FC = () => {
  const G = 260;
  const gulir = { f: [0, 70, 120], y: [0, 0, G] };
  return (
    <TataIbu
      panel={
        <PanelTeks
          label="Pantau mingguan"
          warnaLabel={W.rose}
          latarLabel={W.roseSoft}
          judul="Cukup ketuk gambar keluhan yang dialami."
          sorot={["ketuk", "gambar"]}
          dari={6}
          jedaPoin={55}
          poin={["Gambar asli dari lembar pemantauan Buku KIA", "Tanpa kotak centang, mudah untuk semua ibu", "Keluhan berbahaya langsung sampai ke bidan"]}
        />
      }
      ponsel={
        <Ponsel src="layar/ibu-pantau.jpg" nav="layar/ibu-pantau-nav.jpg" lebar={HP} gulir={gulir}>
          <Bingkai {...kotak(14, 215, 198, 207)} dari={30} sampai={70} warna={W.hijau} radius={20} />
          <Ketuk x={112} y={823 - G} pada={170} skala={SK} />
          <Bingkai {...kotak(16, 716, 196, 220, G)} dari={176} warna={W.kuningCerah} radius={20} />
          <Ketuk x={318} y={610 - G} pada={250} skala={SK} />
          <Bingkai {...kotak(220, 518, 197, 186, G)} dari={256} warna={W.merah} radius={20} />
        </Ponsel>
      }
      sorotan={
        <>
          <Sorotan teks="Sudah periksa" sub="Pelayanan minggu ini" ikon="✅" warna={W.hijau} dari={32} sampai={75} style={{ left: 1470, top: 230 }} />
          <Sorotan teks="Sulit tidur" sub="Dicatat sebagai Kuning" ikon="🟡" warna={W.kuningCerah} dari={180} style={{ left: 1470, top: 560 }} />
          <Sorotan teks="Pusing berat" sub="Merah → bidan diberi tahu" ikon="🔴" warna={W.merah} dari={260} style={{ left: 1470, top: 330 }} />
        </>
      }
    />
  );
};

/* 14. Buku edukasi yang bisa dibalik. */
const LembarBalik: React.FC<{ src: string; mulai: number; pudar?: boolean }> = ({ src, mulai, pudar }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [mulai, mulai + 22], [0, 1], { ...jepit, easing: masukKeluar });
  if (t >= 1) return null;
  if (pudar) return <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: HP - 32, opacity: 1 - t, scale: String(1 + t * 0.08) }} />;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: HP - 32,
          transformOrigin: "0% 50%",
          rotate: `0 1 0 ${-t * 95}deg`,
          filter: `brightness(${1 - t * 0.35})`,
        }}
      />
    </div>
  );
};

export const AdeganEdukasi: React.FC = () => {
  return (
    <TataIbu
      panel={
        <PanelTeks
          label="Buku edukasi"
          warnaLabel={W.rose}
          latarLabel={W.roseSoft}
          judul="Belajar dari buku bergambar yang bisa dibalik."
          sorot={["bergambar", "dibalik."]}
          dari={6}
          jedaPoin={55}
          poin={["13 buku sesuai tahap: hamil, melahirkan, nifas, menyusui, bayi", "Ilustrasi dari Buku KIA 2024, bahasanya disederhanakan", "Setiap lembar menyebut halaman bukunya"]}
        />
      }
      ponsel={
        <Ponsel src="layar/ibu-edukasi-isi3.jpg" lebar={HP}>
          <LembarBalik src="layar/ibu-edukasi-isi2.jpg" mulai={250} />
          <LembarBalik src="layar/ibu-edukasi-sampul.jpg" mulai={130} />
          <LembarBalik src="layar/ibu-edukasi.jpg" mulai={50} pudar />
          <Ketuk x={108} y={670} pada={42} skala={SK} />
          <Ketuk x={370} y={887} pada={124} skala={SK} />
          <Ketuk x={370} y={887} pada={244} skala={SK} />
        </Ponsel>
      }
      sorotan={
        <>
          <Sorotan teks="Hamil 7–9 bulan" sub="Buku KIA hlm. 19" ikon="📖" warna={W.rose} dari={80} sampai={240} style={{ left: 1470, top: 260 }} />
          <Sorotan teks="Dibalik seperti kertas" sub="Geser atau tekan Lanjut" ikon="👆" warna={W.brand} dari={150} style={{ left: 1470, top: 600 }} />
        </>
      }
    />
  );
};

/* 15. Jadwal, grafik, tanda bahaya. */
export const AdeganJadwal: React.FC = () => {
  const lebar = 380;
  const sk = (lebar - 32) / 430;
  const tinggi = Math.round(((lebar - 32) * 932) / 430) + 32;
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
        <TeksBertahap
          teks="Jadwal, grafik, dan tanda bahaya tidak lagi terlewat."
          dari={6}
          sorot={["tidak", "lagi", "terlewat."]}
          warnaSorot={W.rose}
          style={{ marginTop: 56, fontSize: 60, fontWeight: 800, color: W.ink }}
        />
      </AbsoluteFill>
      <Muncul dari={20} arah="bawah" jarak={80} style={{ position: "absolute", left: 520, top: 1080 - tinggi - 50 }}>
        <Ponsel src="layar/ibu-jadwal-grafik.jpg" nav="layar/ibu-jadwal-grafik-nav.jpg" lebar={lebar} gulir={{ f: [0, 140, 210], y: [0, 0, 690] }}>
          <Bingkai x={14 * sk} y={566 * sk} w={402 * sk} h={64 * sk} dari={70} sampai={135} warna={W.brand} radius={16} />
        </Ponsel>
      </Muncul>
      <Muncul dari={40} arah="bawah" jarak={80} style={{ position: "absolute", left: 1020, top: 1080 - tinggi - 50 }}>
        <Ponsel src="layar/ibu-tanda-bahaya.jpg" nav="layar/ibu-tanda-bahaya-nav.jpg" lebar={lebar} gulir={{ f: [0, 250, 320], y: [0, 0, 820] }} />
      </Muncul>
      <Sorotan teks="Jadwal otomatis" sub="K1–K6 · KF1–KF4 · KN1–KN3" ikon="🗓️" warna={W.brand} dari={70} style={{ left: 70, top: 380 }} />
      <Sorotan teks="Grafik berat badan" sub="Dibanding target, hlm. 108" ikon="📈" warna={W.teal} dari={215} style={{ left: 70, top: 560 }} />
      <Sorotan teks="Tanda bahaya" sub="Dengan tombol telepon 119" ikon="🚨" warna={W.merah} dari={110} style={{ left: 1440, top: 380 }} />
      <Sorotan teks="Bergambar" sub="Dikenali tanpa banyak membaca" ikon="🖼️" warna={W.rose} dari={325} style={{ left: 1440, top: 560 }} />
    </AbsoluteFill>
  );
};
