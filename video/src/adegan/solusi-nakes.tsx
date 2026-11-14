import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bingkai, Kursor, Label, Laptop, Latar, LogoRangkul, Muncul, Ponsel, Sfx, Sorotan, TeksBertahap, TeksTengah } from "../komponen";
import { FONT, FONT_TANGAN, halus, jepit, W } from "../tema";

/* Tata letak laptop besar dengan judul di atas. */
const LAP = { lebar: 1300, kiri: 310, atas: 178 };

const Judul: React.FC<{ label: string; teks: string; sorot?: string[] }> = ({ label, teks, sorot }) => (
  <div style={{ position: "absolute", left: LAP.kiri, top: 48, display: "flex", alignItems: "center", gap: 26, fontFamily: FONT }}>
    <Muncul dari={2}>
      <Label teks={label} />
    </Muncul>
    <TeksBertahap teks={teks} dari={8} sorot={sorot} style={{ fontSize: 50, fontWeight: 800, color: W.ink, letterSpacing: "-0.01em" }} />
  </div>
);

/* 16. Pergantian ke tampilan nakes. */
export const AdeganNakesJudul: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ikon = spring({ frame: f - 4, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      <Latar jenis="biru" />
      <TeksTengah style={{ color: "#fff", flexDirection: "column" }}>
        <div style={{ fontSize: 120, scale: String(ikon) }}>💻</div>
        <Muncul dari={10} style={{ marginTop: 20, fontSize: 84, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Untuk kader, bidan & dokter
        </Muncul>
        <Muncul dari={24} style={{ marginTop: 14, fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
          Lewat web, di posyandu maupun puskesmas.
        </Muncul>
      </TeksTengah>
      <Sfx nama="whoosh" pada={0} volume={0.45} />
    </AbsoluteFill>
  );
};

/* 17. Dasbor Merah/Kuning/Hijau. */
export const AdeganDasbor: React.FC = () => {
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <Judul label="Dasbor bidan" teks="Siapa yang harus dihubungi hari ini?" sorot={["hari", "ini?"]} />
      <Muncul dari={4} arah="bawah" jarak={60} style={{ position: "absolute", left: LAP.kiri, top: LAP.atas }}>
        <Laptop
          src="layar/nakes-beranda.jpg"
          rasio={0.625}
          lebar={LAP.lebar}
          kamera={{ f: [0, 50, 100, 220, 270, 380, 430], x: [0.5, 0.5, 0.59, 0.59, 0.58, 0.58, 0.5], y: [0.5, 0.5, 0.22, 0.22, 0.46, 0.46, 0.5], s: [1, 1, 1.5, 1.5, 1.45, 1.45, 1] }}
        />
      </Muncul>
      <Sorotan teks="3 Merah · 2 Kuning · 1 Hijau" sub="Merah = hubungi hari ini" ikon="🚦" warna={W.merah} dari={110} sampai={225} style={{ left: 1180, top: 860 }} />
      <Sorotan teks="Diurutkan dari yang paling mendesak" sub="Alasan peringatan langsung terlihat" ikon="⚡" warna={W.merah} dari={280} sampai={385} style={{ left: 1150, top: 860 }} />
      <Sorotan teks="±30 aturan klinis dari Buku KIA" sub="Tekanan darah, Hb, LiLA, kunjungan terlambat…" ikon="📘" warna={W.brand} dari={395} style={{ left: 120, top: 850 }} />
      <Sfx nama="ding" pada={110} volume={0.25} />
    </AbsoluteFill>
  );
};

/* 18. Daftar ibu -> detail ibu. */
export const AdeganDetail: React.FC = () => {
  const f = useCurrentFrame();
  const detail = interpolate(f, [150, 168], [0, 1], { ...jepit, easing: halus });
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <Judul label="Detail ibu" teks="Setiap peringatan ada rujukan halaman Buku KIA." sorot={["halaman", "Buku", "KIA."]} />
      <div style={{ position: "absolute", left: LAP.kiri, top: LAP.atas }}>
        <Laptop src="layar/nakes-daftar-ibu.jpg" rasio={0.625} lebar={LAP.lebar} url="rangkul.app/app/ibu">
          <Bingkai x={324} y={330} w={880} h={56} dari={60} sampai={150} warna={W.merah} radius={14} />
        </Laptop>
      </div>
      <div style={{ position: "absolute", left: LAP.kiri, top: LAP.atas, opacity: detail }}>
        <Laptop
          src="layar/nakes-detail-siti.jpg"
          rasio={1428 / 2160}
          lebar={LAP.lebar}
          url="rangkul.app/app/ibu/siti-aminah"
          kamera={{ f: [150, 200, 250, 300, 350, 470, 500], x: [0.5, 0.5, 0.35, 0.35, 0.42, 0.42, 0.42], y: [0.5, 0.5, 0.27, 0.27, 0.58, 0.58, 0.58], s: [1, 1, 1.7, 1.7, 1.65, 1.65, 1.65] }}
        />
      </div>
      <Kursor f={[40, 120, 150, 151]} x={[1500, 900, 900, 900]} y={[950, 562, 562, 562]} klik={[135]} />
      <Sfx nama="mouse-click" pada={135} volume={0.6} />
      <Sorotan teks="TD 145/95 mmHg" sub="Ditandai merah otomatis (≥ 140/90)" ikon="🩸" warna={W.merah} dari={255} sampai={340} style={{ left: 1180, top: 840 }} />
      <Sorotan teks="Buku KIA hlm. 96" sub="Setiap peringatan menautkan halamannya" ikon="📖" warna={W.brand} dari={360} style={{ left: 1180, top: 830 }} />
      <Sorotan teks="Hanya bidan/dokter" sub="yang bisa menutup peringatan" ikon="🛡️" warna={W.hijau} dari={410} style={{ left: 110, top: 840 }} />
    </AbsoluteFill>
  );
};

/* 19. Foto Buku KIA -> draf AI -> konfirmasi. */
const BARIS = [
  ["K3", "20/08", "57", "120/80", "25", "11,8"],
  ["K4", "01/10", "59", "125/80", "25", "11,5"],
  ["K5", "12/11", "62", "145/95", "24,5", "11,2"],
];

const ISIAN: { label: string; nilai: string; yakin: number }[] = [
  { label: "Tanggal periksa", nilai: "12 Nov 2026", yakin: 98 },
  { label: "Berat badan", nilai: "62 kg", yakin: 96 },
  { label: "Tekanan darah", nilai: "145/95 mmHg", yakin: 93 },
  { label: "Lingkar lengan atas (LiLA)", nilai: "24,5 cm", yakin: 72 },
  { label: "Hemoglobin", nilai: "11,2 g/dL", yakin: 95 },
];

export const AdeganOcr: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = spring({ frame: f - 40, fps, config: { damping: 15 } });
  const hpPergi = interpolate(f, [125, 150], [0, 1], { ...jepit, easing: halus });
  const kilat = interpolate(f, [100, 104, 118], [0, 1, 0], jepit);
  const pindai = interpolate(f, [150, 210], [0, 1], jepit);
  const dicek = f >= 380;
  const simpan = spring({ frame: f - 440, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <div style={{ position: "absolute", left: 110, top: 48, display: "flex", alignItems: "center", gap: 26, fontFamily: FONT }}>
        <Muncul dari={2}>
          <Label teks="Foto Buku KIA" />
        </Muncul>
        <TeksBertahap teks="Catatan di kertas? Cukup difoto." dari={8} sorot={["Cukup", "difoto."]} style={{ fontSize: 50, fontWeight: 800, color: W.ink }} />
      </div>

      {/* Lembar tabel Buku KIA */}
      <div style={{ position: "absolute", left: 110, top: 220, width: 820, rotate: "-2.5deg" }}>
        <div style={{ position: "relative", borderRadius: 14, background: W.kertas, padding: "34px 34px 40px", boxShadow: "0 40px 80px -36px rgba(80,40,20,0.5)", fontFamily: FONT, overflow: "hidden" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: W.sampulGelap, letterSpacing: "0.06em" }}>PELAYANAN PEMERIKSAAN KEHAMILAN</div>
          <div style={{ fontSize: 18, color: W.muted, marginTop: 4 }}>Diisi oleh tenaga kesehatan</div>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "70px 110px 90px 150px 100px 100px", border: "2px solid rgba(194,61,115,0.35)" }}>
            {["Ke", "Tgl", "BB", "TD", "LiLA", "Hb"].map((h) => (
              <div key={h} style={{ padding: "10px 12px", fontSize: 20, fontWeight: 800, color: W.sampulGelap, background: "rgba(232,90,146,0.12)", borderRight: "2px solid rgba(194,61,115,0.25)" }}>
                {h}
              </div>
            ))}
            {BARIS.map((b, r) =>
              b.map((c, k) => {
                const sorot = r === 2 && k > 0 && f > 160 + k * 8;
                return (
                  <div
                    key={`${r}-${k}`}
                    style={{
                      padding: "12px 12px",
                      fontFamily: k === 0 ? FONT : FONT_TANGAN,
                      fontSize: k === 0 ? 20 : 34,
                      fontWeight: k === 0 ? 700 : 400,
                      color: k === 0 ? W.ink : "#1f3b8a",
                      borderTop: "2px solid rgba(194,61,115,0.25)",
                      borderRight: "2px solid rgba(194,61,115,0.25)",
                      outline: sorot ? `4px solid ${k === 4 ? W.kuningCerah : W.brand}` : undefined,
                      outlineOffset: -4,
                      background: sorot ? (k === 4 ? "rgba(242,169,0,0.18)" : "rgba(47,138,245,0.12)") : undefined,
                    }}
                  >
                    {c}
                  </div>
                );
              }),
            )}
          </div>
          {/* Garis pindai */}
          {pindai > 0 && pindai < 1 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: `${pindai * 100}%`, height: 6, background: W.brand, boxShadow: `0 0 30px 10px rgba(47,138,245,0.5)` }} />
          ) : null}
        </div>
      </div>

      {/* Ponsel kamera */}
      <div style={{ position: "absolute", left: 330, top: 160, translate: `${(1 - hp) * -700 + hpPergi * -900}px 0px`, rotate: `${-6 + hp * 6}deg` }}>
        <Ponsel lebar={380}>
          <div style={{ position: "absolute", inset: 0, background: "#111" }}>
            <div style={{ position: "absolute", inset: "70px 24px 170px", border: "3px solid rgba(255,255,255,0.8)", borderRadius: 16 }} />
            <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "#fff", fontFamily: FONT, fontSize: 18 }}>Posisikan tabel di dalam kotak</div>
            <div style={{ position: "absolute", bottom: 50, left: "50%", translate: "-50% 0px", width: 84, height: 84, borderRadius: 99, border: "6px solid #fff", background: f >= 100 && f < 106 ? "#ddd" : "#fff", scale: f >= 100 && f < 106 ? "0.88" : "1" }} />
          </div>
        </Ponsel>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: kilat }} />

      {/* Draf hasil baca */}
      <Muncul dari={210} arah="kanan" jarak={80} style={{ position: "absolute", left: 1010, top: 190 }}>
        <div style={{ width: 800, borderRadius: 30, background: "#fff", padding: "30px 34px", boxShadow: "0 40px 80px -36px rgba(15,40,90,0.45)", fontFamily: FONT }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: W.ink }}>Draf hasil baca · K5</div>
            <span style={{ padding: "8px 16px", borderRadius: 99, background: W.brandSoft, color: W.brand, fontWeight: 800, fontSize: 20 }}>AI · draf</span>
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {ISIAN.map((s, k) => {
              const ragu = s.yakin < 85 && !dicek;
              const sudahCek = s.yakin < 85 && dicek;
              return (
                <Muncul key={s.label} dari={225 + k * 18} arah="kiri">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      borderRadius: 16,
                      border: `3px solid ${ragu ? W.kuningCerah : sudahCek ? W.hijau : W.line}`,
                      background: ragu ? W.kuningSoft : sudahCek ? W.hijauSoft : "#fff",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: W.muted }}>{s.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: W.ink }}>{s.nilai}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ragu ? W.kuning : sudahCek ? W.hijau : W.muted }}>
                      {ragu ? `${s.yakin}% · cek ulang` : sudahCek ? "✓ dicek kader" : `${s.yakin}%`}
                    </div>
                  </div>
                </Muncul>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 22,
              height: 70,
              borderRadius: 18,
              background: f >= 430 ? W.hijau : W.brand,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              fontWeight: 800,
              scale: f >= 425 && f < 432 ? "0.96" : "1",
            }}
          >
            {f >= 430 ? "✓ Tersimpan" : "Konfirmasi & simpan"}
          </div>
        </div>
      </Muncul>
      <Kursor f={[330, 370, 390, 420, 470]} x={[1700, 1640, 1640, 1400, 1400]} y={[980, 700, 700, 935, 935]} klik={[372, 425]} />
      <div style={{ position: "absolute", left: 110, top: 800, width: 820, scale: String(simpan), opacity: Math.min(1, simpan), fontFamily: FONT }}>
        <div style={{ padding: "22px 28px", borderRadius: 24, background: W.ink, color: "#fff", fontSize: 26, fontWeight: 600, lineHeight: 1.4 }}>
          ✅ Dikonfirmasi oleh <b>Kader Rina</b>, 14 Nov 10.12
          <br />
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Foto dihapus setelah disimpan · jejak audit tercatat</span>
        </div>
      </div>
      <Muncul dari={250} sampai={430} style={{ position: "absolute", left: 110, top: 820, width: 820, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: W.muted, lineHeight: 1.4 }}>
        AI hanya mengusulkan draf. Angka yang ragu ditandai kuning dan <b style={{ color: W.ink }}>wajib dicek</b> sebelum tersimpan.
      </Muncul>
      <Sfx nama="shutter-modern" pada={100} volume={0.6} />
      <Sfx nama="mouse-click" pada={372} volume={0.5} />
      <Sfx nama="mouse-click" pada={425} volume={0.5} />
      <Sfx nama="ding" pada={432} volume={0.3} />
    </AbsoluteFill>
  );
};

