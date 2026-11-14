import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BukuKia, Latar, Muncul, PanelTeks, Sfx, TeksBertahap, TeksTengah } from "../komponen";
import { FONT, FONT_TANGAN, halus, jepit, masukKeluar, W } from "../tema";

/* 1. Pembuka: setiap ibu membawa satu buku. */
export const AdeganPembuka: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jatuh = spring({ frame: f - 50, fps, config: { damping: 11, stiffness: 90 } });
  return (
    <AbsoluteFill>
      <Latar jenis="gelap" />
      <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT, color: "#fff" }}>
        <TeksBertahap
          teks="Setiap ibu hamil di Indonesia membawa satu buku penting."
          dari={8}
          jeda={4}
          sorot={["satu", "buku", "penting"]}
          warnaSorot="#f48fb8"
          style={{ marginTop: 120, fontSize: 64, fontWeight: 800, textAlign: "center", maxWidth: 1400, lineHeight: 1.15 }}
        />
        <div
          style={{
            marginTop: 70,
            translate: `0px ${(1 - jatuh) * -700}px`,
            rotate: `${(1 - jatuh) * -25 + Math.sin(f / 40) * 1.5}deg`,
          }}
        >
          <BukuKia lebar={300} />
        </div>
        <Muncul dari={95} style={{ marginTop: 50, fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
          Buku Kesehatan Ibu dan Anak, atau <b style={{ color: "#fff" }}>Buku KIA</b>
        </Muncul>
      </AbsoluteFill>
      <Sfx nama="whoosh" pada={48} volume={0.45} />
    </AbsoluteFill>
  );
};

/* 2. Isi Buku KIA. */
export const AdeganIsiBuku: React.FC = () => {
  const f = useCurrentFrame();
  const buka = interpolate(f, [20, 70], [0, 1], { ...jepit, easing: masukKeluar });
  return (
    <AbsoluteFill>
      <Latar jenis="hangat" />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 140px", gap: 150 }}>
        <div style={{ marginLeft: 120, rotate: `${-4 + buka * 4}deg` }}>
          <BukuKia lebar={400} buka={buka} />
        </div>
        <PanelTeks
          label="Buku KIA"
          warnaLabel={W.sampulGelap}
          latarLabel={W.roseSoft}
          judul="Isinya seluruh perjalanan ibu dan bayi."
          sorot={["seluruh", "perjalanan"]}
          dari={10}
          jedaPoin={38}
          poin={[
            "Jadwal periksa hamil K1–K6, nifas, dan bayi baru lahir",
            "Hasil pemeriksaan: tekanan darah, berat badan, Hb",
            "Tanda bahaya yang harus diwaspadai",
            "Grafik kenaikan berat badan & tumbuh kembang",
          ]}
        />
      </AbsoluteFill>
      <Sfx nama="page-turn" pada={22} volume={0.6} />
    </AbsoluteFill>
  );
};

/* 3. Harus dibawa setiap kunjungan. */
const TEMPAT = [
  { ikon: "🏠", nama: "Rumah" },
  { ikon: "🤱", nama: "Posyandu" },
  { ikon: "🏥", nama: "Puskesmas" },
  { ikon: "🚑", nama: "Rumah sakit" },
];

