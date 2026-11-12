"use client";

import { ChevronRight, CreditCard, HeartHandshake, Info, LogOut, Phone, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Baris, Memuat, Modal } from "@/components/ui";
import { useRingkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { tampil } from "@/lib/tanggal";
import { inisial } from "@/lib/util";

type Lembar = "keluarga" | "privasi" | "tentang" | null;

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

      <section className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand-ink" aria-hidden>
          {inisial(p.nama)}
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-[17px] font-bold leading-tight">{String(p.nama)}</p>
          <p className="text-sm text-muted">{r.tahap.label}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Phone className="size-3.5" /> {String(p.telepon ?? "–")}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CreditCard className="size-3.5" /> NIK {r.ibu.nikSamaran}
          </p>
        </div>
      </section>

      <Grup judul="Data Ibu">
        <Baris2 ikon={Users} label="Suami / Keluarga" sub="Ikut menerima pengingat jadwal periksa" onClick={() => setLembar("keluarga")} />
        <Baris2 ikon={HeartHandshake} label={`Posyandu ${String(p.wilayah_posyandu)}`} sub={String(p.puskesmas_domisili ?? p.faskes_tk1 ?? "")} />
        <Baris2 ikon={ShieldCheck} label="Privasi data" sub="Siapa saja yang bisa melihat data Ibu" onClick={() => setLembar("privasi")} />
      </Grup>

      <Grup judul="Lainnya">
        <Baris2 ikon={Info} label="Tentang MOMCARE" onClick={() => setLembar("tentang")} />
        <Baris2
          ikon={LogOut}
          label="Keluar"
          onClick={() => {
            keluar();
            router.push("/masuk");
          }}
        />
      </Grup>

      <Modal buka={lembar === "keluarga"} setBuka={() => setLembar(null)} judul="Suami / Keluarga" deskripsi="Ikut menerima pengingat jadwal periksa lewat WhatsApp.">
        <Baris label="Nama">{String(k.nama_pendamping ?? "–")}</Baris>
        <Baris label="Hubungan">{String(k.hubungan ?? "–")}</Baris>
        <Baris label="Telepon">{String(k.telepon_pendamping ?? "–")}</Baris>
        <Baris label="Golongan darah">{String(k.golongan_darah_pendamping ?? "–")}</Baris>
        <p className="mt-3 text-xs text-muted">Pesan ke keluarga hanya berisi jadwal, tidak berisi hasil pemeriksaan. Perubahan data dilakukan oleh kader/bidan.</p>
      </Modal>

      <Modal buka={lembar === "privasi"} setBuka={() => setLembar(null)} judul="Privasi data">
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
      <h2 className="mb-2.5 text-sm font-semibold text-muted">{judul}</h2>
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
      {(onClick || href) && <ChevronRight className="size-5 shrink-0 text-muted" />}
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
