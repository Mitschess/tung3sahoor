"use client";

import { ArrowLeft, BriefcaseMedical, ChevronRight, HeartPulse, Info, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Bidang, IsianSandi, IsianTelepon, IsiSyarat, PapanPin, TabGaris } from "@/components/akun";
import { Masukan, Memuat, Modal, Pilihan, Tombol } from "@/components/ui";
import {
  SYARAT_IBU,
  SYARAT_NAKES,
  cekDataIbu,
  cekDataNakes,
  cekPin,
  cekSandi,
  daftarIbuMandiri,
  daftarNakes,
  type CaraMasuk,
  type PeranNakes,
} from "@/lib/akun";
import { LABEL_PERAN } from "@/lib/akses";
import { useSiap } from "@/lib/hooks";
import { POSYANDU } from "@/lib/seed";
import { MODE_AWAN, usePengguna } from "@/lib/store";
import { iso } from "@/lib/tanggal";
import { cn } from "@/lib/util";

export default function Daftar() {
  // Suspense diperlukan karena layar ini membaca URL (?peran=petugas dari layar masuk).
  return <Suspense fallback={<Memuat penuh />}>{MODE_AWAN ? <DaftarIsi /> : <TanpaServer />}</Suspense>;
}

function TanpaServer() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      <Info className="size-10 text-brand" />
      <h1 className="text-xl font-bold">Pendaftaran butuh server</h1>
      <p className="text-sm text-muted">Rangkul sedang berjalan dalam mode demo. Isi NEXT_PUBLIC_SUPABASE_URL dan kuncinya di .env.local agar akun bisa didaftarkan.</p>
      <Link href="/masuk?pilih" className="mt-2 font-semibold text-brand">
        Pakai akun demo
      </Link>
    </main>
  );
}

function DaftarIsi() {
  const siap = useSiap();
  const u = usePengguna();
  const router = useRouter();
  const awal = useSearchParams().get("peran") === "petugas" ? "petugas" : null;
  const [peran, setPeran] = useState<"ibu" | "petugas" | null>(awal);

  useEffect(() => {
    if (siap && u) router.replace(u.peran === "ibu" ? "/ibu" : "/app");
  }, [siap, u, router]);

  if (!siap || u) return <Memuat penuh />;
  if (peran === "ibu") return <DaftarIbu kembali={() => setPeran(null)} />;
  if (peran === "petugas") return <DaftarPetugas kembali={() => setPeran(null)} />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-5 pb-8">
      <Link href="/masuk" className="-ml-2 mt-3 grid size-11 place-items-center rounded-full hover:bg-black/5" aria-label="Kembali">
        <ArrowLeft className="size-6" />
      </Link>
      <h1 className="mt-4 text-[28px] font-bold leading-tight">Daftar akun Rangkul</h1>
      <p className="mt-2 text-[15px] text-muted">Pilih siapa yang mendaftar.</p>
      <div className="mt-6 space-y-3">
        <PilihPeran ikon={<HeartPulse className="size-6" />} judul="Saya Ibu" teks="Ibu hamil atau nifas. Masuk dengan nomor HP/email dan PIN 6 angka." onClick={() => setPeran("ibu")} />
        <PilihPeran ikon={<BriefcaseMedical className="size-6" />} judul="Saya Kader / Bidan / Dokter" teks="Petugas posyandu dan puskesmas. Masuk dengan email dan kata sandi." onClick={() => setPeran("petugas")} />
      </div>
      <p className="mt-auto pt-10 text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/masuk?pilih" className="font-semibold text-brand">
          Masuk
        </Link>
      </p>
    </main>
  );
}

