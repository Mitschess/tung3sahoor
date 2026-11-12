/**
 * Ilustrasi kecil buatan sendiri (SVG datar, satu palet) untuk menu Fitur dan keadaan kosong.
 * Semua digambar tangan di kanvas 64×64; tidak memakai aset pihak lain.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/util";

const W = {
  biru: "#2f8af5",
  biruTua: "#1b62c4",
  biruMuda: "#cfe3fd",
  biruLatar: "#e7f1fe",
  pink: "#e84d8a",
  pinkTua: "#c23571",
  pinkMuda: "#fbd3e4",
  pinkLatar: "#fdebf3",
  merah: "#e5484d",
  kuning: "#ffc145",
  kuningTua: "#e89a12",
  kuningMuda: "#ffe3a3",
  kuningLatar: "#fff4da",
  teal: "#10a99a",
  tealTua: "#0b8579",
  tealMuda: "#bdeee7",
  tealLatar: "#e2f6f3",
  ungu: "#7c5cf0",
  unguTua: "#5a3dcc",
  unguMuda: "#dcd3fd",
  unguLatar: "#efebfe",
  kulit: "#f5c6a0",
  kulitTua: "#e2a37a",
  tinta: "#24324a",
  putih: "#ffffff",
};

/** Jantung berpusat kira-kira di (0,-2), lebar 14. */
const JANTUNG = "M0 4c-5-3.5-7-6-7-8.5a3.6 3.6 0 0 1 7-1.4a3.6 3.6 0 0 1 7 1.4c0 2.5-2 5-7 8.5z";
/** Latar bulat yang sedikit tidak sempurna supaya terasa digambar. */
const LATAR = "M32 3.5c15.5 0 28.5 10 28.5 28S48 60.5 32 60.5 3.5 48.5 3.5 31.5 16.5 3.5 32 3.5z";