export const AdeganDibawa: React.FC = () => {
  const f = useCurrentFrame();
  const kiri = 260;
  const kanan = 1660;
  const jarak = (kanan - kiri) / (TEMPAT.length - 1);
  // Buku bolak-balik antar tempat.
  const rute = [0, 1, 0, 2, 0, 3, 1, 2];
  const per = 34;
  const mulai = 60;
  const i = Math.min(rute.length - 2, Math.max(0, Math.floor((f - mulai) / per)));
  const t = interpolate(f - mulai - i * per, [0, per], [0, 1], { ...jepit, easing: masukKeluar });
  const posisi = f < mulai ? rute[0] : rute[i] + (rute[i + 1] - rute[i]) * t;
  const x = kiri + posisi * jarak;
  const lompat = Math.sin(t * Math.PI) * 90;
  const hitung = Math.min(13, Math.max(0, Math.round(interpolate(f, [mulai, 300], [1, 13], jepit))));
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
        <TeksBertahap
          teks="Dan harus selalu dibawa, setiap kali periksa."
          dari={6}
          sorot={["selalu", "dibawa,"]}
          warnaSorot={W.sampulGelap}
          style={{ marginTop: 130, fontSize: 70, fontWeight: 800, color: W.ink, textAlign: "center" }}
        />
      </AbsoluteFill>
      {/* Jalur */}
      <div style={{ position: "absolute", left: kiri, right: 1920 - kanan, top: 640, height: 8, borderRadius: 8, background: `repeating-linear-gradient(90deg, ${W.line} 0 24px, transparent 24px 40px)` }} />
      {TEMPAT.map((t2, k) => (
        <Muncul key={t2.nama} dari={20 + k * 8} arah="skala" style={{ position: "absolute", left: kiri + k * jarak - 130, top: 554 }}>
          <div style={{ width: 260, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
            <div style={{ width: 180, height: 180, borderRadius: 48, background: "#fff", display: "grid", placeItems: "center", fontSize: 96, boxShadow: "0 20px 40px -20px rgba(15,40,90,0.35)" }}>
              {t2.ikon}
            </div>
            <div style={{ marginTop: 20, fontSize: 36, fontWeight: 700, color: W.ink }}>{t2.nama}</div>
          </div>
        </Muncul>
      ))}
      <div style={{ position: "absolute", left: x - 45, top: 420 - lompat, rotate: `${Math.sin(t * Math.PI) * 12}deg`, opacity: interpolate(f, [40, 55], [0, 1], jepit) }}>
        <BukuKia lebar={90} />
      </div>
      <Muncul dari={70} style={{ position: "absolute", bottom: 110, width: "100%", textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 40, fontWeight: 600, color: W.muted }}>
          6× periksa hamil · 4× nifas · 3× bayi baru lahir ={" "}
          <span style={{ fontSize: 56, fontWeight: 800, color: W.sampulGelap }}>{hitung} kunjungan</span>
        </div>
      </Muncul>
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <Sfx key={k} nama="whoosh" pada={mulai + k * per} volume={0.18} />
      ))}
    </AbsoluteFill>
  );
};

