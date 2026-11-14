import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, FONT_TANGAN, halus, jepit, masukKeluar, W } from "./tema";

/* ---------- Latar ---------- */

export const Latar: React.FC<{ jenis?: "terang" | "gelap" | "hangat" | "biru" }> = ({ jenis = "terang" }) => {
  const f = useCurrentFrame();
  const geser = Math.sin(f / 90) * 30;
  const p =
    jenis === "gelap"
      ? { dasar: W.malam, a: "rgba(47,138,245,0.22)", b: "rgba(232,77,138,0.18)" }
      : jenis === "hangat"
        ? { dasar: "#fff7f0", a: "rgba(232,90,146,0.16)", b: "rgba(242,169,0,0.14)" }
        : jenis === "biru"
          ? { dasar: W.brand, a: "rgba(255,255,255,0.18)", b: "rgba(244,143,184,0.30)" }
          : { dasar: W.bg, a: "rgba(47,138,245,0.14)", b: "rgba(232,77,138,0.10)" };
  return (
    <AbsoluteFill style={{ backgroundColor: p.dasar, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          left: -300 + geser,
          top: -420,
          background: `radial-gradient(circle, ${p.a} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          right: -260 - geser,
          bottom: -460,
          background: `radial-gradient(circle, ${p.b} 0%, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Animasi masuk ---------- */

export const Muncul: React.FC<{
  dari?: number;
  sampai?: number;
  arah?: "atas" | "bawah" | "kiri" | "kanan" | "skala";
  jarak?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ dari = 0, sampai, arah = "bawah", jarak = 40, style, children }) => {
  const f = useCurrentFrame();
  const masuk = interpolate(f, [dari, dari + 18], [0, 1], { ...jepit, easing: halus });
  const keluar = sampai === undefined ? 1 : interpolate(f, [sampai - 12, sampai], [1, 0], { ...jepit, easing: halus });
  const t = 1 - masuk;
  const translate =
    arah === "atas"
      ? `0px ${-jarak * t}px`
      : arah === "bawah"
        ? `0px ${jarak * t}px`
        : arah === "kiri"
          ? `${-jarak * t}px 0px`
          : arah === "kanan"
            ? `${jarak * t}px 0px`
            : "0px 0px";
  return (
    <div
      style={{
        opacity: masuk * keluar,
        translate,
        scale: arah === "skala" ? String(0.85 + 0.15 * masuk) : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Kata demi kata muncul. */
export const TeksBertahap: React.FC<{ teks: string; dari?: number; jeda?: number; style?: React.CSSProperties; sorot?: string[]; warnaSorot?: string }> = ({
  teks,
  dari = 0,
  jeda = 3,
  style,
  sorot = [],
  warnaSorot = W.brand,
}) => {
  const f = useCurrentFrame();
  const kata = teks.split(" ");
  return (
    <div style={style}>
      {kata.map((k, i) => {
        const a = interpolate(f, [dari + i * jeda, dari + i * jeda + 12], [0, 1], { ...jepit, easing: halus });
        const bersih = k.replace(/[.,!?:]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: a,
              translate: `0px ${(1 - a) * 18}px`,
              color: sorot.includes(bersih) ? warnaSorot : undefined,
              whiteSpace: "pre",
            }}
          >
            {k}
            {i < kata.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Panel teks (kiri) ---------- */

export const Label: React.FC<{ teks: string; warna?: string; latar?: string }> = ({ teks, warna = W.brand, latar = W.brandSoft }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 22px",
      borderRadius: 999,
      background: latar,
      color: warna,
      fontWeight: 800,
      fontSize: 24,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    }}
  >
    <span style={{ width: 10, height: 10, borderRadius: 99, background: warna }} />
    {teks}
  </span>
);

export const PanelTeks: React.FC<{
  label: string;
  warnaLabel?: string;
  latarLabel?: string;
  judul: string;
  sorot?: string[];
  poin?: string[];
  dari?: number;
  jedaPoin?: number;
  lebar?: number;
  gelap?: boolean;
}> = ({ label, warnaLabel, latarLabel, judul, sorot, poin = [], dari = 0, jedaPoin = 40, lebar = 760, gelap }) => (
  <div style={{ width: lebar, fontFamily: FONT, color: gelap ? "#fff" : W.ink }}>
    <Muncul dari={dari}>
      <Label teks={label} warna={warnaLabel} latar={latarLabel} />
    </Muncul>
    <TeksBertahap
      teks={judul}
      dari={dari + 6}
      sorot={sorot}
      warnaSorot={warnaLabel ?? W.brand}
      style={{ marginTop: 28, fontSize: 70, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em" }}
    />
    <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 22 }}>
      {poin.map((p, i) => (
        <Muncul key={p} dari={dari + 30 + i * jedaPoin} arah="kiri">
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", fontSize: 36, lineHeight: 1.35, color: gelap ? "rgba(255,255,255,0.85)" : W.muted, fontWeight: 500 }}>
            <span
              style={{
                flexShrink: 0,
                marginTop: 8,
                width: 34,
                height: 34,
                borderRadius: 10,
                background: warnaLabel ?? W.brand,
                color: "#fff",
                fontSize: 22,
                fontWeight: 800,
                display: "grid",
                placeItems: "center",
              }}
            >
              ✓
            </span>
            <span>{p}</span>
          </div>
        </Muncul>
      ))}
    </div>
  </div>
);

/* ---------- Ponsel ---------- */

export const LEBAR_HALAMAN_HP = 430;

export const Ponsel: React.FC<{
  src?: string;
  lebar?: number;
  /** Keyframe gulir: frame -> posisi (px halaman web 430 lebar). */
  gulir?: { f: number[]; y: number[] };
  style?: React.CSSProperties;
  children?: React.ReactNode;
  tutupLencana?: boolean;
  /** Gambar menu bawah aplikasi yang menempel di dasar layar. */
  nav?: string;
}> = ({ src, lebar = 440, gulir, style, children, tutupLencana, nav }) => {
  const f = useCurrentFrame();
  const bingkai = 16;
  const layarW = lebar - bingkai * 2;
  const layarH = Math.round((layarW * 932) / 430);
  const skala = layarW / LEBAR_HALAMAN_HP;
  const y = gulir ? interpolate(f, gulir.f, gulir.y, { ...jepit, easing: masukKeluar }) : 0;
  return (
    <div
      style={{
        width: lebar,
        height: layarH + bingkai * 2,
        borderRadius: 66,
        background: "#111827",
        padding: bingkai,
        boxShadow: "0 50px 100px -30px rgba(15,40,90,0.45), inset 0 0 0 2px #2b3445",
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: layarW, height: layarH, borderRadius: 52, overflow: "hidden", position: "relative", background: "#fff" }}>
        {src ? <Img src={staticFile(src)} style={{ width: layarW, display: "block", translate: `0px ${-y * skala}px` }} /> : null}
        {tutupLencana ? (
          // Menutup indikator mode pengembangan Next.js di sudut kiri bawah tangkapan layar.
          <div style={{ position: "absolute", left: 10 * skala, bottom: 70 * skala, width: 70 * skala, height: 70 * skala, background: "#fff" }} />
        ) : null}
        {nav ? <Img src={staticFile(nav)} style={{ position: "absolute", left: 0, bottom: 0, width: layarW }} /> : null}
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: bingkai + 12,
          left: "50%",
          translate: "-50% 0px",
          width: 120,
          height: 34,
          borderRadius: 20,
          background: "#0b0f17",
        }}
      />
    </div>
  );
};

/** Lingkaran ketuk di atas layar ponsel; koordinat dalam px halaman web (lebar 430). */
export const Ketuk: React.FC<{ x: number; y: number; pada: number; skala: number }> = ({ x, y, pada, skala }) => {
  const f = useCurrentFrame();
  const t = f - pada;
  if (t < -10 || t > 30) return null;
  const masuk = interpolate(t, [-10, 0], [0, 1], jepit);
  const riak = interpolate(t, [0, 25], [0, 1], { ...jepit, easing: halus });
  return (
    <div style={{ position: "absolute", left: x * skala, top: y * skala, translate: "-50% -50%" }}>
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: 99,
          background: "rgba(47,138,245,0.35)",
          border: "3px solid rgba(255,255,255,0.9)",
          opacity: masuk * (1 - riak * 0.8),
          scale: String(1 - 0.25 * Math.min(1, Math.max(0, t / 5))),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 99,
          border: `4px solid ${W.brand}`,
          scale: String(1 + riak * 1.4),
          opacity: t >= 0 ? 1 - riak : 0,
        }}
      />
    </div>
  );
};

/* ---------- Laptop / jendela browser ---------- */

export type Kamera = { f: number[]; x: number[]; y: number[]; s: number[] };

export const Laptop: React.FC<{
  src: string;
  /** Rasio tinggi/lebar gambar (mis. 1350/2160). */
  rasio: number;
  lebar?: number;
  kamera?: Kamera;
  url?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ src, rasio, lebar = 1240, kamera, url = "rangkul.app/app", style, children }) => {
  const f = useCurrentFrame();
  const layarW = lebar;
  const layarH = Math.round(lebar * 0.625);
  const imgH = layarW * rasio;
  const k = kamera ?? { f: [0, 1], x: [0.5, 0.5], y: [0.5, 0.5], s: [1, 1] };
  const opsi = { ...jepit, easing: masukKeluar };
  const s = interpolate(f, k.f, k.s, opsi);
  const cx = interpolate(f, k.f, k.x, opsi);
  const cy = interpolate(f, k.f, k.y, opsi);
  let tx = layarW / 2 - cx * layarW * s;
  let ty = layarH / 2 - cy * imgH * s;
  tx = Math.min(0, Math.max(layarW - layarW * s, tx));
  ty = Math.min(0, Math.max(layarH - imgH * s, ty));
  return (
    <div
      style={{
        width: lebar,
        borderRadius: 22,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 60px 120px -40px rgba(15,40,90,0.45), 0 0 0 1px rgba(23,60,110,0.08)",
        ...style,
      }}
    >
      <div style={{ height: 52, background: "#eef2f7", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: `1px solid ${W.line}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 15, height: 15, borderRadius: 99, background: c }} />
        ))}
        <div
          style={{
            marginLeft: 24,
            flex: 1,
            maxWidth: 520,
            height: 32,
            borderRadius: 10,
            background: "#fff",
            fontFamily: FONT,
            fontSize: 18,
            color: W.muted,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
          }}
        >
          🔒 {url}
        </div>
      </div>
      <div style={{ width: layarW, height: layarH, overflow: "hidden", position: "relative", background: W.bg }}>
        <Img
          src={staticFile(src)}
          style={{ width: layarW, position: "absolute", left: 0, top: 0, transformOrigin: "0 0", translate: `${tx}px ${ty}px`, scale: String(s) }}
        />
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
};

/* ---------- Gelembung keterangan ---------- */

export const Sorotan: React.FC<{
  teks: string;
  sub?: string;
  dari: number;
  sampai?: number;
  warna?: string;
  style?: React.CSSProperties;
  ikon?: string;
}> = ({ teks, sub, dari, sampai, warna = W.brand, style, ikon }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pegas = spring({ frame: f - dari, fps, config: { damping: 14, stiffness: 160 } });
  const keluar = sampai === undefined ? 1 : interpolate(f, [sampai - 10, sampai], [1, 0], jepit);
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "18px 26px",
        borderRadius: 24,
        background: "#fff",
        boxShadow: "0 24px 50px -18px rgba(15,40,90,0.35), 0 0 0 1px rgba(23,60,110,0.06)",
        fontFamily: FONT,
        opacity: Math.min(1, pegas) * keluar,
        scale: String(0.7 + 0.3 * pegas),
        ...style,
      }}
    >
      {ikon ? (
        <span style={{ width: 56, height: 56, borderRadius: 16, background: warna, color: "#fff", display: "grid", placeItems: "center", fontSize: 30, flexShrink: 0 }}>{ikon}</span>
      ) : (
        <span style={{ width: 14, height: 56, borderRadius: 8, background: warna, flexShrink: 0 }} />
      )}
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: W.ink, lineHeight: 1.15 }}>{teks}</div>
        {sub ? <div style={{ fontSize: 22, fontWeight: 500, color: W.muted, marginTop: 4 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** Kotak sorot di atas tangkapan layar. */
export const Bingkai: React.FC<{ x: number; y: number; w: number; h: number; dari: number; sampai?: number; warna?: string; radius?: number }> = ({
  x,
  y,
  w,
  h,
  dari,
  sampai,
  warna = W.brand,
  radius = 18,
}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [dari, dari + 12], [0, 1], { ...jepit, easing: halus });
  const keluar = sampai === undefined ? 1 : interpolate(f, [sampai - 8, sampai], [1, 0], jepit);
  const denyut = 1 + Math.sin((f - dari) / 6) * 0.01;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        border: `5px solid ${warna}`,
        boxShadow: `0 0 0 9999px rgba(15,26,43,${0.16 * a * keluar})`,
        opacity: a * keluar,
        scale: String((1.08 - 0.08 * a) * denyut),
      }}
    />
  );
};

/* ---------- Logo Rangkul ---------- */

export const LogoRangkul: React.FC<{ ukuran?: number; dari?: number; putih?: boolean }> = ({ ukuran = 200, dari = 0, putih }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kotak = spring({ frame: f - dari, fps, config: { damping: 12 } });
  const garis = interpolate(f, [dari + 6, dari + 36], [0, 1], { ...jepit, easing: halus });
  const titik = spring({ frame: f - dari - 30, fps, config: { damping: 8, stiffness: 180 } });
  const panjang = 2 * Math.PI * 27 * 0.82;
  return (
    <div
      style={{
        width: ukuran,
        height: ukuran,
        borderRadius: "32%",
        background: putih ? "#fff" : W.brand,
        scale: String(kotak),
        rotate: `${(1 - kotak) * -20}deg`,
        boxShadow: putih ? "0 30px 60px -20px rgba(0,0,0,0.3)" : "0 30px 60px -20px rgba(47,138,245,0.6)",
      }}
    >
      <svg viewBox="0 0 96 96" width={ukuran} height={ukuran} fill="none">
        <path
          d="M66 27A27 27 0 1 0 74 60"
          stroke={putih ? W.brand : "#fff"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={panjang}
          strokeDashoffset={panjang * (1 - garis)}
        />
        <circle cx="51" cy="51" r={11 * titik} fill="#f48fb8" />
      </svg>
    </div>
  );
};

/* ---------- Buku KIA (ilustrasi) ---------- */

export const BukuKia: React.FC<{
  lebar?: number;
  basah?: number;
  style?: React.CSSProperties;
  buka?: number;
}> = ({ lebar = 360, basah = 0, style, buka = 0 }) => {
  const tinggi = lebar * 1.38;
  return (
    <div style={{ width: lebar, height: tinggi, position: "relative", perspective: 1600, ...style }}>
      {/* Halaman dalam */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          left: 8,
          borderRadius: "6px 18px 18px 6px",
          background: W.kertas,
          boxShadow: "inset 8px 0 18px -8px rgba(0,0,0,0.25)",
          padding: lebar * 0.1,
          fontFamily: FONT,
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: lebar * 0.055, fontWeight: 800, color: W.sampulGelap }}>PELAYANAN PEMERIKSAAN</div>
        <div style={{ marginTop: lebar * 0.05, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", border: "2px solid rgba(194,61,115,0.3)" }}>
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              style={{
                height: lebar * 0.1,
                borderRight: "1px solid rgba(194,61,115,0.25)",
                borderBottom: "1px solid rgba(194,61,115,0.25)",
                background: i < 4 ? "rgba(232,90,146,0.15)" : undefined,
                fontFamily: FONT_TANGAN,
                fontSize: lebar * 0.045,
                color: "#1f3b8a",
                display: "grid",
                placeItems: "center",
              }}
            >
              {i >= 4 && i < 16 ? ["12/8", "57", "120/80", "11,8", "1/10", "59", "125/80", "11,5", "12/11", "62", "145/95", "11,2"][i - 4] : ""}
            </div>
          ))}
        </div>
      </div>
      {/* Sampul */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "6px 18px 18px 6px",
          background: `linear-gradient(135deg, ${W.sampul}, ${W.sampulGelap})`,
          boxShadow: "0 40px 80px -30px rgba(120,20,60,0.55), inset 14px 0 0 rgba(0,0,0,0.12)",
          transformOrigin: "0% 50%",
          rotate: `0 1 0 ${-buka * 160}deg`,
          transformStyle: "preserve-3d",
          overflow: "hidden",
          fontFamily: FONT,
          color: "#fff",
          padding: `${lebar * 0.1}px ${lebar * 0.1}px`,
          filter: basah > 0 ? `saturate(${1 - basah * 0.35}) brightness(${1 - basah * 0.12})` : undefined,
        }}
      >
        {buka > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "18px 6px 6px 18px",
              background: `linear-gradient(225deg, #f6c6da, #eaa3c2)`,
              rotate: "0 1 0 180deg",
              translate: "0px 0px 1px",
              backfaceVisibility: "hidden",
              padding: lebar * 0.12,
              color: W.sampulGelap,
            }}
          >
            <div style={{ fontSize: lebar * 0.06, fontWeight: 800 }}>IDENTITAS IBU</div>
            {["Nama", "NIK", "HPHT", "HPL", "Golongan darah"].map((t) => (
              <div key={t} style={{ marginTop: lebar * 0.06, fontSize: lebar * 0.045, fontWeight: 600, borderBottom: `2px dotted ${W.sampulGelap}`, paddingBottom: 4 }}>
                {t}
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ fontSize: lebar * 0.05, fontWeight: 700, letterSpacing: "0.14em", opacity: 0.85 }}>KEMENTERIAN KESEHATAN</div>
        <div style={{ marginTop: lebar * 0.06, fontSize: lebar * 0.12, fontWeight: 800, lineHeight: 1.02 }}>
          BUKU
          <br />
          KESEHATAN
          <br />
          IBU DAN ANAK
        </div>
        <div style={{ marginTop: lebar * 0.04, fontSize: lebar * 0.06, fontWeight: 600, opacity: 0.9 }}>Buku KIA</div>
        {/* Siluet ibu & bayi */}
        <svg viewBox="0 0 200 160" style={{ position: "absolute", bottom: lebar * 0.08, right: lebar * 0.06, width: lebar * 0.62 }}>
          <circle cx="120" cy="42" r="26" fill="rgba(255,255,255,0.9)" />
          <path d="M70 160 C70 100 95 74 120 74 C150 74 172 100 172 160 Z" fill="rgba(255,255,255,0.9)" />
          <circle cx="92" cy="104" r="17" fill="#ffd0e2" />
          <path d="M70 140 C70 120 82 112 96 112 C112 112 124 122 124 140 Z" fill="#ffd0e2" />
        </svg>
        {/* Noda air */}
        {basah > 0 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: lebar * 0.05,
                top: tinggi * 0.45,
                width: lebar * 0.75 * basah,
                height: lebar * 0.6 * basah,
                borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
                background: "radial-gradient(circle at 40% 40%, rgba(80,30,60,0.10), rgba(60,20,40,0.35) 70%, rgba(60,20,40,0.5) 72%, transparent 76%)",
                filter: "blur(2px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: lebar * 0.02,
                top: tinggi * 0.08,
                width: lebar * 0.4 * basah,
                height: lebar * 0.35 * basah,
                borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
                background: "radial-gradient(circle, rgba(60,20,40,0.12), rgba(60,20,40,0.4) 70%, transparent 76%)",
                filter: "blur(2px)",
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

/* ---------- Suara ---------- */

export const Sfx: React.FC<{ nama: "whoosh" | "page-turn" | "ding" | "mouse-click" | "shutter-modern" | "switch"; pada: number; volume?: number }> = ({
  nama,
  pada,
  volume = 0.5,
}) => (
  <Sequence from={pada} layout="none" name={`sfx ${nama}`}>
    <Audio src={staticFile(`sfx/${nama}.wav`)} volume={volume} />
  </Sequence>
);

/* ---------- Kursor tetikus ---------- */

export const Kursor: React.FC<{ f: number[]; x: number[]; y: number[]; klik?: number[] }> = ({ f: kf, x, y, klik = [] }) => {
  const f = useCurrentFrame();
  const opsi = { ...jepit, easing: masukKeluar };
  const px = interpolate(f, kf, x, opsi);
  const py = interpolate(f, kf, y, opsi);
  const tekan = klik.some((k) => f >= k && f < k + 6);
  const tampil = interpolate(f, [kf[0], kf[0] + 8], [0, 1], jepit);
  return (
    <div style={{ position: "absolute", left: px, top: py, opacity: tampil, scale: tekan ? "0.85" : "1", zIndex: 50 }}>
      {klik.map((k) =>
        f >= k && f < k + 20 ? (
          <div
            key={k}
            style={{
              position: "absolute",
              left: -30,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: 99,
              border: `4px solid ${W.brand}`,
              opacity: 1 - (f - k) / 20,
              scale: String(0.4 + (f - k) / 14),
            }}
          />
        ) : null,
      )}
      <svg width="44" height="54" viewBox="0 0 22 27" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }}>
        <path d="M1 1 L1 21 L6 16.5 L9.5 25 L13 23.5 L9.5 15.5 L16 15.5 Z" fill="#111827" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ---------- Teks besar di tengah ---------- */

export const TeksTengah: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, textAlign: "center", padding: "0 160px", ...style }}>{children}</AbsoluteFill>
);
