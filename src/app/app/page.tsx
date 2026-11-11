"use client";

import { Camera, CircleAlert, Forward, MessageCircle, Stethoscope, UserPlus } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { BarisIbu } from "@/components/baris-ibu";
import { JudulBagian, Kartu, Kosong, TautanTombol } from "@/components/ui";
import { LABEL_PERAN, bolehIsi } from "@/lib/akses";
import { useDaftarRingkasan, useSekarang, type Ringkasan } from "@/lib/hooks";
import { daftarPengingat } from "@/lib/pengingat";
import { usePengguna, useStore } from "@/lib/store";
import { cn, namaDepan } from "@/lib/util";

export default function BerandaStaf() {
  const u = usePengguna()!;
  const rs = useDaftarRingkasan();
  const now = useSekarang();
  const catatan = useStore((s) => s.catatan);
  const draf = useStore((s) => s.draf);

  const merah = rs.filter((r) => r.warna === "merah");
  const kuning = rs.filter((r) => r.warna === "kuning");
  const hijau = rs.filter((r) => r.warna === "hijau");
  const pengingat = daftarPengingat(rs, now);
  const salam = now.getHours() < 11 ? "Selamat pagi" : now.getHours() < 15 ? "Selamat siang" : now.getHours() < 18 ? "Selamat sore" : "Selamat malam";

  // Tindak lanjut kader yang gagal → diteruskan ke bidan
  const diteruskan = catatan.filter((c) => c.tabel === "tindak_lanjut" && c.data.diteruskan_ke && rs.some((r) => r.ibu.id === c.ibuId && r.peringatan.some((p) => p.id === c.data.peringatan_id)));

  // Dokter: jatuh tempo pemeriksaan dokter dan rujukan
  const jatuhTempoDokter: { r: Ringkasan; nama: string; status: string }[] = [];
  if (u.peran === "dokter") {
    for (const r of rs) {
      for (const k of r.jadwal) {
        if (k.oleh === "Dokter" && (k.status === "sekarang" || k.status === "terlambat")) jatuhTempoDokter.push({ r, nama: k.nama, status: k.status });
      }
    }
  }
  const rujukan = rs.flatMap((r) => r.cari("rujukan").filter((c) => !c.data.tanggal_balik).map((c) => ({ r, c })));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">
            {LABEL_PERAN[u.peran]}
            {u.posyandu ? ` · Posyandu ${u.posyandu.join(" & ")}` : " · seluruh wilayah puskesmas"}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {salam}, {u.peran === "dokter" ? u.nama : namaDepan(u.nama.replace(/^Bidan\s+/, ""))}
          </h1>
        </div>
        <div className="flex gap-2">
          {bolehIsi(u, "ibu") && (
            <TautanTombol href="/app/daftar" varian="garis" kecil>
              <UserPlus className="size-4" /> Daftarkan ibu
            </TautanTombol>
          )}
          <TautanTombol href="/app/foto" kecil>
            <Camera className="size-4" /> Foto Buku KIA
          </TautanTombol>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { n: merah.length, label: "Merah", sub: "hubungi hari ini", c: "from-merah-soft to-white text-merah" },
          { n: kuning.length, label: "Kuning", sub: "cek kunjungan terdekat", c: "from-kuning-soft to-white text-kuning" },
          { n: hijau.length, label: "Hijau", sub: "sesuai jadwal", c: "from-hijau-soft to-white text-hijau" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn("rounded-3xl border border-line bg-gradient-to-br p-4", s.c)}>
            <p className="text-3xl font-extrabold md:text-4xl">{s.n}</p>
            <p className="font-bold text-ink">{s.label}</p>
            <p className="hidden text-xs text-muted sm:block">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {draf.length > 0 && (
        <Link href="/app/foto" className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-4">
          <Camera className="size-5 text-brand" />
          <p className="flex-1 text-sm font-semibold text-brand-ink">{draf.length} foto Buku KIA menunggu konfirmasi. Data belum tersimpan sebelum dikonfirmasi.</p>
        </Link>
      )}

      {u.peran === "dokter" && (
        <section>
          <JudulBagian>
            <span className="inline-flex items-center gap-2">
              <Stethoscope className="size-4 text-brand" /> Jatuh tempo pemeriksaan dokter
            </span>
          </JudulBagian>
          {jatuhTempoDokter.length === 0 ? (
            <Kosong judul="Tidak ada" teks="Pemeriksaan dokter T1 (< 12 minggu) dan T3 (32–36 minggu) akan muncul di sini." />
          ) : (
            <div className="space-y-2">
              {jatuhTempoDokter.map((j) => (
                <BarisIbu key={j.r.ibu.id + j.nama} r={j.r} catatan={`${j.nama}${j.status === "terlambat" ? " · terlambat" : ""}`} />
              ))}
            </div>
          )}
        </section>
      )}

      {(u.peran === "dokter" || u.peran === "bidan") && rujukan.length > 0 && (
        <section>
          <JudulBagian>Rujukan menunggu rujukan balik</JudulBagian>
          <div className="space-y-2">
            {rujukan.map(({ r, c }) => (
              <BarisIbu key={c.id} r={r} catatan={`Dirujuk ke ${c.data.tujuan} · ${new Date(String(c.data.tanggal_rujuk)).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`} />
            ))}
          </div>
        </section>
      )}

      {u.peran === "bidan" && diteruskan.length > 0 && (
        <section>
          <JudulBagian>
            <span className="inline-flex items-center gap-2">
              <Forward className="size-4 text-merah" /> Diteruskan kader ke bidan
            </span>
          </JudulBagian>
          <div className="space-y-2">
            {diteruskan.map((c) => {
              const r = rs.find((x) => x.ibu.id === c.ibuId)!;
              return <BarisIbu key={c.id} r={r} catatan={`Kader: ${c.data.hasil} — ${c.data.catatan ?? ""}`} />;
            })}
          </div>
        </section>
      )}

      <section>
        <JudulBagian aksi={<Link href="/app/ibu" className="text-sm font-semibold text-brand">Semua ibu ({rs.length})</Link>}>
          <span className="inline-flex items-center gap-2">
            <CircleAlert className="size-4 text-merah" /> Perlu ditindaklanjuti
          </span>
        </JudulBagian>
        {merah.length + kuning.length === 0 ? (
          <Kosong judul="Semua hijau" teks="Tidak ada ibu dengan peringatan terbuka." />
        ) : (
          <div className="space-y-2">
            {[...merah, ...kuning].map((r) => (
              <BarisIbu key={r.ibu.id} r={r} />
            ))}
          </div>
        )}
      </section>

      {u.peran !== "dokter" && (
        <section>
          <JudulBagian aksi={<Link href="/app/pengingat" className="text-sm font-semibold text-brand">Kirim pengingat</Link>}>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="size-4 text-hijau" /> Jadwal kunjungan & pengingat
            </span>
          </JudulBagian>
          {pengingat.length === 0 ? (
            <Kosong judul="Tidak ada jadwal dalam 3 hari" />
          ) : (
            <Kartu className="divide-y divide-line p-0">
              {pengingat.slice(0, 6).map((p) => (
                <Link key={p.id} href={`/app/ibu/${p.r.ibu.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-bg">
                  <span className={cn("w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold", p.mendesak ? "bg-kuning-soft text-kuning" : "bg-brand-soft text-brand-ink")}>{p.label}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{String(p.r.ibu.profil.nama)}</p>
                    <p className="truncate text-xs text-muted">{p.teks}</p>
                  </div>
                </Link>
              ))}
            </Kartu>
          )}
        </section>
      )}
    </div>
  );
}