function PilihPeran({ ikon, judul, teks, onClick }: { ikon: React.ReactNode; judul: string; teks: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl bg-surface p-4 text-left shadow-[var(--shadow-kartu)] transition active:scale-[0.99]">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">{ikon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold">{judul}</span>
        <span className="block text-sm text-muted">{teks}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-brand" />
    </button>
  );
}

function Kepala({ kembali, judul, sub }: { kembali: () => void; judul: string; sub: string }) {
  return (
    <>
      <button type="button" onClick={kembali} className="-ml-2 mt-3 grid size-11 place-items-center rounded-full hover:bg-black/5" aria-label="Kembali">
        <ArrowLeft className="size-6" />
      </button>
      <h1 className="mt-2 text-[26px] font-bold leading-tight">{judul}</h1>
      <p className="mt-1 text-sm text-muted">{sub}</p>
    </>
  );
}

/** Ibu: Syarat & Ketentuan → Lengkapi Identitas Diri → Buat PIN → Konfirmasi PIN. */
function DaftarIbu({ kembali }: { kembali: () => void }) {
  const router = useRouter();
  const [setuju, setSetuju] = useState(false);
  const [sudahSetuju, setSudahSetuju] = useState(false);
  const [langkah, setLangkah] = useState<"identitas" | "pin" | "ulang">("identitas");
  const [cara, setCara] = useState<CaraMasuk>("telepon");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [lahir, setLahir] = useState("");
  const [posyandu, setPosyandu] = useState("");
  const [pin, setPin] = useState("");
  const [coba, setCoba] = useState(false);
  const [galatKirim, setGalatKirim] = useState<string | null>(null);

  const data = { cara, nilai: cara === "telepon" ? telepon : email, nama, nik, tanggalLahir: lahir, posyandu };
  const salah = cekDataIbu(data);

  if (langkah === "pin") {
    return (
      <PapanPin
        key="pin"
        judul="Buat PIN"
        sub="Buat 6 angka PIN untuk masuk ke Rangkul. Jangan beri tahu siapa pun."
        onSelesai={async (p) => {
          const m = cekPin(p);
          if (m) return m;
          setPin(p);
          setLangkah("ulang");
          return null;
        }}
        bawah={
          <button type="button" onClick={() => setLangkah("identitas")}>
            Kembali ke identitas
          </button>
        }
      />
    );
  }

  if (langkah === "ulang") {
    return (
      <PapanPin
        key="ulang"
        judul="Konfirmasi PIN"
        sub="Masukkan sekali lagi PIN yang baru dibuat."
        onSelesai={async (p) => {
          if (p !== pin) return "PIN tidak sama. Coba lagi.";
          try {
            await daftarIbuMandiri({ ...data, pin });
            toast.success("Akun Ibu sudah dibuat. Selamat datang di Rangkul!");
            router.replace("/ibu");
            return null;
          } catch (e) {
            setGalatKirim((e as Error).message);
            setLangkah("identitas");
            return (e as Error).message;
          }
        }}
        bawah={
          <button type="button" onClick={() => setLangkah("pin")}>
            Buat ulang PIN
          </button>
        }
      />
    );
  }

  const nikBersih = nik.replace(/\D/g, "");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-5 pb-8">
      <Kepala kembali={kembali} judul="Lengkapi Identitas Diri" sub="Agar data Buku KIA Ibu tersambung dengan kader, bidan, dan dokter puskesmas." />
      <form
        className="mt-5 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setCoba(true);
          setGalatKirim(null);
          if (!salah) setLangkah("pin");
        }}
      >
        <Bidang label="Cara masuk" wajib>
          <TabGaris
            nilai={cara}
            setNilai={setCara}
            pilihan={[
              { nilai: "telepon", label: "Nomor Telepon" },
              { nilai: "email", label: "Email" },
            ]}
          />
        </Bidang>
        {cara === "telepon" ? (
          <Bidang label="Nomor Telepon" wajib kanan={`${telepon.length}/13`}>
            <IsianTelepon nilai={telepon} setNilai={setTelepon} />
          </Bidang>
        ) : (
          <Bidang label="Email" wajib>
            <Masukan type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email" />
          </Bidang>
        )}
        <Bidang label="Nama Lengkap" wajib ket="Nama harus sesuai dengan KTP">
          <Masukan autoComplete="name" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama lengkap" />
        </Bidang>
        <Bidang label="NIK" wajib kanan={`${nikBersih.length}/16`} ket={<span className="inline-flex items-center gap-1"><Lock className="size-3" /> Disimpan tersandi, yang tampil hanya 4 angka terakhir</span>}>
          <Masukan inputMode="numeric" maxLength={16} value={nikBersih} onChange={(e) => setNik(e.target.value)} placeholder="Masukkan NIK sesuai KTP" />
        </Bidang>
        <Bidang label="Tanggal Lahir" wajib>
          <Masukan type="date" max={iso(new Date())} value={lahir} onChange={(e) => setLahir(e.target.value)} />
        </Bidang>
        <Bidang label="Posyandu" wajib ket="Tempat Ibu biasa menimbang dan periksa">
          <Pilihan value={posyandu} onChange={(e) => setPosyandu(e.target.value)}>
            <option value="">Pilih posyandu</option>
            {POSYANDU.map((p) => (
              <option key={p} value={p}>
                Posyandu {p}
              </option>
            ))}
          </Pilihan>
        </Bidang>
        <p className="flex gap-2 rounded-2xl bg-brand-soft/70 px-4 py-3 text-sm text-brand-ink">
          <Info className="mt-0.5 size-4 shrink-0" />
          Sudah didaftarkan kader atau bidan? Isi NIK dan tanggal lahir yang sama, catatan Buku KIA Ibu langsung tersambung.
        </p>
        {((coba && salah) || galatKirim) && <p role="alert" className="rounded-xl bg-merah-soft px-4 py-3 text-sm font-medium text-merah">{(coba && salah) || galatKirim}</p>}
        <Tombol type="submit" className="w-full">
          Lanjut buat PIN
        </Tombol>
      </form>

      <Modal buka={!sudahSetuju} setBuka={() => undefined} tanpaTutup judul="Syarat & Ketentuan">
        <IsiSyarat judul="Syarat & Ketentuan Penggunaan dan Pemberitahuan Privasi Rangkul" poin={SYARAT_IBU} setuju={setuju} setSetuju={setSetuju} onSetuju={() => setSudahSetuju(true)} />
        <button type="button" onClick={kembali} className="mt-3 w-full py-2 text-sm font-semibold text-muted">
          Batal
        </button>
      </Modal>
    </main>
  );
}

