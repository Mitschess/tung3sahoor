"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/util";

const DURASI = 0.85;
const LENTUR = [0.45, 0.05, 0.25, 1] as const;
/** Bentuk halaman: sudut tajam di sisi punggung (kiri), membulat di tepi luar (kanan). */
const BENTUK = "rounded-l-[8px] rounded-r-[22px]";
/** Seberapa miring garis lipatan di tengah balikan (bagian dari lebar halaman). */
const MIRING = 0.14;

/** Dua lembar yang terlibat dalam satu balikan: `atas` terlipat, `bawah` terlihat di baliknya. */
interface Balik {
  atas: number;
  bawah: number;
}

export interface FlipbookProps {
  jumlah: number;
  awal?: number;
  /** Isi tiap lembar; `ke(i)` untuk melompat dari dalam lembar (misalnya "Ulangi"). */
  render: (i: number, ke: (i: number) => void) => ReactNode;
  judul: string;
  label?: string;
  /** Kelas warna untuk label, segmen kemajuan, dan tombol Lanjut. */
  warna?: { teks: string; isi: string };
  onUbah?: (i: number) => void;
  onTutup: () => void;
}

/**
 * Buku yang dibalik seperti kertas sungguhan: halaman terlipat dari sudut kanan bawah,
 * sisi belakang kertas terlihat, dan lipatan mengikuti jari saat digeser.
 * Kemajuan balikan `p`: 0 = lembar `atas` tampil penuh, 1 = sudah terbalik (lembar `bawah` tampil).
 */