/* 4. Kena air. */
export const AdeganBasah: React.FC = () => {
  const f = useCurrentFrame();
  const basah = interpolate(f, [70, 260], [0, 1], { ...jepit, easing: halus });
  const hujan = interpolate(f, [0, 30], [0, 1], jepit);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #24324a 0%, #3c4d68 100%)" }} />
      {/* Hujan */}
      {[...Array(90)].map((_, k) => {
        const x = random(`x${k}`) * 1920;
        const kecepatan = 26 + random(`v${k}`) * 18;
        const y = ((f * kecepatan + random(`y${k}`) * 1300) % 1300) - 150;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x + y * 0.12,
              top: y,
              width: 3,
              height: 60 + random(`h${k}`) * 40,
              borderRadius: 3,
              background: "linear-gradient(180deg, transparent, rgba(190,220,255,0.7))",
              rotate: "-7deg",
              opacity: hujan * 0.8,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120, fontFamily: FONT }}>
        <div style={{ rotate: "-6deg" }}>
          <BukuKia lebar={360} basah={basah} />
        </div>
        {/* Lembar catatan yang luntur */}
        <Muncul dari={20} arah="kanan">
          <div
            style={{
              width: 640,
              padding: "44px 50px",
              borderRadius: 18,
              background: W.kertas,
              boxShadow: "0 40px 80px -30px rgba(0,0,0,0.6)",
              rotate: "2deg",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: W.sampulGelap, letterSpacing: "0.08em" }}>PEMERIKSAAN K5</div>
            {[
              ["Tanggal", "12-11-2026"],
              ["Tekanan darah", "145/95"],
              ["Berat badan", "62 kg"],
              ["Protein urine", "+1"],
            ].map(([a, b], k) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid rgba(194,61,115,0.2)", padding: "18px 0" }}>
                <span style={{ fontSize: 28, color: W.muted, fontWeight: 600 }}>{a}</span>
                <span
                  style={{
                    fontFamily: FONT_TANGAN,
                    fontSize: 46,
                    color: "#1f3b8a",
                    filter: `blur(${basah * (3 + k * 2.2)}px)`,
                    opacity: 1 - basah * (0.35 + k * 0.1),
                    translate: `0px ${basah * (6 + k * 4)}px`,
                    scale: `${1 + basah * 0.15} ${1 + basah * 0.5}`,
                  }}
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        </Muncul>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT, color: "#fff" }}>
        <TeksBertahap teks="Hujan, banjir, tumpahan air…" dari={10} style={{ marginTop: 90, fontSize: 68, fontWeight: 800 }} />
        <Muncul dari={150} style={{ position: "absolute", bottom: 100, fontSize: 44, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
          Tinta luntur. Angka tekanan darah <b style={{ color: "#ffb3c9" }}>tidak terbaca lagi.</b>
        </Muncul>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 5. Hilang. */
export const AdeganHilang: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const keluar = interpolate(f, [70, 130], [0, 1], { ...jepit, easing: Easing2 });
  const pudar = interpolate(f, [130, 170], [1, 0], jepit);
  const tanya = spring({ frame: f - 175, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 160px", gap: 120 }}>
        <div style={{ width: 640, height: 760, position: "relative" }}>
          {/* Buku keluar dari tas */}
          <div
            style={{
              position: "absolute",
              left: 210,
              top: 120,
              translate: `${keluar * 260}px ${keluar * keluar * 520}px`,
              rotate: `${-8 + keluar * 70}deg`,
              opacity: pudar,
            }}
          >
            <BukuKia lebar={220} />
          </div>
          {/* Bekas tempat buku */}
          <div
            style={{
              position: "absolute",
              left: 210,
              top: 120,
              width: 220,
              height: 304,
              rotate: "-8deg",
              borderRadius: 16,
              border: `5px dashed ${W.sampul}`,
              display: "grid",
              placeItems: "center",
              fontFamily: FONT,
              fontSize: 130,
              fontWeight: 800,
              color: W.sampul,
              opacity: Math.min(1, tanya),
              scale: String(0.6 + 0.4 * tanya),
            }}
          >
            ?
          </div>
          {/* Tas */}
          <div style={{ position: "absolute", left: 60, top: 300, width: 520, height: 400 }}>
            <div style={{ position: "absolute", left: 140, top: -110, width: 240, height: 160, borderRadius: "120px 120px 0 0", border: "26px solid #8a5a3b", borderBottom: "none" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 50, background: "linear-gradient(160deg, #c98a5c, #a8693f)", boxShadow: "0 40px 70px -30px rgba(90,50,20,0.6)" }} />
            <div style={{ position: "absolute", left: 40, right: 40, top: 70, height: 10, borderRadius: 10, background: "rgba(0,0,0,0.12)" }} />
          </div>
        </div>
        <PanelTeks
          label="Buku hilang"
          warnaLabel={W.sampulGelap}
          latarLabel={W.roseSoft}
          judul="Tertinggal, terselip, atau hilang."
          sorot={["hilang."]}
          dari={10}
          jedaPoin={50}
          lebar={820}
          poin={["Riwayat pemeriksaan ikut hilang bersamanya", "Bidan harus mulai mencatat dari awal lagi"]}
        />
      </AbsoluteFill>
      <Sfx nama="whoosh" pada={72} volume={0.4} />
    </AbsoluteFill>
  );
};
const Easing2 = (t: number) => t * t;

/* 6. Tidak terintegrasi. */
const PIHAK = [
  { ikon: "🤰", nama: "Ibu", catatan: "Buku KIA", x: 960, y: 330 },
  { ikon: "🙋‍♀️", nama: "Kader", catatan: "Buku catatan posyandu", x: 420, y: 560 },
  { ikon: "👩‍⚕️", nama: "Bidan", catatan: "Register kohort ibu", x: 1500, y: 560 },
  { ikon: "🏥", nama: "Puskesmas", catatan: "Rekam medis", x: 960, y: 790 },
];

export const AdeganTerpisah: React.FC = () => {
  const f = useCurrentFrame();
  const pasang: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [1, 2],
  ];
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
        <TeksBertahap
          teks="Catatan tersebar, tidak saling terhubung."
          dari={6}
          sorot={["tidak", "terhubung."]}
          warnaSorot={W.merah}
          style={{ marginTop: 80, fontSize: 70, fontWeight: 800, color: W.ink }}
        />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {pasang.map(([a, b], k) => {
          const A = PIHAK[a];
          const B = PIHAK[b];
          const t = interpolate(f, [40 + k * 10, 70 + k * 10], [0, 1], { ...jepit, easing: halus });
          const putus = interpolate(f, [110 + k * 12, 125 + k * 12], [0, 1], jepit);
          const mx = (A.x + B.x) / 2;
          const my = (A.y + B.y) / 2;
          const celah = 40 * putus;
          const len = Math.hypot(B.x - A.x, B.y - A.y);
          const ux = (B.x - A.x) / len;
          const uy = (B.y - A.y) / len;
          return (
            <g key={k} opacity={t}>
              <line x1={A.x} y1={A.y} x2={mx - ux * celah} y2={my - uy * celah} stroke={putus > 0 ? W.merah : W.brand} strokeWidth={5} strokeDasharray="14 12" />
              <line x1={mx + ux * celah} y1={my + uy * celah} x2={B.x} y2={B.y} stroke={putus > 0 ? W.merah : W.brand} strokeWidth={5} strokeDasharray="14 12" />
              {putus > 0 ? (
                <g transform={`translate(${mx} ${my}) scale(${putus})`}>
                  <circle r={28} fill={W.merah} />
                  <path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      {PIHAK.map((p, k) => (
        <Muncul key={p.nama} dari={14 + k * 8} arah="skala" style={{ position: "absolute", left: p.x - 170, top: p.y - 80 }}>
          <div
            style={{
              width: 340,
              padding: "20px 22px",
              borderRadius: 28,
              background: "#fff",
              boxShadow: "0 24px 50px -24px rgba(15,40,90,0.4)",
              display: "flex",
              gap: 18,
              alignItems: "center",
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 64, width: 90, height: 90, borderRadius: 24, background: W.bg, display: "grid", placeItems: "center" }}>{p.ikon}</div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, color: W.ink }}>{p.nama}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: W.muted }}>📒 {p.catatan}</div>
            </div>
          </div>
        </Muncul>
      ))}
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 28, fontFamily: FONT }}>
        {["Kader sulit tahu siapa yang terlambat periksa", "Tekanan darah tinggi tak langsung sampai ke bidan", "Keluarga tidak ikut diingatkan"].map((t, k) => (
          <Muncul key={t} dari={190 + k * 30}>
            <div style={{ padding: "16px 24px", borderRadius: 18, background: W.merahSoft, color: W.merah, fontSize: 27, fontWeight: 700, maxWidth: 520 }}>{t}</div>
          </Muncul>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 7. Dampak. */
export const AdeganDampak: React.FC = () => {
  return (
    <AbsoluteFill>
      <Latar jenis="gelap" />
      <TeksTengah style={{ color: "#fff", flexDirection: "column", gap: 40 }}>
        <TeksBertahap
          teks="Masa paling rawan justru setelah melahirkan dan 28 hari pertama bayi."
          dari={8}
          jeda={4}
          sorot={["setelah", "melahirkan", "28", "hari", "pertama"]}
          warnaSorot="#f48fb8"
          style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.2, maxWidth: 1500 }}
        />
        <Muncul dari={90} style={{ fontSize: 36, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
          Dua pertiga kematian balita di Indonesia terjadi pada 28 hari pertama kehidupan. (Buku KIA 2024)
        </Muncul>
        <Muncul dari={170} style={{ marginTop: 30, fontSize: 48, fontWeight: 700, color: "#ffb3c9" }}>
          Satu catatan yang terlewat bisa berarti satu tanda bahaya yang terlewat.
        </Muncul>
      </TeksTengah>
    </AbsoluteFill>
  );
};

/* 8. Jembatan ke solusi. */
export const AdeganJembatan: React.FC = () => {
  const f = useCurrentFrame();
  const coret = interpolate(f, [70, 95], [0, 1], { ...jepit, easing: halus });
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />
      <TeksTengah style={{ flexDirection: "column" }}>
        <Muncul dari={6} style={{ fontSize: 44, fontWeight: 600, color: W.muted }}>
          Bagaimana jika…
        </Muncul>
        <div style={{ marginTop: 24, fontSize: 88, fontWeight: 800, color: W.ink, lineHeight: 1.1 }}>
          <Muncul dari={20}>Buku KIA tidak berhenti</Muncul>
          <Muncul dari={34}>
            <span style={{ position: "relative", color: W.brand }}>
              di kertas?
              <span
                style={{
                  position: "absolute",
                  left: -10,
                  right: -10,
                  top: "62%",
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(232,77,138,0.25)",
                  transformOrigin: "0 50%",
                  scale: `${coret} 1`,
                }}
              />
            </span>
          </Muncul>
        </div>
      </TeksTengah>
      <Sfx nama="switch" pada={70} volume={0.5} />
    </AbsoluteFill>
  );
};
