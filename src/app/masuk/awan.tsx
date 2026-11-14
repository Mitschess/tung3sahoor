"use client";

import { ArrowLeft, Download, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bidang, IlustrasiSambutan, IsianSandi, IsianTelepon, PapanPin, ServerBelumTersambung, TabGaris } from "@/components/akun";
import { TombolSos } from "@/components/sos";
import { Masukan, Memuat, Tombol } from "@/components/ui";
import { alamatAkunIbu, emailValid, masukAkun, type CaraMasuk } from "@/lib/akun";
import { useSiap } from "@/lib/hooks";
import { MODE_AWAN, usePengguna } from "@/lib/store";

const URL_APK = process.env.NEXT_PUBLIC_URL_APK;

type Kelompok = "ibu" | "petugas";

/**
 * Masuk saat tersambung ke Supabase, mengikuti alur SATUSEHAT Mobile:
 * sambutan (Masuk / Daftar) → nomor telepon atau email → PIN 6 angka (ibu),
 * atau email + kata sandi (kader/bidan/dokter).
 */
export function MasukAwan() {
  const siap = useSiap();
  const u = usePengguna();
  const router = useRouter();
  const langsung = useSearchParams().has("pilih");
  const [langkah, setLangkah] = useState<"sambutan" | "isi" | "pin">(langsung ? "isi" : "sambutan");
  const [kelompok, setKelompok] = useState<Kelompok>("ibu");
  const [cara, setCara] = useState<CaraMasuk>("telepon");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  // Sudah masuk (sesi tersimpan) → langsung ke beranda masing-masing.
  useEffect(() => {
    if (MODE_AWAN && siap && u) router.replace(u.peran === "ibu" ? "/ibu" : "/app");
  }, [siap, u, router]);

  if (!MODE_AWAN) return <ServerBelumTersambung />;
  if (!siap || u) return <Memuat penuh />;

  const alamatIbu = alamatAkunIbu(cara, cara === "telepon" ? telepon : email);

  if (langkah === "pin" && alamatIbu) {
    return (
      <PapanPin
        judul="Masukkan PIN"
        sub="Masukkan PIN Anda untuk masuk ke Rangkul"
        onSelesai={async (pin) => {
          try {
            await masukAkun(alamatIbu, pin, true);
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

  if (langkah === "isi") {
    const bolehLanjut = kelompok === "ibu" ? !!alamatIbu : emailValid(email) && sandi.length > 0;
    const kirim = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!bolehLanjut) return;
      setGalat(null);
      if (kelompok === "ibu") return setLangkah("pin");
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
        <button onClick={() => setLangkah("sambutan")} className="-ml-2 mt-3 grid size-11 place-items-center rounded-full hover:bg-black/5" aria-label="Kembali">
          <ArrowLeft className="size-6" />
        </button>
        <div className="mt-2 inline-flex self-start rounded-full bg-bg p-1 text-sm font-semibold">
          {(["ibu", "petugas"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKelompok(k);
                setGalat(null);
                if (k === "petugas") setCara("email");
              }}
              className={k === kelompok ? "rounded-full bg-surface px-4 py-1.5 text-brand shadow-sm" : "px-4 py-1.5 text-muted"}
            >
              {k === "ibu" ? "Ibu" : "Kader / Nakes"}
            </button>
          ))}
        </div>
        <h1 className="mt-5 text-[28px] font-bold leading-tight">{kelompok === "ibu" ? "Masukkan Email atau Nomor Telepon" : "Masuk sebagai petugas"}</h1>

        <form onSubmit={kirim} className="mt-6 flex flex-1 flex-col">
          {kelompok === "ibu" ? (
            <>
              <TabGaris
                nilai={cara}
                setNilai={(c) => {
                  setCara(c);
                  setGalat(null);
                }}
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
            </>
          ) : (
            <div className="space-y-4">
              <Bidang label="Email">
                <Masukan type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@puskesmas.go.id" />
              </Bidang>
              <Bidang label="Kata sandi">
                <IsianSandi nilai={sandi} setNilai={setSandi} autoComplete="current-password" placeholder="Masukkan kata sandi" />
              </Bidang>
            </div>
          )}

          {galat && <p className="mt-4 rounded-xl bg-merah-soft px-4 py-3 text-sm font-medium text-merah">{galat}</p>}

          <div className="mt-auto pt-10">
            <p className="mb-4 text-center text-sm text-muted">
              Belum punya akun Rangkul?{" "}
              <Link href={`/daftar${kelompok === "petugas" ? "?peran=petugas" : ""}`} className="font-semibold text-brand">
                Daftar
              </Link>
            </p>
            <Tombol type="submit" className="w-full" disabled={!bolehLanjut} memuat={memuat}>
              {kelompok === "ibu" ? "Lanjut" : "Masuk"}
            </Tombol>
          </div>
        </form>
      </main>
    );
  }

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
      <Tombol className="w-full" onClick={() => setLangkah("isi")}>
        Masuk
      </Tombol>
      <Link href="/daftar" className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border-2 border-brand text-[15px] font-semibold text-brand transition active:scale-[0.98]">
        Daftar
      </Link>
      {URL_APK && (
        <a href={URL_APK} className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-brand">
          <Smartphone className="size-4" /> Unduh aplikasi Rangkul (APK) <Download className="size-4" />
        </a>
      )}
    </main>
  );
}
