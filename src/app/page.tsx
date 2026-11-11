import { ArrowRight, BellRing, BookOpenCheck, Camera, HeartHandshake, ShieldCheck, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ringkasKamus } from "@/lib/kamus";

const ALUR = [
  { ikon: Users, judul: "Kader mendaftarkan ibu", teks: "Dengan persetujuan ibu. NIK disimpan sebagai hash, kader hanya melihat ibu di wilayah posyandunya." },
  { ikon: Camera, judul: "Foto tabel Buku KIA", teks: "AI membaca tabel pemeriksaan; angka yang ragu ditandai kuning dan wajib dikonfirmasi sebelum tersimpan." },
  { ikon: BellRing, judul: "Peringatan Merah/Kuning/Hijau", teks: "Aturan dari Buku KIA: tekanan darah, LiLA, tanda bahaya, kunjungan terlambat. Bidan diberi tahu hari itu juga." },
  { ikon: HeartHandshake, judul: "Ibu & keluarga diingatkan", teks: "Ibu mengisi lembar pemantauan di HP; suami ikut menerima pengingat jadwal periksa lewat WhatsApp." },
];

export default function Beranda() {
  const k = ringkasKamus();
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]">
        <div className="aurora-blob absolute -left-24 top-10 size-[420px] rounded-full bg-[#c9b6ff]/60" />
        <div className="aurora-blob absolute right-0 top-0 size-[380px] rounded-full bg-[#ffc2d4]/60 [animation-delay:-7s]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Link href="/masuk" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/85">
          Masuk demo
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:pt-16">
        <div className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-ink backdrop-blur">
              <ShieldCheck className="size-3.5" /> Inclusive Health &amp; Well-being · Logicodix 2026
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink md:text-6xl">
              Buku KIA yang tidak berhenti <span className="bg-gradient-to-r from-brand to-rose bg-clip-text text-transparent">di kertas.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              MOMCARE memastikan tidak ada ibu hamil dan bayi baru lahir di wilayah kader yang terlewat: dari pemeriksaan kehamilan K1–K6, persalinan, nifas, sampai bayi 28 hari.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/masuk" className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 font-semibold text-white shadow-[0_10px_30px_-10px_var(--brand)] hover:bg-brand-ink">
                Coba sebagai ibu, kader, bidan, atau dokter <ArrowRight className="size-4" />
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                [String(k.jumlahTabel), "tabel kamus data"],
                [String(k.jumlahKolom), "isian Buku KIA"],
                ["4", "peran pengguna"],
              ].map(([a, b]) => (
                <div key={b}>
                  <dt className="text-3xl font-extrabold text-ink">{a}</dt>
                  <dd className="text-xs font-medium text-muted">{b}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-[2.2rem] border border-white/60 bg-white/70 p-3 shadow-2xl shadow-brand/20 backdrop-blur">
              <div className="rounded-[1.7rem] bg-gradient-to-br from-[#6d3fd8] via-[#7b4ae0] to-[#e5537a] p-5 text-white">
                <p className="text-sm text-white/80">Halo, Bu Siti 👋</p>
                <p className="mt-1 text-2xl font-extrabold">Hamil 34 minggu</p>
                <p className="text-sm text-white/85">Trimester 3 · sebesar pepaya 🥭</p>
                <div className="mt-4 h-2 rounded-full bg-white/25">
                  <div className="h-2 w-[85%] rounded-full bg-white" />
                </div>
              </div>
              <div className="space-y-2 p-2 pt-3">
                <div className="flex items-center gap-3 rounded-2xl border border-merah/25 bg-merah-soft/60 p-3">
                  <span className="pulse-merah size-2.5 rounded-full bg-merah" />
                  <div className="text-sm">
                    <p className="font-bold">Tekanan darah tinggi</p>
                    <p className="text-xs text-muted">145/95 mmHg · Buku KIA hlm. 96</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                  <Stethoscope className="size-5 text-brand" />
                  <div className="text-sm">
                    <p className="font-bold">Pemeriksaan dokter T3</p>
                    <p className="text-xs text-muted">Jatuh tempo minggu ini</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                  <BookOpenCheck className="size-5 text-hijau" />
                  <div className="text-sm">
                    <p className="font-bold">Isi pemantauan minggu ke-34</p>
                    <p className="text-xs text-muted">Lembar ibu hamil · hlm. 12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-4">
          {ALUR.map(({ ikon: Ikon, judul, teks }, i) => (
            <div key={judul}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Ikon className="size-5" />
                </span>
                <span className="text-xs font-bold text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-bold">{judul}</h3>
              <p className="mt-1 text-sm text-muted">{teks}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-ink p-6 text-white md:col-span-2">
            <h2 className="text-2xl font-extrabold">Mengapa sampai bayi 28 hari dulu?</h2>
            <p className="mt-3 text-white/75">
              Buku KIA menulis bahwa kematian ibu tertinggi terjadi pada masa setelah melahirkan, dan dua pertiga kematian balita di Indonesia terjadi pada 28 hari pertama. Karena itu lapisan pertama MOMCARE
              mencakup kehamilan T1–T3, melahirkan, nifas 42 hari, dan bayi 0–28 hari. Struktur data sudah disiapkan sampai anak 6 tahun.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6">
            <h2 className="font-bold">Batasan yang kami pegang</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>• Peringatan bukan diagnosis; keputusan tetap pada bidan/dokter.</li>
              <li>• Tidak menggantikan Buku KIA maupun layanan gawat darurat.</li>
              <li>• Data hasil foto baru tersimpan setelah dikonfirmasi.</li>
              <li>• Data demo seluruhnya palsu.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-muted">
        Isi medis mengikuti Buku Kesehatan Ibu dan Anak, Kementerian Kesehatan RI 2024. MOMCARE tidak berafiliasi dengan Kemenkes. Tim TUNG3SAHOOR · Logicodix 2026.
      </footer>
    </main>
  );
}
