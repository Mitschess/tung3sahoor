"use client";

import { ArrowLeft, BriefcaseMedical, Download, HeartPulse, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bidang, IlustrasiSambutan, IsianSandi, IsianTelepon, PapanPin, ServerBelumTersambung, TabGaris } from "@/components/akun";
import { TombolSos } from "@/components/sos";
import { Masukan, Memuat, Tombol } from "@/components/ui";
import { alamatAkunIbu, emailValid, masukAkun, type CaraMasuk } from "@/lib/akun";
import { useSiap } from "@/lib/hooks";
import { MODE_AWAN, usePengguna } from "@/lib/store";

const URL_APK = process.env.NEXT_PUBLIC_URL_APK;

type Kelompok = "ibu" | "petugas";

/**
 * Masuk saat tersambung ke Supabase. Siapa yang masuk dipilih sekali di layar pertama:
 * - Ibu: nomor telepon atau email → PIN 6 angka (alur SATUSEHAT Mobile).
 * - Kader/bidan/dokter: satu halaman email + kata sandi.
 * ?peran=ibu atau ?peran=petugas langsung membuka form yang sesuai.
 */
export function MasukAwan() {
  const siap = useSiap();
  const u = usePengguna();
  const router = useRouter();
  const awal = useSearchParams().get("peran");
  const [kelompok, setKelompok] = useState<Kelompok | null>(awal === "ibu" || awal === "petugas" ? awal : null);

  // Sudah masuk (sesi tersimpan) → langsung ke beranda masing-masing.
  useEffect(() => {
    if (MODE_AWAN && siap && u) router.replace(u.peran === "ibu" ? "/ibu" : "/app");
  }, [siap, u, router]);

  if (!MODE_AWAN) return <ServerBelumTersambung />;
  if (!siap || u) return <Memuat penuh />;
  if (kelompok === "ibu") return <MasukIbu kembali={() => setKelompok(null)} />;
  if (kelompok === "petugas") return <MasukPetugas kembali={() => setKelompok(null)} />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-6 pb-8">
      <div className="mt-4">
        <TombolSos tandaBahaya={false} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <IlustrasiSambutan />
        <p className="mt-10 text-3xl font-extrabold tracking-tight text-brand">Rangkul</p>
        <p className="mt-2 max-w-xs text-center text-[15px] text-muted">Teman Buku KIA untuk Ibu, kader, bidan, dan dokter.</p>
      </div>
      <Tombol className="w-full" onClick={() => setKelompok("ibu")}>
        <HeartPulse className="size-5" /> Masuk sebagai Ibu
      </Tombol>
      <button
        type="button"
        onClick={() => setKelompok("petugas")}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-brand text-[15px] font-semibold text-brand transition active:scale-[0.98]"
      >
        <BriefcaseMedical className="size-5" /> Masuk sebagai Kader / Nakes
      </button>
      <p className="mt-5 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-brand">
          Daftar
        </Link>
      </p>
      {URL_APK && (
        <a href={URL_APK} className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-brand">
          <Smartphone className="size-4" /> Unduh aplikasi Rangkul (APK) <Download className="size-4" />
        </a>
      )}
    </main>
  );
}

function Kepala({ kembali, judul, sub }: { kembali: () => void; judul: string; sub?: string }) {
  return (
    <>
      <button type="button" onClick={kembali} className="-ml-2 mt-3 grid size-11 place-items-center rounded-full hover:bg-black/5" aria-label="Kembali">
        <ArrowLeft className="size-6" />
      </button>
      <h1 className="mt-4 text-[28px] font-bold leading-tight">{judul}</h1>
      {sub && <p className="mt-2 text-[15px] text-muted">{sub}</p>}
    </>
  );
}

function Bawah({ daftar, children }: { daftar: string; children: ReactNode }) {
  return (
    <div className="mt-auto pt-10">
      <p className="mb-4 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href={daftar} className="font-semibold text-brand">
          Daftar
        </Link>
      </p>
      {children}
    </div>
  );
}

/** Ibu: nomor telepon atau email, lalu layar PIN biru. */
function MasukIbu({ kembali }: { kembali: () => void }) {
  const router = useRouter();
  const [langkah, setLangkah] = useState<"isi" | "pin">("isi");
  const [cara, setCara] = useState<CaraMasuk>("telepon");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const alamat = alamatAkunIbu(cara, cara === "telepon" ? telepon : email);

  if (langkah === "pin" && alamat) {
    return (
      <PapanPin
        judul="Masukkan PIN"
        sub="Masukkan PIN Anda untuk masuk ke Rangkul"
        onSelesai={async (pin) => {
          try {
            await masukAkun(alamat, pin, true);
            router.replace("/ibu");
            return null;
          } catch (e) {
            return (e as Error).message;
          }
        }}
        bawah={
          <button type="button" onClick={() => setLangkah("isi")} className="underline-offset-4 hover:underline">
            Ganti nomor atau email
          </button>
        }
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-5 pb-6">
      <Kepala kembali={kembali} judul="Masukkan Email atau Nomor Telepon" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (alamat) setLangkah("pin");
        }}
        className="mt-6 flex flex-1 flex-col"
      >
        <TabGaris
          nilai={cara}
          setNilai={setCara}
          pilihan={[
            { nilai: "telepon", label: "Nomor Telepon" },
            { nilai: "email", label: "Email" },
          ]}
        />
        <div className="mt-6">
          {cara === "telepon" ? (
            <Bidang label="Nomor Telepon" kanan={`${telepon.length}/13`}>
              <IsianTelepon nilai={telepon} setNilai={setTelepon} autoFocus />
            </Bidang>
          ) : (
            <Bidang label="Email">
              <Masukan type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email" />
            </Bidang>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">Lupa PIN? Minta bantuan bidan atau kader posyandu Ibu.</p>
        <Bawah daftar="/daftar?peran=ibu">
          <Tombol type="submit" className="w-full" disabled={!alamat}>
            Lanjut
          </Tombol>
        </Bawah>
      </form>
    </main>
  );
}

/** Kader, bidan, dokter: satu halaman email + kata sandi. */
function MasukPetugas({ kembali }: { kembali: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);
  const boleh = emailValid(email) && sandi.length > 0;

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boleh) return;
    setGalat(null);
    setMemuat(true);
    try {
      await masukAkun(email.trim().toLowerCase(), sandi);
      router.replace("/app");
    } catch (e) {
      setGalat((e as Error).message);
      setMemuat(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-5 pb-6">
      <Kepala kembali={kembali} judul="Masuk Kader / Nakes" sub="Untuk kader posyandu, bidan, dan dokter puskesmas." />
      <form onSubmit={kirim} className="mt-8 flex flex-1 flex-col">
        <div className="space-y-4">
          <Bidang label="Email">
            <Masukan type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@puskesmas.go.id" />
          </Bidang>
          <Bidang label="Kata sandi">
            <IsianSandi nilai={sandi} setNilai={setSandi} autoComplete="current-password" placeholder="Masukkan kata sandi" />
          </Bidang>
        </div>
        {galat && (
          <p role="alert" className="mt-4 rounded-xl bg-merah-soft px-4 py-3 text-sm font-medium text-merah">
            {galat}
          </p>
        )}
        <Bawah daftar="/daftar?peran=petugas">
          <Tombol type="submit" className="w-full" disabled={!boleh} memuat={memuat}>
            Masuk
          </Tombol>
        </Bawah>
      </form>
    </main>
  );
}
