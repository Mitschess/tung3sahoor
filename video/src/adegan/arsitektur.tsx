import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Label, Latar, Muncul, Sfx, TeksBertahap } from "../komponen";
import { FONT, halus, jepit, W } from "../tema";

/* 22. Di balik layar: arsitektur Rangkul (tanpa VO, teks harus cukup jelas sendiri). */

const KOLOM = { pengguna: 90, aplikasi: 640, layanan: 1380 };
const LEBAR = { pengguna: 440, aplikasi: 640, layanan: 460 };

type Simpul = { ikon: string; judul: string; sub: string; sub2?: string; warna: string; latar: string; dari: number; atas: number; tinggi: number };

const PENGGUNA: Simpul[] = [
  { ikon: "🤰", judul: "Ibu", sub: "Web HP & Android", sub2: "Expo · React Native", warna: W.rose, latar: W.roseSoft, dari: 34, atas: 330, tinggi: 170 },
  { ikon: "🩺", judul: "Kader · Bidan · Dokter", sub: "Web desktop", sub2: "posyandu & puskesmas", warna: W.brand, latar: W.brandSoft, dari: 54, atas: 580, tinggi: 170 },
];

const LAYANAN: Simpul[] = [
  { ikon: "🗄️", judul: "Supabase", sub: "Postgres · Row Level Security", sub2: "login PIN / sandi · realtime", warna: W.hijau, latar: W.hijauSoft, dari: 230, atas: 250, tinggi: 200 },
  { ikon: "✨", judul: "Google Gemini", sub: "Foto Buku KIA → draf JSON", sub2: "cadangan: Tesseract (offline)", warna: W.ungu, latar: "#efeafe", dari: 270, atas: 485, tinggi: 190 },
  { ikon: "💬", judul: "WhatsApp", sub: "Pengingat via wa.me", sub2: "tanpa data sensitif", warna: W.teal, latar: W.tealSoft, dari: 310, atas: 710, tinggi: 170 },
];

const MODUL = [
  { ikon: "⚖️", judul: "Mesin aturan Buku KIA", sub: "±30 aturan klinis → Merah · Kuning · Hijau" },
  { ikon: "📅", judul: "Tahap & jadwal otomatis", sub: "K1–K6 · KF1–KF4 · KN1–KN3" },
  { ikon: "📝", judul: "Form dari kamus data", sub: "28 tabel · 327 kolom" },
  { ikon: "🔐", judul: "Akses sesuai peran", sub: "ibu · kader · bidan · dokter" },
];

const APLIKASI = { atas: 250, tinggi: 630, dari: 100 };
const SOROT_ATURAN = 400;

const Kartu: React.FC<{ s: Simpul; kiri: number; lebar: number }> = ({ s, kiri, lebar }) => (
  <Muncul dari={s.dari} arah="skala" style={{ position: "absolute", left: kiri, top: s.atas, width: lebar, height: s.tinggi }}>
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        borderRadius: 30,
        background: "#fff",
        borderLeft: `8px solid ${s.warna}`,
        boxShadow: "0 24px 50px -28px rgba(15,40,90,0.45)",
        padding: "0 26px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: FONT,
      }}
    >
      <div style={{ flexShrink: 0, fontSize: 48, width: 84, height: 84, borderRadius: 22, background: s.latar, display: "grid", placeItems: "center" }}>{s.ikon}</div>
      <div>
        <div style={{ fontSize: 31, fontWeight: 800, color: W.ink, lineHeight: 1.15 }}>{s.judul}</div>
        <div style={{ marginTop: 6, fontSize: 21, fontWeight: 700, color: s.warna, whiteSpace: "nowrap" }}>{s.sub}</div>
        {s.sub2 ? <div style={{ marginTop: 2, fontSize: 20, fontWeight: 500, color: W.muted }}>{s.sub2}</div> : null}
      </div>
    </div>
  </Muncul>
);

/** Garis penghubung yang tumbuh, lalu titik data mengalir bolak-balik. */
const Jalur: React.FC<{ x1: number; x2: number; y: number; dari: number; warna: string; geser: number }> = ({ x1, x2, y, dari, warna, geser }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [dari, dari + 24], [0, 1], { ...jepit, easing: halus });
  const mulaiAlir = dari + 30;
  if (t <= 0) return null;
  return (
    <g>
      <line x1={x1} y1={y} x2={x1 + (x2 - x1) * t} y2={y} stroke={warna} strokeWidth={5} strokeLinecap="round" opacity={0.35} />
      {f >= mulaiAlir
        ? [0, 1].map((d) => {
            const p = (((f - mulaiAlir + geser + d * 25) % 50) + 50) % 50 / 50;
            const q = d === 0 ? p : 1 - p;
            return <circle key={d} cx={x1 + (x2 - x1) * q} cy={y} r={8} fill={warna} opacity={Math.sin(Math.PI * p)} />;
          })
        : null}
    </g>
  );
};

