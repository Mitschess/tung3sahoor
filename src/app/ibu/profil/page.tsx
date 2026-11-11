"use client";

import { ChevronRight, CreditCard, Globe, HeartHandshake, Info, LifeBuoy, LogOut, Phone, QrCode, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { Baris, Memuat, Modal } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { tampil } from "@/lib/tanggal";

type Lembar = "kartu" | "keluarga" | "privasi" | "tentang" | null;

export default function Profil() {
  const u = usePengguna();
  const r = useRingkasan(u?.ibuId);
  const keluar = useStore((s) => s.keluar);
  const router = useRouter();
  const [lembar, setLembar] = useState<Lembar>(null);
  if (!r) return <Memuat />;
  const p = r.ibu.profil;
  const k = r.ibu.keluarga;

  return (
    <div className="space-y-6 px-4 pt-5">
      <h1 className="text-xl font-bold">Profil</h1>

      <section className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">
        <div className="flex items-start gap-4 p-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#dfe6ee] text-muted">
            <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
            </svg>
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[17px] font-bold uppercase leading-tight">{String(p.nama)}</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Phone className="size-4" /> {String(p.telepon ?? "–")}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <CreditCard className="size-4" /> {r.ibu.nikSamaran}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setLembar("kartu")} className="flex w-full items-center gap-3 bg-brand-soft/70 px-4 py-3.5 text-left font-semibold text-brand-ink">
          <QrCode className="size-5" />
          <span className="flex-1">Kartu Ibu Digital</span>
          <ChevronRight className="size-5" />
        </button>
      </section>

      <button type="button" onClick={() => setLembar("privasi")} className="block w-full rounded-2xl bg-gradient-to-r from-brand to-[#4fa0f7] p-4 text-left text-white">
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-[17px] font-bold">Data Ibu terlindungi</span>
            <span className="mt-1 block text-sm text-white/85">Lihat siapa saja yang bisa melihat data Ibu</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">
              Selengkapnya <ChevronRight className="size-4" />
            </span>
          </span>
          <ShieldCheck className="size-12 shrink-0 text-white/90" />
        </span>
      </button>

      <Grup judul="Informasi Umum">
        <Baris2 ikon={Users} label="Suami / Keluarga" onClick={() => setLembar("keluarga")} />
        <Baris2 ikon={HeartHandshake} label={`Posyandu ${String(p.wilayah_posyandu)}`} sub={String(p.puskesmas_domisili ?? p.faskes_tk1 ?? "")} />
        <Baris2 ikon={LifeBuoy} label="Nomor Gawat Darurat Nasional" sub="119" href="tel:119" />
        <Baris2 ikon={Info} label="Tentang MOMCARE" onClick={() => setLembar("tentang")} />
      </Grup>

      <Grup judul="Preferensi">
        <Baris2 ikon={Globe} label="Bahasa" sub="Bahasa Indonesia" />
        <Baris2
          ikon={LogOut}
          label="Keluar"
          onClick={() => {
            keluar();
            router.push("/masuk");
          }}
        />
      </Grup>

      <Modal buka={lembar === "kartu"} setBuka={() => setLembar(null)} judul="Kartu Ibu Digital" deskripsi="Tunjukkan saat datang ke posyandu atau puskesmas.">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-[#1765c7] p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <LogoMark className="size-7 bg-white text-brand" /> MOMCARE
            </span>
            <span className="text-xs text-white/80">Posyandu {String(p.wilayah_posyandu)}</span>
          </div>
          <p className="mt-6 text-lg font-bold uppercase">{String(p.nama)}</p>
          <p className="font-mono text-sm tracking-widest text-white/85">{r.ibu.nikSamaran}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <span>
              <span className="block text-white/70">Gol. darah</span>
              <b>{`${p.golongan_darah ?? "–"}${p.rhesus && p.rhesus !== "belum tahu" ? p.rhesus : ""}`}</b>
            </span>
            <span>
              <span className="block text-white/70">{r.tahap.set === "hamil" ? "HPL" : "Tahap"}</span>
              <b>{r.tahap.set === "hamil" && r.tahap.hpl ? tampil(r.tahap.hpl) : r.tahap.label}</b>
            </span>
            <span>
              <span className="block text-white/70">No. JKN</span>
              <b>{p.no_jkn ? `••••${String(p.no_jkn).slice(-4)}` : "–"}</b>
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">Kartu ini tidak menggantikan Buku KIA dan kartu JKN.</p>
      </Modal>

      <Modal buka={lembar === "keluarga"} setBuka={() => setLembar(null)} judul="Suami / Keluarga" deskripsi="Ikut menerima pengingat jadwal periksa lewat WhatsApp.">
        <Baris label="Nama">{String(k.nama_pendamping ?? "–")}</Baris>
        <Baris label="Hubungan">{String(k.hubungan ?? "–")}</Baris>
        <Baris label="Telepon">{String(k.telepon_pendamping ?? "–")}</Baris>
        <Baris label="Golongan darah">{String(k.golongan_darah_pendamping ?? "–")}</Baris>
        <p className="mt-3 text-xs text-muted">Pesan ke keluarga hanya berisi jadwal, tidak berisi hasil pemeriksaan. Perubahan data dilakukan oleh kader/bidan.</p>
      </Modal>

      <Modal buka={lembar === "privasi"} setBuka={() => setLembar(null)} judul="Data Ibu terlindungi">
        <ul className="space-y-3 text-sm">
          <li>
            <b>Siapa yang melihat:</b> kader Posyandu {String(p.wilayah_posyandu)}, bidan wilayah, dan dokter puskesmas.
          </li>
          <li>
            <b>Data sensitif</b> (tes HIV/sifilis/hepatitis B dan skrining kesehatan jiwa) hanya dilihat bidan/dokter dan tidak pernah dikirim ke keluarga.
          </li>
          <li>
            <b>NIK</b> disimpan tersandi; yang tampil hanya 4 digit terakhir.
          </li>
          <li>
            <b>Foto Buku KIA</b> dihapus setelah datanya dicek petugas.
          </li>
          <li>
            Ibu menyetujui pada <b>{tampil(r.ibu.persetujuan.tanggal)}</b> (teks {r.ibu.persetujuan.versi}). Ibu boleh berhenti kapan saja tanpa memengaruhi pelayanan.
          </li>
        </ul>
      </Modal>

      <Modal buka={lembar === "tentang"} setBuka={() => setLembar(null)} judul="Tentang MOMCARE">
        <p className="text-sm text-muted">
          MOMCARE membantu Ibu, kader, bidan, dan dokter memakai isi Buku KIA Kemenkes 2024 sehari-hari: jadwal periksa, pemantauan, dan tanda bahaya. MOMCARE tidak menggantikan Buku KIA dan pemeriksaan tenaga kesehatan.
        </p>
      </Modal>
    </div>
  );
}

function Grup({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[15px] font-semibold text-muted">{judul}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-kartu)]">{children}</div>
    </section>
  );
}

function Baris2({ ikon: Ikon, label, sub, onClick, href }: { ikon: LucideIcon; label: string; sub?: string; onClick?: () => void; href?: string }) {
  const isi = (
    <>
      <Ikon className="size-6 shrink-0 text-brand" strokeWidth={1.8} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px]">{label}</span>
        {sub && <span className="block truncate text-xs text-muted">{sub}</span>}
      </span>
      {(onClick || href) && <ChevronRight className="size-5 shrink-0 text-brand" />}
    </>
  );
  const kelas = "flex w-full items-center gap-4 px-4 py-4 text-left";
  if (href)
    return (
      <a href={href} className={kelas}>
        {isi}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={kelas}>
        {isi}
      </button>
    );
  return <div className={kelas}>{isi}</div>;
}