/* 20. Pengingat WhatsApp untuk ibu dan keluarga. */
const Gelembung: React.FC<{ dari: number; teks: string; jam: string }> = ({ dari, teks, jam }) => (
  <Muncul dari={dari} arah="bawah" jarak={30}>
    <div style={{ marginLeft: 40, background: "#d9fdd3", borderRadius: "22px 6px 22px 22px", padding: "14px 18px 10px", fontFamily: FONT, fontSize: 19, lineHeight: 1.4, color: "#111b21", boxShadow: "0 2px 3px rgba(0,0,0,0.12)" }}>
      {teks}
      <div style={{ textAlign: "right", fontSize: 14, color: "#667781", marginTop: 4 }}>{jam} ✓✓</div>
    </div>
  </Muncul>
);

export const AdeganPengingat: React.FC = () => {
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <div style={{ position: "absolute", left: 90, top: 48, display: "flex", alignItems: "center", gap: 26, fontFamily: FONT }}>
        <Muncul dari={2}>
          <Label teks="Pengingat" warna={W.hijau} latar={W.hijauSoft} />
        </Muncul>
        <TeksBertahap teks="Ibu dan suami ikut diingatkan lewat WhatsApp." dari={8} sorot={["suami"]} warnaSorot={W.hijau} style={{ fontSize: 50, fontWeight: 800, color: W.ink }} />
      </div>
      <Muncul dari={6} arah="bawah" jarak={60} style={{ position: "absolute", left: 90, top: 200 }}>
        <Laptop
          src="layar/nakes-pengingat.jpg"
          rasio={0.625}
          lebar={1120}
          url="rangkul.app/app/pengingat"
          kamera={{ f: [0, 40, 100], x: [0.5, 0.5, 0.6], y: [0.5, 0.5, 0.36], s: [1, 1, 1.45] }}
        >
          <Bingkai x={37} y={346} w={1010} h={76} dari={110} sampai={200} warna={W.hijau} radius={14} />
        </Laptop>
      </Muncul>
      <Kursor f={[120, 180, 200]} x={[700, 959, 959]} y={[980, 630, 630]} klik={[190]} />
      <Sfx nama="mouse-click" pada={190} volume={0.5} />
      <div style={{ position: "absolute", left: 1350, top: 175 }}>
        <Muncul dari={150} arah="kanan" jarak={120}>
          <Ponsel lebar={420}>
            <div style={{ position: "absolute", inset: 0, background: "#efeae2", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 120, background: "#008069", display: "flex", alignItems: "flex-end", gap: 14, padding: "0 20px 18px", color: "#fff", fontFamily: FONT }}>
                <div style={{ width: 52, height: 52, borderRadius: 99, background: "#f48fb8", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 22 }}>SA</div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>Bu Siti Aminah</div>
                  <div style={{ fontSize: 16, opacity: 0.85 }}>online</div>
                </div>
              </div>
              <div style={{ flex: 1, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                <Muncul dari={185} arah="skala" style={{ alignSelf: "center" }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: "6px 14px", fontFamily: FONT, fontSize: 15, color: "#54656f" }}>Sabtu, 14 November</div>
                </Muncul>
                <Gelembung
                  dari={205}
                  jam="08.00"
                  teks="Halo Bu Siti, ini pengingat dari kader posyandu (Rangkul). Jadwal periksa Senin, 16 November. Jangan lupa bawa Buku KIA ya. Terima kasih 🙏"
                />
                <Gelembung
                  dari={290}
                  jam="08.01"
                  teks="Halo Bapak/Ibu, keluarga Bu Siti. Jadwal periksa Senin, 16 November. Mohon bantu dampingi Ibu. Terima kasih 🙏"
                />
              </div>
            </div>
          </Ponsel>
        </Muncul>
      </div>
      <Sorotan teks="H-2 · Hari H · H+2" sub="Dari tanggal kembali yang dicatat bidan" ikon="⏰" warna={W.hijau} dari={240} style={{ left: 200, top: 900 }} />
      <Sorotan teks="Tanpa data sensitif" sub="Pesan hanya berisi jadwal" ikon="🔒" warna={W.brand} dari={320} style={{ left: 760, top: 900 }} />
      <Sfx nama="ding" pada={205} volume={0.25} />
      <Sfx nama="ding" pada={290} volume={0.25} />
    </AbsoluteFill>
  );
};