export function Flipbook({ jumlah, awal = 0, render, judul, label, warna = { teks: "text-brand", isi: "bg-brand" }, onUbah, onTutup }: FlipbookProps) {
  const mula = Math.min(Math.max(awal, 0), jumlah - 1);
  const [i, setI] = useState(mula);
  const [balik, setBalik] = useState<Balik | null>(null);
  const kurangiGerak = useReducedMotion();

  const p = useMotionValue(0);
  const iRef = useRef(mula);
  const balikRef = useRef<Balik | null>(null);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const seret = useRef<1 | -1 | null>(null);
  const ukuran = useRef({ w: 1, h: 1 });
  const panggung = useRef<HTMLDivElement>(null);
  const lipat = useRef<HTMLDivElement>(null);
  const kertas = useRef<HTMLDivElement>(null);
  const bayang = useRef<HTMLDivElement>(null);

  const lembar = useCallback((k: number) => panggung.current?.querySelector<HTMLElement>(`:scope > [data-lembar="${k}"]`) ?? null, []);

  /** Menggambar satu bingkai balikan langsung ke DOM (tanpa render ulang React). */
  const gambar = useCallback((v: number) => {
    const b = balikRef.current;
    const atas = b ? lembar(b.atas) : null;
    if (!b || !atas || !lipat.current || !kertas.current || !bayang.current) return;
    const { w, h } = ukuran.current;
    const s = Math.sin(Math.PI * v);
    const x = w * (1 - v);
    const k = MIRING * w * s;
    const xa = x + k; // garis lipatan di tepi atas
    const xb = x - k; // garis lipatan di tepi bawah (lebih dulu ke kiri: sudut bawah terangkat)
    atas.style.clipPath = `polygon(0px 0px, ${xa}px 0px, ${xb}px ${h}px, 0px ${h}px)`;

    if (v <= 0.002 || v >= 0.998) {
      lipat.current.style.display = "";
      bayang.current.style.display = "";
      return;
    }

    // Kerangka lipatan: n = arah tegak lurus ke kanan lipatan, d = arah sepanjang lipatan (ke bawah).
    const panjang = Math.hypot(2 * k, h);
    const cos = h / panjang;
    const sin = (2 * k) / panjang;
    const jarak = (px: number, py: number) => (px - xa) * cos + py * sin;
    const sepanjang = (px: number, py: number) => -(px - xa) * sin + py * cos;

    // Bagian halaman di kanan lipatan (yang terangkat), lalu dicerminkan terhadap garis lipatan.
    const sudut: [number, number][] = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
    const lebar = w + 40;
    const ruang = w;
    const titik: string[] = [];
    for (let n = 0; n < 4; n++) {
      const [ax, ay] = sudut[n];
      const [bx, by] = sudut[(n + 1) % 4];
      const sa = jarak(ax, ay);
      const sb = jarak(bx, by);
      if (sa >= 0) titik.push(`${lebar - sa}px ${ruang + sepanjang(ax, ay)}px`);
      if (sa >= 0 !== sb >= 0) {
        const t = sa / (sa - sb);
        const cx = ax + (bx - ax) * t;
        const cy = ay + (by - ay) * t;
        titik.push(`${lebar}px ${ruang + sepanjang(cx, cy)}px`);
      }
    }

    const putar = `rotate(${Math.atan2(2 * k, h)}rad)`;
    const tinggi = h + 3 * w;
    const l = lipat.current.style;
    l.display = "block";
    l.left = `${xa - lebar}px`;
    l.top = `${-ruang}px`;
    l.width = `${lebar}px`;
    l.height = `${tinggi}px`;
    l.transformOrigin = `${lebar}px ${ruang}px`;
    l.transform = putar;
    l.filter = `drop-shadow(-8px 6px 14px rgb(15 30 60 / ${(0.12 + 0.3 * s).toFixed(3)}))`;
    kertas.current.style.clipPath = `polygon(${titik.join(", ")})`;

    const g = bayang.current.style;
    g.display = "block";
    g.left = `${xa}px`;
    g.top = `${-ruang}px`;
    g.width = `${24 + 90 * s}px`;
    g.height = `${tinggi}px`;
    g.transformOrigin = `0px ${ruang}px`;
    g.transform = putar;
    g.opacity = String(Math.min(1, 0.25 + s));
  }, [lembar]);

  useEffect(() => p.on("change", gambar), [p, gambar]);

  // Begitu dua lembar balikan terpasang, gambar bingkai pertama sebelum layar dicat.
  useLayoutEffect(() => {
    if (balik) gambar(p.get());
  }, [balik, gambar, p]);

  useEffect(() => {
    onUbah?.(i);
  }, [i, onUbah]);

  const mulai = useCallback(
    (atas: number, bawah: number, dari: number) => {
      const r = panggung.current?.getBoundingClientRect();
      if (!r) return false;
      ukuran.current = { w: r.width, h: r.height };
      p.set(dari);
      balikRef.current = { atas, bawah };
      setBalik({ atas, bawah });
      return true;
    },
    [p],
  );

  const selesai = useCallback((target: 0 | 1) => {
    const b = balikRef.current;
    if (!b) return;
    const baru = target === 1 ? b.bawah : b.atas;
    // Lembar yang tetap tinggal dibersihkan; lembar yang dilepas dibiarkan agar tidak berkedip.
    const tinggal = lembar(baru);
    if (tinggal) tinggal.style.clipPath = "";
    if (lipat.current) lipat.current.style.display = "";
    if (bayang.current) bayang.current.style.display = "";
    balikRef.current = null;
    anim.current = null;
    iRef.current = baru;
    setBalik(null);
    setI(baru);
  }, [lembar]);

  const jalankan = useCallback(
    (target: 0 | 1, durasi: number) => {
      anim.current?.stop();
      anim.current = animate(p, target, { duration: durasi, ease: LENTUR, onComplete: () => selesai(target) });
    },
    [p, selesai],
  );

  const ke = useCallback(
    (tujuan: number) => {
      const t = Math.min(Math.max(tujuan, 0), jumlah - 1);
      const b = balikRef.current;
      if (b) {
        // Sedang dibalik (atau sedang mengintip): teruskan ke arah yang diminta.
        if (seret.current) return;
        if (t === b.bawah) jalankan(1, DURASI * (1 - p.get()) + 0.15);
        else if (t === b.atas) jalankan(0, DURASI * p.get() + 0.15);
        return;
      }
      const kini = iRef.current;
      if (t === kini) return;
      const maju = t > kini;
      if (kurangiGerak || !mulai(maju ? kini : t, maju ? t : kini, maju ? 0 : 1)) {
        iRef.current = t;
        setI(t);
        return;
      }
      jalankan(maju ? 1 : 0, DURASI);
    },
    [jumlah, jalankan, kurangiGerak, mulai, p],
  );

  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ke(iRef.current + 1);
      else if (e.key === "ArrowLeft") ke(iRef.current - 1);
    };
    window.addEventListener("keydown", tombol);
    return () => window.removeEventListener("keydown", tombol);
  }, [ke]);

  // Saat buku baru dibuka di sampul, sudut halaman terangkat sebentar sebagai petunjuk.
  useEffect(() => {
    if (kurangiGerak || mula !== 0 || jumlah < 2) return;
    const id = window.setTimeout(() => {
      if (balikRef.current || iRef.current !== 0 || !mulai(0, 1, 0)) return;
      anim.current = animate(p, [0, 0.17, 0], { duration: 1.2, ease: "easeInOut", onComplete: () => selesai(0) });
    }, 700);
    return () => window.clearTimeout(id);
  }, [jumlah, kurangiGerak, mula, mulai, p, selesai]);

  useEffect(() => () => anim.current?.stop(), []);

  const terakhir = i === jumlah - 1;
  const tampil = balik ? [balik.atas, balik.bawah] : [i];

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 px-2 pt-2">
        <button type="button" onClick={onTutup} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-black/5" aria-label="Tutup buku">
          <ArrowLeft className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          {label && <p className={cn("truncate text-[11px] font-bold uppercase tracking-wider", warna.teks)}>{label}</p>}
          <h1 className="truncate text-[17px] font-bold leading-tight">{judul}</h1>
        </div>
        <span className="mr-2 shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-semibold tabular-nums shadow-[var(--shadow-kartu)]" aria-live="polite">
          {i + 1}/{jumlah}
        </span>
      </header>

      {jumlah <= 16 ? (
        <div className="flex gap-1 px-4 pt-3" aria-hidden>
          {Array.from({ length: jumlah }, (_, k) => (
            <button key={k} type="button" tabIndex={-1} onClick={() => ke(k)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.08]">
              <span className={cn("block h-full rounded-full transition-all duration-300", warna.isi, k <= i ? "w-full" : "w-0")} />
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 pt-3" aria-hidden>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
            <div className={cn("h-full rounded-full transition-all duration-300", warna.isi)} style={{ width: `${((i + 1) / jumlah) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 px-4 pb-3 pt-4">
        <motion.div
          ref={panggung}
          className="relative h-full"
          style={{ touchAction: "pan-y" }}
          onPan={(_, info) => {
            if (kurangiGerak || (anim.current && !seret.current)) return;
            const dx = info.offset.x;
            if (!seret.current) {
              if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(info.offset.y)) return;
              const arah = dx < 0 ? 1 : -1;
              const kini = iRef.current;
              if (arah === 1 ? kini >= jumlah - 1 : kini <= 0) return;
              if (!mulai(arah === 1 ? kini : kini - 1, arah === 1 ? kini + 1 : kini, arah === 1 ? 0 : 1)) return;
              seret.current = arah;
            }
            const q = Math.min(Math.max((seret.current === 1 ? -dx : dx) / (ukuran.current.w * 0.9), 0), 1);
            p.set(seret.current === 1 ? q : 1 - q);
          }}
          onPanEnd={(_, info) => {
            const arah = seret.current;
            if (!arah) {
              // Tanpa animasi: geseran cepat tetap berpindah lembar.
              if (kurangiGerak && Math.abs(info.offset.x) > 50 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) ke(iRef.current + (info.offset.x < 0 ? 1 : -1));
              return;
            }
            seret.current = null;
            const v = p.get();
            const target = arah === 1 ? (v > 0.3 || info.velocity.x < -400 ? 1 : 0) : v < 0.7 || info.velocity.x > 400 ? 0 : 1;
            jalankan(target, 0.2 + 0.4 * Math.abs(target - v));
          }}
        >
          {/* Tebal buku: lembar-lembar berikutnya mengintip di tepi kanan bawah. */}
          {!terakhir && (
            <>
              <div className={cn("absolute inset-0 translate-x-[7px] translate-y-[7px] bg-[#ebe8e1]", BENTUK)} />
              <div className={cn("absolute inset-0 translate-x-[3.5px] translate-y-[3.5px] bg-[#f6f4ef] shadow-sm", BENTUK)} />
            </>
          )}

          {/* `ke` membaca ref, tetapi hanya dipanggil dari tombol di dalam lembar (event), tidak saat render. */}
          {/* eslint-disable-next-line react-hooks/refs */}
          {tampil.map((k) => (
            <article
              key={k}
              data-lembar={k}
              style={{ zIndex: balik && k === balik.atas ? 3 : 1 }}
              className={cn(
                BENTUK,
                "absolute inset-0 overflow-hidden bg-[#fffdf9] shadow-[0_18px_40px_-20px_rgb(23_60_110/0.45),0_0_0_1px_rgb(23_60_110/0.05)]",
                balik && "pointer-events-none select-none",
              )}
              aria-roledescription="lembar"
              aria-label={`Lembar ${k + 1} dari ${jumlah}`}
            >
              {/* Lembar tidak digulir: isi lembar sendiri yang menyesuaikan ukuran halaman. */}
              <div className="h-full overflow-hidden">{render(k, ke)}</div>
              {/* Lipatan tengah buku. */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/[0.06] to-transparent" />
            </article>
          ))}

          {/* Bayangan lipatan yang jatuh ke lembar di bawahnya. */}
          <div className={cn("pointer-events-none absolute inset-0 z-[2] overflow-hidden", BENTUK)} aria-hidden>
            <div ref={bayang} className="absolute hidden bg-gradient-to-r from-[rgb(15_30_60/0.32)] via-[rgb(15_30_60/0.08)] to-transparent" />
          </div>

          {/* Sisi belakang kertas yang sedang dilipat. */}
          <div className={cn("pointer-events-none absolute inset-0 z-[4] overflow-hidden", BENTUK)} aria-hidden>
            <div ref={lipat} className="absolute hidden">
              <div
                ref={kertas}
                className="absolute inset-0 bg-[#fbf9f4] [background-image:linear-gradient(to_left,rgb(60_45_20/0.18)_0px,rgb(60_45_20/0.05)_12px,rgb(255_255_255/0)_38px),linear-gradient(to_left,#efebe3,#fffdf9_22%,#f8f5ef_60%,#e8e3d9)]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="flex items-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
        <button
          type="button"
          onClick={() => ke(iRef.current - 1)}
          disabled={i === 0}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-surface shadow-[var(--shadow-kartu)] transition active:scale-95 disabled:opacity-40"
          aria-label="Lembar sebelumnya"
        >
          <ChevronLeft className="size-6" />
        </button>
        <p className="flex-1 text-center text-xs leading-tight text-muted">{i === 0 ? "Tarik sudut halaman atau tekan Buka" : terakhir ? "Sudah selesai dibaca" : "Tarik halaman untuk membalik"}</p>
        <button
          type="button"
          onClick={() => (terakhir && !balik ? onTutup() : ke(iRef.current + 1))}
          className={cn("inline-flex h-14 shrink-0 items-center gap-1.5 rounded-full px-6 text-[17px] font-semibold text-white shadow-[0_10px_22px_-12px_rgb(0_0_0/0.5)] transition active:scale-95", warna.isi)}
        >
          {terakhir ? (
            "Selesai"
          ) : (
            <>
              {i === 0 ? "Buka" : "Lanjut"} <ChevronRight className="size-5" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
