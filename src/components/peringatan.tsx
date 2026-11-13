"use client";

import { CheckCircle2, ChevronDown, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { bolehTutupPeringatan } from "@/lib/akses";
import { kamus } from "@/lib/kamus";
import { namaPengguna, type Ringkasan } from "@/lib/hooks";
import { usePengguna, useStore } from "@/lib/store";
import { tampilWaktu } from "@/lib/tanggal";
import type { Peringatan } from "@/lib/types";
import { cn } from "@/lib/util";
import { KamusForm } from "./kamus-form";
import { Kosong, Lencana, Masukan, Modal, TautanBuku, TitikLevel, Tombol } from "./ui";

export function DaftarPeringatan({ r, kosong = "Tidak ada peringatan terbuka. Semua sesuai jadwal." }: { r: Ringkasan; kosong?: string }) {
  const statusMap = useStore((s) => s.status);
  const u = usePengguna();
  const ditutup = r.semua.filter((p) => statusMap[p.id] && (!p.sensitif || u?.peran === "bidan" || u?.peran === "dokter"));
  return (
    <div className="space-y-3">
      {r.peringatan.length === 0 ? (
        <Kosong ikon={<ShieldCheck className="size-8 text-hijau" />} judul="Hijau" teks={kosong} />
      ) : (
        r.peringatan.map((p) => <ItemPeringatan key={p.id} p={p} r={r} />)
      )}
      {ditutup.length > 0 && (
        <details className="group rounded-2xl border border-line bg-surface/60 px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-muted">
            {ditutup.length} peringatan sudah ditutup
            <ChevronDown className="size-4 transition group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-2">
            {ditutup.map((p) => (
              <Ditutup key={p.id} p={p} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Ditutup({ p }: { p: Peringatan }) {
  const st = useStore((s) => s.status[p.id]);
  const buka = useStore((s) => s.bukaLagiPeringatan);
  const u = usePengguna();
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-bg px-3 py-2 text-sm">
      <div>
        <p className="font-semibold line-through decoration-muted/50">{p.judul}</p>
        <p className="text-xs text-muted">
          Ditutup {namaPengguna(st?.oleh)} · {tampilWaktu(st?.pada)} · “{st?.catatan}”
        </p>
      </div>
      {bolehTutupPeringatan(u) && (
        <button className="shrink-0 rounded-full p-1.5 text-muted hover:bg-black/5" title="Buka lagi" onClick={() => buka(p.id)}>
          <RotateCcw className="size-4" />
        </button>
      )}
    </div>
  );
}

export function ItemPeringatan({ p, r, ringkas }: { p: Peringatan; r: Ringkasan; ringkas?: boolean }) {
  const u = usePengguna();
  const catatan = useStore((s) => s.catatan);
  const simpan = useStore((s) => s.simpan);
  const tutup = useStore((s) => s.tutupPeringatan);
  const [modalTL, setModalTL] = useState(false);
  const [modalTutup, setModalTutup] = useState(false);
  const [alasan, setAlasan] = useState("");
  const tl = catatan.filter((c) => c.tabel === "tindak_lanjut" && c.data.peringatan_id === p.id);
  const staf = u && u.peran !== "ibu";

  return (
    <div className={cn("rounded-2xl bg-surface p-4 shadow-[var(--shadow-kartu)] ring-1", p.level === "merah" ? "ring-merah/30" : "ring-kuning/30")}>
      <div className="flex items-start gap-3">
        <TitikLevel level={p.level} className="mt-1.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold leading-snug">{p.judul}</p>
            <Lencana warna={p.level}>{p.level === "merah" ? "Merah" : "Kuning"}</Lencana>
            {p.untuk === "bayi" && <Lencana warna="brand">Bayi</Lencana>}
            {p.sensitif && (
              <Lencana>
                <Lock className="size-3" /> Hanya nakes
              </Lencana>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{p.detail}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {p.halamanCetak ? <TautanBuku halaman={p.halamanCetak} label={p.sumber} /> : <span>{p.sumber}</span>}
            {p.tabel && kamus.tabel[p.tabel] && <span>· {kamus.tabel[p.tabel].judul}</span>}
          </div>

          {!ringkas && tl.length > 0 && (
            <ol className="mt-3 space-y-1.5 border-l-2 border-line pl-3">
              {tl.map((t) => (
                <li key={t.id} className="text-xs">
                  <span className="font-semibold">{String(t.data.hasil)}</span> · {String(t.data.cara)} · {namaPengguna(t.meta.dibuat_oleh)} · {tampilWaktu(t.data.tanggal ?? t.meta.dibuat_pada)}
                  {t.data.catatan ? <span className="block text-muted">“{String(t.data.catatan)}”</span> : null}
                  {(t.data.hasil === "menolak" || t.data.hasil === "tidak bisa dihubungi") && <span className="block font-semibold text-merah">→ diteruskan ke bidan</span>}
                </li>
              ))}
            </ol>
          )}

          {staf && !ringkas && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Tombol kecil varian="kedua" onClick={() => setModalTL(true)}>
                Catat tindak lanjut
              </Tombol>
              {bolehTutupPeringatan(u) ? (
                <Tombol kecil varian="garis" onClick={() => setModalTutup(true)}>
                  <CheckCircle2 className="size-4" /> Tutup peringatan
                </Tombol>
              ) : (
                <span className="self-center text-xs text-muted">Ditutup oleh bidan/dokter</span>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal buka={modalTL} setBuka={setModalTL} judul="Catat tindak lanjut" deskripsi={p.judul}>
        <KamusForm
          tabel="tindak_lanjut"
          kolom={["cara", "hasil", "catatan"]}
          labelSimpan="Simpan tindak lanjut"
          onBatal={() => setModalTL(false)}
          onSimpan={(d) => {
            try {
              const teruskan = d.hasil === "menolak" || d.hasil === "tidak bisa dihubungi";
              simpan("tindak_lanjut", r.ibu.id, { ...d, peringatan_id: p.id, tanggal: new Date().toISOString(), ...(teruskan ? { diteruskan_ke: "u_bidan" } : {}) });
              toast.success(teruskan ? "Tersimpan dan diteruskan ke bidan" : "Tindak lanjut tersimpan");
              setModalTL(false);
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      </Modal>

      <Modal buka={modalTutup} setBuka={setModalTutup} judul="Tutup peringatan" deskripsi="Hanya bidan/nakes atau dokter yang dapat menutup. Catatan Anda tersimpan bersama nama dan waktu.">
        <div className="space-y-3">
          <Masukan autoFocus placeholder="mis. Sudah diperiksa, TD 130/85, kontrol 1 minggu" value={alasan} onChange={(e) => setAlasan(e.target.value)} />
          <Tombol
            className="w-full"
            disabled={alasan.trim().length < 3}
            onClick={() => {
              try {
                tutup(p.id, alasan.trim());
                toast.success("Peringatan ditutup");
                setModalTutup(false);
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          >
            Tutup peringatan
          </Tombol>
        </div>
      </Modal>
    </div>
  );
}