/* 21. Masalah terjawab. */
const JAWABAN = [
  { ikon: "💧", masalah: "Kena air?", jawab: "Catatan tersimpan di server, bukan hanya di kertas." },
  { ikon: "🔍", masalah: "Hilang?", jawab: "Masuk lagi dengan nomor HP & PIN, dari HP mana pun." },
  { ikon: "🔗", masalah: "Tidak terhubung?", jawab: "Satu data untuk ibu, kader, bidan, dan dokter, realtime." },
];

export const AdeganTerjawab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
        <TeksBertahap teks="Masalah tadi, terjawab." dari={6} sorot={["terjawab."]} warnaSorot={W.hijau} style={{ marginTop: 110, fontSize: 80, fontWeight: 800, color: W.ink }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 330, display: "flex", gap: 40 }}>
        {JAWABAN.map((j, k) => {
          const d = 40 + k * 60;
          const coret = interpolate(f, [d + 30, d + 45], [0, 1], { ...jepit, easing: halus });
          return (
            <Muncul key={j.masalah} dari={d} arah="bawah" style={{ flex: 1 }}>
              <div style={{ height: 470, borderRadius: 36, background: "#fff", padding: "40px 40px", boxShadow: "0 30px 60px -30px rgba(15,40,90,0.35)", fontFamily: FONT }}>
                <div style={{ fontSize: 80 }}>{j.ikon}</div>
                <div style={{ marginTop: 18, fontSize: 44, fontWeight: 800, color: W.merah, position: "relative", display: "inline-block" }}>
                  {j.masalah}
                  <span style={{ position: "absolute", left: -6, right: -6, top: "55%", height: 6, borderRadius: 6, background: W.merah, transformOrigin: "0 50%", scale: `${coret} 1` }} />
                </div>
                <Muncul dari={d + 45} style={{ marginTop: 26, fontSize: 36, lineHeight: 1.35, fontWeight: 700, color: W.ink, display: "flex", gap: 16 }}>
                  <span style={{ color: W.hijau }}>✓</span>
                  <span>{j.jawab}</span>
                </Muncul>
              </div>
            </Muncul>
          );
        })}
      </div>
      <Muncul dari={250} style={{ position: "absolute", bottom: 100, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 36, fontWeight: 600, color: W.muted }}>
        Rangkul <b style={{ color: W.ink }}>mendampingi</b> Buku KIA, bukan menggantikannya.
      </Muncul>
      {[0, 1, 2].map((k) => (
        <Sfx key={k} nama="switch" pada={70 + k * 60} volume={0.3} />
      ))}
    </AbsoluteFill>
  );
};

