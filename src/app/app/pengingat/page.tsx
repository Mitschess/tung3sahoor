"use client";

import { BellRing, History, Info } from "lucide-react";
import Link from "next/link";
import { KepalaHalaman } from "@/components/kepala";
import { TombolWa } from "@/components/tombol-wa";
import { JudulBagian, Kartu, Kosong, Lencana } from "@/components/ui";
import { namaPengguna, useDaftarRingkasan, useSekarang } from "@/lib/hooks";
import { daftarPengingat } from "@/lib/pengingat";
import { useStore } from "@/lib/store";
import { tampilWaktu } from "@/lib/tanggal";

export default function HalamanPengingat() {
  const now = useSekarang();
  const rs = useDaftarRingkasan();
  const log = useStore((s) => s.pengingat);
  const ids = new Set(rs.map((r) => r.ibu.id));
  const nama = (id: string) => String(rs.find((r) => r.ibu.id === id)?.ibu.profil.nama ?? "–");
  const daftar = daftarPengingat(rs, now);
  const terkirim = log.filter((l) => ids.has(l.ibuId));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <KepalaHalaman judul="Pengingat kunjungan" sub="Kirim lewat WhatsApp ke ibu dan suami/keluarga: H-2, hari H, dan H+2 bila belum datang." />
      <p className="flex gap-2 rounded-2xl bg-brand-soft/60 px-4 py-3 text-sm text-brand-ink">
        <Info className="mt-0.5 size-4 shrink-0" />
        Tombol membuka WhatsApp dengan pesan siap kirim (tautan wa.me, tanpa biaya API). Pesan hanya berisi jadwal & ajakan periksa. Hasil lab, HIV/sifilis/hepatitis B, dan kesehatan jiwa tidak pernah ikut terkirim.
      </p>

      <section>
        <JudulBagian>
          <span className="inline-flex items-center gap-2">
            <BellRing className="size-4 text-brand" /> Perlu diingatkan · {daftar.length}
          </span>
        </JudulBagian>
        {daftar.length ? (
          <div className="space-y-2">
            {daftar.map((p) => (
              <Kartu key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/app/ibu/${p.r.ibu.id}`} className="font-bold hover:text-brand">
                      {String(p.r.ibu.profil.nama)}
                    </Link>
                    <Lencana warna={p.mendesak ? "merah" : "brand"}>{p.label}</Lencana>
                  </div>
                  <p className="text-sm text-muted">{p.teks}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TombolWa r={p.r} ke="ibu" />
                  <TombolWa r={p.r} ke="pendamping" />
                </div>
              </Kartu>
            ))}
          </div>
        ) : (
          <Kosong judul="Tidak ada pengingat hari ini" teks="Semua ibu di wilayah Anda belum masuk jendela kunjungan." />
        )}
      </section>

      <section>
        <JudulBagian>
          <span className="inline-flex items-center gap-2">
            <History className="size-4 text-muted" /> Riwayat kirim
          </span>
        </JudulBagian>
        {terkirim.length ? (
          <Kartu className="divide-y divide-line p-0">
            {terkirim.slice(0, 30).map((l) => (
              <div key={l.id} className="px-4 py-3 text-sm">
                <p>
                  <b>{nama(l.ibuId)}</b> → {l.ke === "ibu" ? "ibu" : "pendamping"} · <span className="text-muted">{tampilWaktu(l.pada)} oleh {namaPengguna(l.oleh)}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{l.pesan}</p>
              </div>
            ))}
          </Kartu>
        ) : (
          <p className="text-sm text-muted">Belum ada pengingat yang dikirim dari perangkat ini.</p>
        )}
      </section>
    </div>
  );
}