export const AdeganArsitektur: React.FC = () => {
  const f = useCurrentFrame();
  const sorot = interpolate(f, [SOROT_ATURAN, SOROT_ATURAN + 20], [0, 1], { ...jepit, easing: halus });
  const kananPengguna = KOLOM.pengguna + LEBAR.pengguna;
  const kananAplikasi = KOLOM.aplikasi + LEBAR.aplikasi;
  return (
    <AbsoluteFill>
      <Latar jenis="terang" />

      {/* Judul */}
      <div style={{ position: "absolute", left: 110, top: 60, display: "flex", alignItems: "center", gap: 26, fontFamily: FONT }}>
        <Muncul dari={2}>
          <Label teks="Di balik layar" />
        </Muncul>
        <TeksBertahap teks="Arsitektur Rangkul" dari={8} sorot={["Rangkul"]} style={{ fontSize: 56, fontWeight: 800, color: W.ink, letterSpacing: "-0.01em" }} />
      </div>

      {/* Judul kolom */}
      {[
        { teks: "Pengguna", x: KOLOM.pengguna, dari: 24 },
        { teks: "Aplikasi web · Next.js", x: KOLOM.aplikasi, dari: 90 },
        { teks: "Data & layanan", x: KOLOM.layanan, dari: 220 },
      ].map((k) => (
        <Muncul key={k.teks} dari={k.dari} style={{ position: "absolute", left: k.x, top: 190, fontFamily: FONT, fontSize: 22, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: W.muted }}>
          {k.teks}
        </Muncul>
      ))}

      {/* Jalur data */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {PENGGUNA.map((s, k) => (
          <Jalur key={s.judul} x1={kananPengguna} x2={KOLOM.aplikasi} y={s.atas + s.tinggi / 2} dari={APLIKASI.dari + 20 + k * 12} warna={s.warna} geser={k * 17} />
        ))}
        {LAYANAN.map((s, k) => (
          <Jalur key={s.judul} x1={kananAplikasi} x2={KOLOM.layanan} y={s.atas + s.tinggi / 2} dari={s.dari - 6} warna={s.warna} geser={k * 11} />
        ))}
      </svg>

      {PENGGUNA.map((s) => (
        <Kartu key={s.judul} s={s} kiri={KOLOM.pengguna} lebar={LEBAR.pengguna} />
      ))}

      {/* Inti aplikasi */}
      <Muncul dari={APLIKASI.dari} arah="skala" style={{ position: "absolute", left: KOLOM.aplikasi, top: APLIKASI.atas, width: LEBAR.aplikasi, height: APLIKASI.tinggi }}>
        <div
          style={{
            height: "100%",
            boxSizing: "border-box",
            borderRadius: 36,
            background: "#fff",
            border: `3px solid ${W.brandSoft}`,
            boxShadow: "0 40px 80px -36px rgba(47,138,245,0.55)",
            padding: "30px 32px",
            fontFamily: FONT,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: W.ink }}>Next.js 16</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: W.muted }}>React 19 · TypeScript · /api/ocr</div>
          </div>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
            {MODUL.map((m, k) => {
              const aturan = k === 0;
              return (
                <Muncul key={m.judul} dari={APLIKASI.dari + 30 + k * 18} arah="kiri" jarak={30}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      padding: "16px 20px",
                      borderRadius: 22,
                      background: aturan ? `color-mix(in srgb, ${W.brandSoft} ${100 - sorot * 30}%, ${W.brand})` : W.bg,
                      outline: aturan ? `${3 * sorot}px solid ${W.brand}` : undefined,
                      boxShadow: aturan ? `0 0 ${40 * sorot}px rgba(47,138,245,${0.45 * sorot})` : undefined,
                    }}
                  >
                    <div style={{ fontSize: 38, width: 56, textAlign: "center" }}>{m.ikon}</div>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: W.ink }}>{m.judul}</div>
                      <div style={{ fontSize: 21, fontWeight: 600, color: W.muted }}>{m.sub}</div>
                    </div>
                  </div>
                </Muncul>
              );
            })}
          </div>
        </div>
      </Muncul>

      {LAYANAN.map((s) => (
        <Kartu key={s.judul} s={s} kiri={KOLOM.layanan} lebar={LEBAR.layanan} />
      ))}

      {/* Pesan kunci */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 925, display: "flex", justifyContent: "center", gap: 28, fontFamily: FONT }}>
        {[
          { teks: "Aturan klinis ditulis sekali, dipakai web & Android", dari: SOROT_ATURAN + 10 },
          { teks: "AI hanya mengusulkan draf, keputusan dari aturan yang bisa diaudit", dari: SOROT_ATURAN + 50 },
        ].map((p) => (
          <Muncul key={p.teks} dari={p.dari} arah="bawah" jarak={24}>
            <div style={{ padding: "16px 28px", borderRadius: 999, background: W.ink, color: "#fff", fontSize: 26, fontWeight: 700 }}>{p.teks}</div>
          </Muncul>
        ))}
      </div>

      <Sfx nama="whoosh" pada={0} volume={0.4} />
      {[APLIKASI.dari, ...LAYANAN.map((s) => s.dari)].map((p) => (
        <Sfx key={p} nama="switch" pada={p} volume={0.25} />
      ))}
      <Sfx nama="ding" pada={SOROT_ATURAN} volume={0.3} />
    </AbsoluteFill>
  );
};