/* 22. Privasi & etika. */
const PRIVASI = [
  { ikon: "🤝", judul: "Persetujuan ibu", teks: "Wajib sebelum data disimpan" },
  { ikon: "🔐", judul: "NIK di-hash", teks: "Hanya 4 digit terakhir yang tampil" },
  { ikon: "👥", judul: "Akses sesuai peran", teks: "Kader hanya melihat ibu di posyandunya" },
  { ikon: "🧠", judul: "AI hanya membantu", teks: "Keputusan klinis tetap di tangan nakes" },
];

export const AdeganPrivasi: React.FC = () => (
  <AbsoluteFill>
    <Latar jenis="gelap" />
    <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
      <TeksBertahap teks="Aman dan etis sejak awal." dari={6} sorot={["Aman", "etis"]} warnaSorot="#8ec2ff" style={{ marginTop: 130, fontSize: 76, fontWeight: 800, color: "#fff" }} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 120, right: 120, top: 380, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 30 }}>
      {PRIVASI.map((p, k) => (
        <Muncul key={p.judul} dari={30 + k * 22} arah="bawah">
          <div style={{ height: 380, borderRadius: 32, background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.12)", padding: "40px 32px", fontFamily: FONT, color: "#fff" }}>
            <div style={{ fontSize: 76 }}>{p.ikon}</div>
            <div style={{ marginTop: 26, fontSize: 38, fontWeight: 800 }}>{p.judul}</div>
            <div style={{ marginTop: 12, fontSize: 29, lineHeight: 1.35, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{p.teks}</div>
          </div>
        </Muncul>
      ))}
    </div>
  </AbsoluteFill>
);

/* 23. Penutup. */
export const AdeganPenutup: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const gelap = interpolate(f, [durationInFrames - 30, durationInFrames - 1], [0, 1], jepit);
  return (
    <AbsoluteFill>
      <Latar jenis="biru" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#fff" }}>
        <LogoRangkul ukuran={180} dari={4} putih />
        <Muncul dari={30} style={{ marginTop: 24, fontSize: 110, fontWeight: 800, letterSpacing: "-0.03em" }}>
          Rangkul
        </Muncul>
        <Muncul dari={50} style={{ fontSize: 52, fontWeight: 700 }}>
          Buku KIA yang tidak berhenti di kertas.
        </Muncul>
        <Muncul dari={80} style={{ marginTop: 60, fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>
          Tim TUNG3SAHOOR · Logicodix 2026 · Inclusive Health &amp; Well-being
        </Muncul>
        <Muncul dari={100} style={{ marginTop: 16, fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
          Semua data di video ini fiktif. Ilustrasi Buku KIA 2024 © Kementerian Kesehatan RI.
        </Muncul>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: gelap }} />
      <Sfx nama="ding" pada={34} volume={0.3} />
    </AbsoluteFill>
  );
};
