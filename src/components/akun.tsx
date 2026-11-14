"use client";

import { Delete, Eye, EyeOff, Lock } from "lucide-react";
import { motion, useAnimationControls } from "motion/react";
import { useCallback, useEffect, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { PANJANG_PIN } from "@/lib/akun";
import { cn } from "@/lib/util";
import { GambarKia } from "./gambar-kia";
import { LogoMark } from "./logo";
import { Masukan } from "./ui";

/** Tab bergaris bawah seperti layar masuk SATUSEHAT (Nomor Telepon | Email). */
export function TabGaris<T extends string>({ nilai, setNilai, pilihan, className }: { nilai: T; setNilai: (v: T) => void; pilihan: { nilai: T; label: string }[]; className?: string }) {
  return (
    <div role="tablist" className={cn("grid border-b border-line", className)} style={{ gridTemplateColumns: `repeat(${pilihan.length}, minmax(0, 1fr))` }}>
      {pilihan.map((p) => (
        <button
          key={p.nilai}
          type="button"
          role="tab"
          aria-selected={nilai === p.nilai}
          onClick={() => setNilai(p.nilai)}
          className={cn("-mb-px border-b-[3px] py-3 text-[16px] transition", nilai === p.nilai ? "border-brand font-semibold text-brand" : "border-transparent text-muted hover:text-ink")}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** Label isian dengan tanda wajib, keterangan, dan pesan salah. */
export function Bidang({ label, wajib, ket, salah, children, kanan }: { label: string; wajib?: boolean; ket?: ReactNode; salah?: string | null; children: ReactNode; kanan?: ReactNode }) {
  return (
    <div className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">
          {label}
          {wajib && <span className="text-merah"> *</span>}
        </span>
        {kanan && <span className="text-xs text-muted">{kanan}</span>}
      </div>
      {ket && <p className="mt-0.5 text-xs text-muted">{ket}</p>}
      <div className="mt-1.5">{children}</div>
      {salah && <p className="mt-1 text-xs font-medium text-merah">{salah}</p>}
    </div>
  );
}

/** Nomor HP Indonesia dengan awalan +62. */
export function IsianTelepon({ nilai, setNilai, ...p }: { nilai: string; setNilai: (v: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className="flex h-12 items-center rounded-xl border border-line bg-surface transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
      <span className="flex h-full items-center gap-2 border-r border-line px-3 text-[15px] font-semibold">
        <span aria-hidden className="grid h-3.5 w-5 overflow-hidden rounded-[2px] ring-1 ring-black/10">
          <span className="bg-[#e70011]" />
          <span className="bg-white" />
        </span>
        +62
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={14}
        value={nilai}
        onChange={(e) => setNilai(e.target.value.replace(/[^\d]/g, ""))}
        placeholder="812xxxxxxxx"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-[#9aa4b1]"
        {...p}
      />
    </div>
  );
}

export function IsianSandi({ nilai, setNilai, ...p }: { nilai: string; setNilai: (v: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [lihat, setLihat] = useState(false);
  return (
    <div className="relative">
      <Masukan type={lihat ? "text" : "password"} value={nilai} onChange={(e) => setNilai(e.target.value)} className="pr-12" {...p} />
      <button type="button" onClick={() => setLihat(!lihat)} className="absolute inset-y-0 right-1 grid w-11 place-items-center text-muted" aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
        {lihat ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

/**
 * Layar PIN penuh berwarna biru (seperti "Masukkan PIN" SATUSEHAT): enam titik dan tombol angka besar.
 * onSelesai dipanggil saat 6 angka terisi; kembalikan pesan salah untuk mengosongkan PIN dan menggoyang titik.
 */
export function PapanPin({ judul, sub, onSelesai, bawah }: { judul: string; sub: string; onSelesai: (pin: string) => Promise<string | null>; bawah?: ReactNode }) {
  const [pin, setPin] = useState("");
  const [salah, setSalah] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const goyang = useAnimationControls();

  const tekan = useCallback(
    (k: string) => {
      if (sibuk) return;
      setSalah(null);
      if (k === "hapus") return setPin(pin.slice(0, -1));
      if (pin.length >= PANJANG_PIN) return;
      const baru = pin + k;
      setPin(baru);
      if (baru.length < PANJANG_PIN) return;
      setSibuk(true);
      void onSelesai(baru).then((m) => {
        setSibuk(false);
        if (!m) return;
        setSalah(m);
        setPin("");
        void goyang.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.4 } });
      });
    },
    [pin, sibuk, onSelesai, goyang],
  );

  // Papan ketik komputer juga bisa dipakai.
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tekan(e.key);
      else if (e.key === "Backspace") tekan("hapus");
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [tekan]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center bg-brand px-6 pb-8 pt-14 text-white">
      <span className="grid size-14 place-items-center rounded-full bg-white text-brand">
        <Lock className="size-6" strokeWidth={2.4} />
      </span>
      <h1 className="mt-6 text-[26px] font-bold">{judul}</h1>
      <p className="mt-2 max-w-xs text-center text-[15px] text-white/85">{sub}</p>
      <motion.div animate={goyang} className="mt-8 flex gap-5" aria-label={`${pin.length} dari ${PANJANG_PIN} angka terisi`} role="status">
        {Array.from({ length: PANJANG_PIN }, (_, i) => (
          <span key={i} className={cn("size-4 rounded-full border-2 border-white transition", i < pin.length && "bg-white")} />
        ))}
      </motion.div>
      <p className="mt-4 min-h-10 max-w-xs text-center text-sm font-semibold text-[#ffe08a]" aria-live="polite">
        {sibuk ? "Memeriksa…" : salah}
      </p>
      <div className="mt-2 grid w-full max-w-[300px] grid-cols-3 gap-x-6 gap-y-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <TombolAngka key={k} onClick={() => tekan(k)}>
            {k}
          </TombolAngka>
        ))}
        <span />
        <TombolAngka onClick={() => tekan("0")}>0</TombolAngka>
        <button type="button" onClick={() => tekan("hapus")} className="grid aspect-square place-items-center rounded-full transition active:bg-white/10" aria-label="Hapus satu angka">
          <Delete className="size-8" />
        </button>
      </div>
      <div className="mt-auto pt-8 text-center text-[15px] font-semibold">{bawah}</div>
    </main>
  );
}

function TombolAngka({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid aspect-square place-items-center rounded-full bg-white text-[28px] font-semibold text-ink shadow-sm transition active:scale-95 active:bg-white/85">
      {children}
    </button>
  );
}

/** Daftar poin syarat dengan kotak centang "Dengan menyatakan Setuju …". */
export function IsiSyarat({ judul, poin, setuju, setSetuju, onSetuju }: { judul: string; poin: string[]; setuju: boolean; setSetuju: (b: boolean) => void; onSetuju: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold leading-tight">{judul}</h2>
      <p className="text-[15px] leading-relaxed text-ink/85">Syarat & Ketentuan ini perlu dibaca, dipahami, dan disetujui sebelum memakai Rangkul:</p>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/85">
        {poin.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-bg p-4">
        <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--color-brand)]" />
        <span className="text-sm">Dengan menyatakan Setuju, saya menerima seluruh isi Syarat & Ketentuan Penggunaan dan Pemberitahuan Privasi Rangkul.</span>
      </label>
      <button
        type="button"
        disabled={!setuju}
        onClick={onSetuju}
        className="h-12 w-full rounded-xl bg-brand font-semibold text-white transition active:scale-[0.98] disabled:bg-[#dfe4ea] disabled:text-[#9aa4b1]"
      >
        Saya Setuju
      </button>
    </div>
  );
}

/** Sambutan: ilustrasi keluarga dari Buku KIA dalam bingkai lembut, dengan logo Rangkul. */
export function IlustrasiSambutan() {
  return (
    <div className="relative w-full max-w-[300px]">
      <div className="overflow-hidden rounded-[46%_54%_44%_56%/56%_44%_56%_44%] bg-[#f4f2e7]">
        <GambarKia nama="menyusui" alt="Ayah, ibu, dan bayi yang sedang menyusu" preload sizes="300px" className="scale-110" />
      </div>
      <LogoMark className="absolute -bottom-5 left-1/2 size-16 -translate-x-1/2 ring-4 ring-surface" />
    </div>
  );
}