function Jantung({ x, y, s = 1, warna }: { x: number; y: number; s?: number; warna: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={JANTUNG} fill={warna} />;
}

function Papan({ aksen, muda }: { aksen: string; muda: string }) {
  return (
    <>
      <rect x="15" y="13" width="34" height="43" rx="6" fill={aksen} />
      <rect x="19" y="18.5" width="26" height="33" rx="3" fill={W.putih} />
      <rect x="24" y="9" width="16" height="8.5" rx="4.25" fill={W.kuning} />
      <circle cx="32" cy="13" r="1.7" fill={W.kuningTua} />
      <path d="M22.5 31.5h5l2.5-5.5 4 11 2.5-5.5h5" fill="none" stroke={W.pink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="23" y="41.5" width="18" height="2.6" rx="1.3" fill={muda} />
      <rect x="23" y="46.5" width="11" height="2.6" rx="1.3" fill={muda} />
    </>
  );
}

const GAMBAR = {
  pantau: { latar: W.biruLatar, isi: <Papan aksen={W.biru} muda={W.biruMuda} /> },
  "pantau-nifas": { latar: W.unguLatar, isi: <Papan aksen={W.ungu} muda={W.unguMuda} /> },
  persiapan: {
    latar: W.tealLatar,
    isi: (
      <>
        <path d="M24 23v-4a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v4" fill="none" stroke={W.tinta} strokeWidth="3.2" strokeLinecap="round" />
        <rect x="15" y="50" width="5" height="4.5" rx="1.5" fill={W.tinta} />
        <rect x="44" y="50" width="5" height="4.5" rx="1.5" fill={W.tinta} />
        <rect x="11" y="22" width="42" height="30" rx="7" fill={W.teal} />
        <path d="M11 30h42v4.5H11z" fill={W.tealTua} />
        <rect x="28.5" y="27.5" width="7" height="9.5" rx="2" fill={W.kuning} />
        <Jantung x={32} y={45} s={0.55} warna={W.putih} />
      </>
    ),
  },
  jadwal: {
    latar: W.kuningLatar,
    isi: (
      <>
        <rect x="13.4" y="17.4" width="42" height="38" rx="6" fill={W.kuningMuda} />
        <rect x="11" y="15" width="42" height="38" rx="6" fill={W.putih} />
        <path d="M17 15h30a6 6 0 0 1 6 6v5H11v-5a6 6 0 0 1 6-6z" fill={W.kuning} />
        <rect x="20" y="10" width="4" height="10" rx="2" fill={W.tinta} />
        <rect x="40" y="10" width="4" height="10" rx="2" fill={W.tinta} />
        {[20, 28, 36, 44].flatMap((x) => [32, 39, 46].map((y) => (x === 36 && y === 39 ? null : <circle key={`${x}${y}`} cx={x} cy={y} r="2.3" fill="#e6ebf2" />)))}
        <circle cx="36" cy="39" r="4.2" fill={W.pink} />
      </>
    ),
  },
  bayi: {
    latar: W.biruLatar,
    isi: (
      <>
        <circle cx="17" cy="38" r="3.6" fill={W.kulitTua} />
        <circle cx="47" cy="38" r="3.6" fill={W.kulitTua} />
        <circle cx="32" cy="37.5" r="15" fill={W.kulit} />
        <path d="M16.6 33.5C16.6 22.5 23.5 15.5 32 15.5s15.4 7 15.4 18z" fill={W.biru} />
        <rect x="15.5" y="30.5" width="33" height="6" rx="3" fill={W.biruTua} />
        <circle cx="32" cy="15" r="3.4" fill={W.kuning} />
        <path d="M24.5 41q2.5 2.2 5 0M34.5 41q2.5 2.2 5 0" fill="none" stroke={W.tinta} strokeWidth="1.9" strokeLinecap="round" />
        <circle cx="23.5" cy="45.5" r="2.4" fill={W.pink} opacity=".35" />
        <circle cx="40.5" cy="45.5" r="2.4" fill={W.pink} opacity=".35" />
        <path d="M30 48q2 1.8 4 0" fill="none" stroke={W.pinkTua} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  kb: {
    latar: W.unguLatar,
    isi: (
      <g transform="rotate(-10 32 32)">
        <rect x="15.4" y="17.4" width="38" height="34" rx="7" fill={W.unguMuda} />
        <rect x="13" y="15" width="38" height="34" rx="7" fill={W.ungu} />
        {[22, 32, 42].flatMap((x) => [25, 39].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="4.3" fill={x === 42 && y === 39 ? W.unguTua : W.putih} />))}
        <circle cx="20.6" cy="23.6" r="1.2" fill={W.unguLatar} />
        <circle cx="30.6" cy="23.6" r="1.2" fill={W.unguLatar} />
      </g>
    ),
  },
  bahaya: {
    latar: W.pinkLatar,
    isi: (
      <>
        <path d="M28.2 12.6a4.4 4.4 0 0 1 7.6 0l17.6 30.5a4.4 4.4 0 0 1-3.8 6.6H14.4a4.4 4.4 0 0 1-3.8-6.6z" fill={W.merah} />
        <rect x="29.6" y="23" width="4.8" height="15" rx="2.4" fill={W.putih} />
        <circle cx="32" cy="43.2" r="2.7" fill={W.putih} />
      </>
    ),
  },
  bukuKia: {
    latar: W.pinkLatar,
    isi: (
      <>
        <rect x="19.5" y="13" width="30" height="41" rx="4" fill={W.putih} />
        <rect x="16" y="10" width="30" height="41" rx="4" fill={W.pink} />
        <path d="M20 10h2.5v41H20a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill={W.pinkTua} />
        <rect x="26" y="17.5" width="15" height="12.5" rx="2.5" fill={W.putih} />
        <Jantung x={33.5} y={25} s={0.5} warna={W.pink} />
        <rect x="26" y="35" width="15" height="2.4" rx="1.2" fill={W.putih} opacity=".75" />
        <rect x="26" y="40" width="10" height="2.4" rx="1.2" fill={W.putih} opacity=".75" />
        <path d="M37.5 50v7.5l2.5-2 2.5 2V50z" fill={W.kuning} />
      </>
    ),
  },
  catatan: {
    latar: W.kuningLatar,
    isi: (
      <>
        <rect x="16.4" y="14.4" width="30" height="40" rx="4" fill={W.kuningMuda} />
        <rect x="14" y="12" width="30" height="40" rx="4" fill={W.putih} />
        {[19, 25, 31, 37].map((x) => (
          <rect key={x} x={x} y="8.5" width="2.6" height="7.5" rx="1.3" fill={W.tinta} />
        ))}
        {[22, 27.5, 33, 38.5].map((y, i) => (
          <rect key={y} x="19" y={y} width={i === 3 ? 12 : 20} height="2.3" rx="1.15" fill={W.kuningMuda} />
        ))}
        <g transform="rotate(32 46 38)">
          <rect x="43" y="17" width="6.4" height="26" rx="2" fill={W.biru} />
          <rect x="43" y="17" width="6.4" height="5" rx="2" fill={W.biruTua} />
          <path d="M43 43h6.4l-3.2 6.5z" fill={W.kulit} />
          <path d="M45.2 47.5h2l-1 2z" fill={W.tinta} />
        </g>
      </>
    ),
  },
  dompet: {
    latar: W.kuningLatar,
    isi: (
      <>
        <circle cx="38" cy="18" r="7.5" fill={W.kuning} />
        <circle cx="38" cy="18" r="4.6" fill="none" stroke={W.kuningTua} strokeWidth="1.6" />
        <circle cx="27" cy="20.5" r="6" fill={W.kuningTua} />
        <rect x="11" y="22" width="40" height="30" rx="6" fill={W.teal} />
        <path d="M11 28a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6z" fill={W.tealTua} />
        <rect x="35" y="31" width="19" height="12" rx="4" fill={W.tealTua} />
        <circle cx="41" cy="37" r="2.4" fill={W.kuning} />
      </>
    ),
  },
  kartu: {
    latar: W.biruLatar,
    isi: (
      <>
        <rect x="11.4" y="19.4" width="46" height="30" rx="5" fill={W.biruMuda} />
        <rect x="9" y="17" width="46" height="30" rx="5" fill={W.biru} />
        <rect x="9" y="23" width="46" height="5" fill={W.biruTua} />
        <rect x="14" y="32" width="9" height="7.5" rx="1.6" fill={W.kuning} />
        <rect x="27" y="33" width="22" height="2.4" rx="1.2" fill={W.putih} />
        <rect x="27" y="38" width="13" height="2.4" rx="1.2" fill={W.putih} opacity=".7" />
      </>
    ),
  },
  darah: {
    latar: W.pinkLatar,
    isi: (
      <>
        <path d="M32 9s-15 17.5-15 28a15 15 0 0 0 30 0C47 26.5 32 9 32 9z" fill={W.merah} />
        <path d="M29.6 31h4.8v5.2h5.2V41h-5.2v5.2h-4.8V41h-5.2v-4.8h5.2z" fill={W.putih} />
        <path d="M22.5 38c0-3.5 1.6-7.2 4-10.5" fill="none" stroke={W.putih} strokeWidth="2.2" strokeLinecap="round" opacity=".45" />
      </>
    ),
  },
  mobil: {
    latar: W.tealLatar,
    isi: (
      <>
        <rect x="7" y="48.5" width="50" height="2.4" rx="1.2" fill={W.tealMuda} />
        <path d="M10 41v-6a4 4 0 0 1 4-4h4l5-8h18l6 8h3a4 4 0 0 1 4 4v6a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill={W.teal} />
        <path d="M23.8 25.5H31V31H20.4zM34 25.5h6.6l3.7 5.5H34z" fill={W.putih} />
        <rect x="51.5" y="34" width="2.5" height="3" rx="1" fill={W.kuning} />
        <circle cx="21" cy="44" r="5" fill={W.tinta} />
        <circle cx="21" cy="44" r="2" fill={W.putih} />
        <circle cx="43" cy="44" r="5" fill={W.tinta} />
        <circle cx="43" cy="44" r="2" fill={W.putih} />
      </>
    ),
  },
  rumah: {
    latar: W.kuningLatar,
    isi: (
      <>
        <path d="M14 29.5 32 14l18 15.5V52H14z" fill={W.putih} />
        <path d="M32 9.6 8.6 29.8a2 2 0 0 0 2.6 3L32 15l20.8 17.8a2 2 0 0 0 2.6-3z" fill={W.pink} />
        <rect x="35" y="36" width="9" height="16" rx="1.5" fill={W.kuningTua} />
        <circle cx="42" cy="44.5" r="1" fill={W.putih} />
        <rect x="18.5" y="34" width="12" height="10" rx="1.8" fill={W.kuning} />
        <Jantung x={24.5} y={40} s={0.42} warna={W.pink} />
        <rect x="11" y="51" width="42" height="2.6" rx="1.3" fill={W.kuningMuda} />
      </>
    ),
  },
  buku: {
    latar: W.biruLatar,
    isi: (
      <>
        <path d="M9 21v29.5c8-2.4 16-1.6 23 2 7-3.6 15-4.4 23-2V21z" fill={W.biru} />
        <path d="M32 21.5c-6-4-14-5-21-3v29c7-2 15-1 21 3z" fill={W.putih} />
        <path d="M32 21.5c6-4 14-5 21-3v29c-7-2-15-1-21 3z" fill="#eef4fd" />
        <rect x="15" y="23.5" width="12.5" height="9.5" rx="1.8" fill={W.kuning} />
        <path d="M15.5 32.5l4-4.2 3 3 2-2 2.6 3.2z" fill={W.kuningTua} />
        <circle cx="24.5" cy="26.5" r="1.4" fill={W.putih} />
        <rect x="15" y="36.5" width="12.5" height="2.2" rx="1.1" fill={W.biruMuda} />
        <rect x="15" y="41" width="9" height="2.2" rx="1.1" fill={W.biruMuda} />
        <rect x="36.5" y="24" width="12" height="2.2" rx="1.1" fill={W.biruMuda} />
        <rect x="36.5" y="28.5" width="12" height="2.2" rx="1.1" fill={W.biruMuda} />
        <rect x="36.5" y="33" width="8" height="2.2" rx="1.1" fill={W.biruMuda} />
        <Jantung x={42.5} y={41.5} s={0.5} warna={W.pink} />
      </>
    ),
  },
  rs: {
    latar: W.pinkLatar,
    isi: (
      <>
        <rect x="14.4" y="26.4" width="40" height="28" rx="4" fill={W.pinkMuda} />
        <rect x="12" y="24" width="40" height="28" rx="4" fill={W.putih} />
        <rect x="22" y="13" width="20" height="16" rx="4" fill={W.putih} />
        <path d="M30 15.5h4v4.5h4.5v4H34v4.5h-4V24h-4.5v-4H30z" fill={W.pink} />
        {[
          [16.5, 32],
          [41.5, 32],
          [16.5, 41],
          [41.5, 41],
        ].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x} y={y} width="6" height="5" rx="1.2" fill={W.biruMuda} />
        ))}
        <path d="M27 52V42.5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3V52z" fill={W.pink} />
      </>
    ),
  },
  keluarga: {
    latar: W.tealLatar,
    isi: (
      <>
        <circle cx="41" cy="25.5" r="6" fill={W.kulit} />
        <path d="M35 24.5a6 6 0 0 1 12 0c-2.6-.4-4.4-1.8-5.2-3.4-1.6 1.8-4 3.2-6.8 3.4z" fill={W.tinta} />
        <path d="M29.5 54v-5.5A11.5 11.5 0 0 1 41 37a11.5 11.5 0 0 1 11.5 11.5V54z" fill={W.biru} />
        <path d="M16.8 24a8.2 8.2 0 0 1 16.4 0v9.5a3 3 0 0 1-3 3H19.8a3 3 0 0 1-3-3z" fill={W.tinta} />
        <circle cx="25" cy="24" r="6.4" fill={W.kulit} />
        <path d="M18.6 22.5a6.4 6.4 0 0 1 12.8 0c-3-.2-5.6-1.6-7-3.6-1.2 2-3.4 3.4-5.8 3.6z" fill={W.tinta} />
        <path d="M13 54v-6.5a12 12 0 0 1 24 0V54z" fill={W.pink} />
      </>
    ),
  },
  lonceng: {
    latar: W.biruLatar,
    isi: (
      <>
        <circle cx="32" cy="47.5" r="4.6" fill={W.kuningTua} />
        <path d="M32 12a3 3 0 0 1 3 3v1.2c6.4 1.4 10.5 6.8 10.5 13.3v8l4 5.5h-35l4-5.5v-8c0-6.5 4.1-11.9 10.5-13.3V15a3 3 0 0 1 3-3z" fill={W.kuning} />
        <path d="M24.5 31c0-3.6 1.8-6.6 4.6-8.2" fill="none" stroke={W.putih} strokeWidth="2.4" strokeLinecap="round" opacity=".75" />
        <circle cx="45.5" cy="16.5" r="6" fill={W.pink} />
      </>
    ),
  },
  tanaman: {
    latar: W.tealLatar,
    isi: (
      <>
        <path d="M32 36V22" stroke={W.tealTua} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M32 28c-1-6-6-9.5-12.5-9 0 6.2 5.2 10 12.5 9z" fill={W.teal} />
        <path d="M32 24c1-6.5 6.5-10 13-9.5 0 6.5-5.5 10.5-13 9.5z" fill="#3cc4b5" />
        <path d="M21.5 39h21l-2.6 13.2a3 3 0 0 1-3 2.4h-9.8a3 3 0 0 1-3-2.4z" fill={W.pink} />
        <rect x="19" y="34.5" width="26" height="6" rx="2.2" fill={W.pinkTua} />
      </>
    ),
  },
} satisfies Record<string, { latar: string; isi: ReactNode }>;

export type NamaIlustrasi = keyof typeof GAMBAR;

export function Ilustrasi({ nama, className, tanpaLatar }: { nama: NamaIlustrasi; className?: string; tanpaLatar?: boolean }) {
  const g = GAMBAR[nama];
  return (
    <svg viewBox="0 0 64 64" className={cn("size-14", className)} aria-hidden focusable="false">
      {!tanpaLatar && <path d={LATAR} fill={g.latar} />}
      {g.isi}
    </svg>
  );
}
