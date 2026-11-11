"use client";

import { ArrowRight, Baby, HeartPulse, RotateCcw, Stethoscope, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Memuat } from "@/components/ui";
import { LABEL_PERAN } from "@/lib/akses";
import { useSiap } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import type { Pengguna } from "@/lib/types";
import { cn, inisial } from "@/lib/util";

const IKON = { ibu: UserRound, kader: Users, bidan: HeartPulse, dokter: Stethoscope } as const;
const WARNA = {
  ibu: "from-[#ffd6e2] to-[#ffeef3] text-rose",
  kader: "from-[#e3f6ee] to-[#f2fbf7] text-hijau",
  bidan: "from-[#efe9fd] to-[#f7f4ff] text-brand",
  dokter: "from-[#dfeaff] to-[#f1f6ff] text-[#2f5fd0]",
} as const;

function rumahPeran(u: Pengguna): string {
  return u.peran === "ibu" ? "/ibu" : "/app";
}

export default function Masuk() {
  const siap = useSiap();
  const pengguna = useStore((s) => s.pengguna);
  const masuk = useStore((s) => s.masuk);
  const reset = useStore((s) => s.resetDemo);
  const router = useRouter();

  if (!siap) return <Memuat />;

  const pilih = (u: Pengguna) => {
    masuk(u.id);
    router.push(rumahPeran(u));
  };

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-5 py-6">
      <Logo />
      <div className="mt-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Masuk sebagai siapa?</h1>
        <p className="mt-2 text-muted">
          Akun demo untuk juri. Satu web, tampilan menyesuaikan peran: ibu melihat tampilan paling sederhana, kader/bidan/dokter melihat daftar tugas.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {pengguna.map((u) => {
          const Ikon = u.peran === "ibu" && u.keterangan?.includes("Nifas") ? Baby : IKON[u.peran];
          return (
            <button
              key={u.id}
              onClick={() => pilih(u)}
              className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
            >
              <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br", WARNA[u.peran])}>
                <Ikon className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{LABEL_PERAN[u.peran]}</p>
                <p className="truncate font-bold">{u.nama}</p>
                <p className="truncate text-sm text-muted">{u.keterangan}</p>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-black/[0.04] text-xs font-bold text-muted transition group-hover:bg-brand group-hover:text-white">
                <span className="group-hover:hidden">{inisial(u.nama)}</span>
                <ArrowRight className="hidden size-4 group-hover:block" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
        <p>
          <b className="text-ink">Data demo seluruhnya palsu</b> dan tersimpan di browser ini saja (localStorage). Tanggal kehamilan dibuat relatif terhadap hari ini supaya setiap tahap selalu bisa didemokan.
        </p>
        <button
          className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
          onClick={() => {
            reset();
            toast.success("Data demo dikembalikan ke awal");
          }}
        >
          <RotateCcw className="size-4" /> Kembalikan data demo
        </button>
      </div>
    </main>
  );
}