const PERAN_NAKES: PeranNakes[] = ["kader", "bidan", "dokter"];

/** Kader / bidan / dokter: Syarat & Ketentuan → data petugas + kata sandi. */
function DaftarPetugas({ kembali }: { kembali: () => void }) {
  const router = useRouter();
  const [setuju, setSetuju] = useState(false);
  const [sudahSetuju, setSudahSetuju] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [peran, setPeran] = useState<PeranNakes>("kader");
  const [posyandu, setPosyandu] = useState<string[]>([]);
  const [sandi, setSandi] = useState("");
  const [ulang, setUlang] = useState("");
  const [coba, setCoba] = useState(false);
  const [memuat, setMemuat] = useState(false);

  const data = { nama, email, telepon, peran, posyandu };
  const salah = cekDataNakes(data) ?? cekSandi(sandi) ?? (sandi !== ulang ? "Ulangi kata sandi belum sama." : null);

  const pilihPosyandu = (p: string) => {
    if (peran === "kader") return setPosyandu([p]);
    setPosyandu((lama) => (lama.includes(p) ? lama.filter((x) => x !== p) : [...lama, p]));
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-5 pb-8">
      <Kepala kembali={kembali} judul="Lengkapi Data Petugas" sub="Akun ini dipakai untuk melihat dan mencatat data ibu di wilayah kerja Anda." />
      <form
        className="mt-5 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setCoba(true);
          if (salah) return;
          setMemuat(true);
          try {
            await daftarNakes({ ...data, sandi });
            toast.success("Akun petugas sudah dibuat.");
            router.replace("/app");
          } catch (err) {
            toast.error((err as Error).message);
            setMemuat(false);
          }
        }}
      >
        <Bidang label="Peran" wajib>
          <div className="grid grid-cols-3 gap-2">
            {PERAN_NAKES.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={peran === p}
                onClick={() => {
                  setPeran(p);
                  setPosyandu(p === "kader" ? posyandu.slice(0, 1) : posyandu);
                }}
                className={cn("h-11 rounded-xl border text-sm font-semibold transition", peran === p ? "border-brand bg-brand-soft text-brand-ink" : "border-line text-muted")}
              >
                {p === "bidan" ? "Bidan" : LABEL_PERAN[p]}
              </button>
            ))}
          </div>
        </Bidang>
        <Bidang label="Nama Lengkap" wajib ket={peran === "dokter" ? "Contoh: dr. Andi Pratama" : peran === "bidan" ? "Contoh: Bidan Lestari Wulandari" : undefined}>
          <Masukan autoComplete="name" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama lengkap" />
        </Bidang>
        <Bidang label="Email" wajib>
          <Masukan type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@puskesmas.go.id" />
        </Bidang>
        <Bidang label="Nomor Telepon" ket="Opsional, untuk dihubungi kader/bidan lain">
          <IsianTelepon nilai={telepon} setNilai={setTelepon} />
        </Bidang>
        {peran === "dokter" ? (
          <p className="rounded-2xl bg-bg px-4 py-3 text-sm text-muted">Dokter melihat ibu di seluruh wilayah puskesmas.</p>
        ) : (
          <Bidang label={peran === "kader" ? "Posyandu" : "Wilayah kerja"} wajib ket={peran === "kader" ? "Pilih satu posyandu" : "Boleh lebih dari satu posyandu"}>
            <div className="flex flex-wrap gap-2">
              {POSYANDU.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={posyandu.includes(p)}
                  onClick={() => pilihPosyandu(p)}
                  className={cn("h-10 rounded-full border px-4 text-sm font-semibold transition", posyandu.includes(p) ? "border-brand bg-brand-soft text-brand-ink" : "border-line text-muted")}
                >
                  {p}
                </button>
              ))}
            </div>
          </Bidang>
        )}
        <Bidang label="Kata Sandi" wajib ket="Minimal 8 karakter, berisi huruf dan angka">
          <IsianSandi nilai={sandi} setNilai={setSandi} autoComplete="new-password" placeholder="Buat kata sandi" />
        </Bidang>
        <Bidang label="Ulangi Kata Sandi" wajib>
          <IsianSandi nilai={ulang} setNilai={setUlang} autoComplete="new-password" placeholder="Ketik ulang kata sandi" />
        </Bidang>
        {coba && salah && <p className="rounded-xl bg-merah-soft px-4 py-3 text-sm font-medium text-merah">{salah}</p>}
        <Tombol type="submit" className="w-full" memuat={memuat}>
          Daftar
        </Tombol>
      </form>

      <Modal buka={!sudahSetuju} setBuka={() => undefined} tanpaTutup judul="Syarat & Ketentuan">
        <IsiSyarat judul="Syarat & Ketentuan Petugas Rangkul" poin={SYARAT_NAKES} setuju={setuju} setSetuju={setSetuju} onSetuju={() => setSudahSetuju(true)} />
        <button type="button" onClick={kembali} className="mt-3 w-full py-2 text-sm font-semibold text-muted">
          Batal
        </button>
      </Modal>
    </main>
  );
}
