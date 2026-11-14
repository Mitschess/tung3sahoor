"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { bolehIsi, bolehOcr, bolehTutupPeringatan } from "./akses";
import { dengarkan, kirim, muatSemua, type Perubahan } from "./awan";
import { kamus, validasiNilai } from "./kamus";
import { penyimpanan } from "./penyimpanan";
import { PENGGUNA_DEMO, VERSI_PERSETUJUAN, buatSeed } from "./seed";
import { supabase } from "./supabase";
import type { Catatan, Data, DrafOcr, Ibu, LogPengingat, Meta, Pengguna, StatusPeringatan } from "./types";
import { hashNik, samarkanNik, uid } from "./util";

const VERSI_DATA = 3;

/**
 * true bila Supabase diatur: data ibu, catatan, dan status peringatan disimpan bersama di Supabase
 * (web petugas dan aplikasi ibu saling melihat). false: mode demo, data contoh hanya di perangkat ini.
 */
export const MODE_AWAN = !!supabase;

/** Galat saat mengirim ke Supabase di latar belakang. Web memakai toast, Android memakai kabar(). */
let pelaporGalat: (pesan: string) => void = (p) => console.warn(p);
export function aturPelaporGalat(fn: (pesan: string) => void) {
  pelaporGalat = fn;
}

let berhentiDengar: (() => void) | null = null;

function terapkan<T extends { id: string }>(daftar: T[], simpan?: T, hapus?: string): T[] {
  if (hapus) return daftar.filter((x) => x.id !== hapus);
  if (!simpan) return daftar;
  const i = daftar.findIndex((x) => x.id === simpan.id);
  if (i < 0) return [...daftar, simpan];
  const baru = daftar.slice();
  baru[i] = simpan;
  return baru;
}

interface OpsiSimpan {
  sumber?: Meta["sumber"];
  ocr_yakin?: Record<string, number>;
  foto_id?: string;
  /** Jika diisi, catatan lama diperbarui dan perubahan dicatat di riwayat. */
  catatanId?: string;
  anakId?: string;
}

interface State {
  versi: number;
  sudahSiap: boolean;
  penggunaId: string | null;
  pengguna: Pengguna[];
  ibu: Ibu[];
  catatan: Catatan[];
  draf: DrafOcr[];
  status: Record<string, StatusPeringatan>;
  pengingat: LogPengingat[];
  /** Ibu sudah menyetujui ringkasan syarat & privasi di perangkat ini. */
  setujuPrivasi: boolean;
  /** Lembar terjauh yang sudah dibaca per materi edukasi (indeks 0 = sampul), per perangkat. */
  bacaan: Record<string, number>;

  masuk: (id: string) => void;
  keluar: () => Promise<void>;
  simpan: (tabel: string, ibuId: string, data: Data, opsi?: OpsiSimpan) => Catatan;
  daftarIbu: (profil: Data, keluarga: Data, nik: string, riwayat?: Data) => Promise<Ibu>;
  ubahProfil: (ibuId: string, profil: Data, keluarga: Data) => void;
  tambahDraf: (d: Omit<DrafOcr, "id" | "dibuat_oleh" | "dibuat_pada">) => DrafOcr;
  hapusDraf: (id: string) => void;
  konfirmasiDraf: (id: string, data: Data) => Catatan;
  tutupPeringatan: (id: string, catatan: string, ibuId: string) => void;
  bukaLagiPeringatan: (id: string) => void;
  catatPengingat: (l: Omit<LogPengingat, "id" | "oleh" | "pada">) => void;
  resetDemo: () => void;
  setujuiPrivasi: () => void;
  catatBacaan: (slug: string, lembar: number) => void;
  /** Mode awan: muat ulang semua data akun yang sedang masuk dari Supabase. */
  muatAwan: () => Promise<void>;
}

function saya(s: State): Pengguna {
  const u = s.pengguna.find((p) => p.id === s.penggunaId);
  if (!u) throw new Error("Silakan masuk terlebih dahulu.");
  return u;
}

/** Validasi teknis seluruh kolom terhadap kamus data. Melempar error berisi daftar kolom yang perlu dicek. */
function validasi(tabel: string, data: Data) {
  const def = kamus.tabel[tabel];
  if (!def) throw new Error(`Tabel tidak dikenal: ${tabel}`);
  const salah: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    const kol = def.kolom[k];
    if (!kol) continue;
    const h = validasiNilai(kol, v);
    if (!h.ok) salah.push(`${kol.label}: ${h.pesan}`);
  }
  if (salah.length) throw new Error(salah.join("\n"));
}

function bersihkan(data: Data): Data {
  const out: Data = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === "" || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** Kirim perubahan ke Supabase di latar belakang. Bila ditolak, laporkan dan samakan lagi dengan server. */
      const kirimLatar = (kerja: (sb: NonNullable<typeof supabase>) => Promise<void>) => {
        if (!supabase) return;
        kerja(supabase).catch((e: Error) => {
          pelaporGalat(`Gagal menyimpan ke server: ${e.message}`);
          void get().muatAwan().catch(() => undefined);
        });
      };
      /** Perubahan dari perangkat lain (realtime). */
      const terima = (p: Perubahan) => {
        const s = get();
        set({
          ...(p.ibu ? { ibu: terapkan(s.ibu, p.ibu.simpan, p.ibu.hapus) } : {}),
          ...(p.catatan ? { catatan: terapkan(s.catatan, p.catatan.simpan, p.catatan.hapus) } : {}),
          ...(p.pengguna ? { pengguna: terapkan(s.pengguna, p.pengguna) } : {}),
          ...(p.status?.simpan ? { status: { ...s.status, [p.status.simpan[0]]: p.status.simpan[1] } } : {}),
          ...(p.status?.hapus ? { status: Object.fromEntries(Object.entries(s.status).filter(([k]) => k !== p.status?.hapus)) } : {}),
        });
      };
      return {
      versi: VERSI_DATA,
      sudahSiap: false,
      penggunaId: null,
      pengguna: MODE_AWAN ? [] : PENGGUNA_DEMO,
      ibu: [],
      catatan: [],
      draf: [],
      status: {},
      pengingat: [],
      setujuPrivasi: false,
      bacaan: {},

      masuk: (id) => {
        if (MODE_AWAN) throw new Error("Akun demo tidak tersedia saat tersambung ke Supabase.");
        set({ penggunaId: id });
      },
      keluar: async () => {
        if (supabase) {
          berhentiDengar?.();
          berhentiDengar = null;
          // Data akun sebelumnya (termasuk foto draf) tidak ditinggal di perangkat.
          set({ penggunaId: null, pengguna: [], ibu: [], catatan: [], status: {}, pengingat: [], draf: [] });
          await supabase.auth.signOut();
          return;
        }
        set({ penggunaId: null });
      },

      muatAwan: async () => {
        if (!supabase) return;
        const d = await muatSemua(supabase);
        if (!d) {
          set({ penggunaId: null, pengguna: [], ibu: [], catatan: [], status: {}, pengingat: [] });
          return;
        }
        set(d);
        if (!berhentiDengar) berhentiDengar = dengarkan(supabase, terima);
      },

      simpan: (tabel, ibuId, dataMentah, opsi = {}) => {
        const s = get();
        const u = saya(s);
        if (!bolehIsi(u, tabel)) throw new Error(`Peran ${u.peran} tidak boleh mengisi "${kamus.tabel[tabel]?.judul ?? tabel}".`);
        if (opsi.sumber === "foto (OCR)" && !bolehOcr(u)) throw new Error("Hasil foto harus dikonfirmasi kader/nakes.");
        const data = bersihkan(dataMentah);
        validasi(tabel, data);
        const waktu = new Date().toISOString();

        if (opsi.catatanId) {
          const lama = s.catatan.find((c) => c.id === opsi.catatanId);
          if (!lama) throw new Error("Catatan tidak ditemukan.");
          const berubah = Object.keys({ ...lama.data, ...data }).filter((k) => JSON.stringify(lama.data[k]) !== JSON.stringify(data[k]));
          const baru: Catatan = {
            ...lama,
            data,
            meta: {
              ...lama.meta,
              diubah_terakhir: [...(lama.meta.diubah_terakhir ?? []), { oleh: u.id, pada: waktu, catatan: berubah.length ? `Ubah: ${berubah.join(", ")}` : "Disimpan ulang" }],
            },
          };
          set({ catatan: s.catatan.map((c) => (c.id === lama.id ? baru : c)) });
          kirimLatar((sb) => kirim.catatan(sb, baru));
          return baru;
        }

        const c: Catatan = {
          id: uid("c"),
          tabel,
          ibuId,
          anakId: opsi.anakId,
          data,
          meta: {
            dibuat_oleh: u.id,
            dibuat_pada: waktu,
            sumber: opsi.sumber ?? "Ketik manual",
            ...(opsi.sumber === "foto (OCR)"
              ? { foto_id: opsi.foto_id, ocr_yakin: opsi.ocr_yakin, dikonfirmasi_oleh: u.id, dikonfirmasi_pada: waktu }
              : {}),
          },
        };
        set({ catatan: [...s.catatan, c] });
        kirimLatar((sb) => kirim.catatan(sb, c));
        return c;
      },

      daftarIbu: async (profil, keluarga, nik, riwayat) => {
        const s = get();
        const u = saya(s);
        if (!bolehIsi(u, "ibu")) throw new Error("Hanya kader/bidan yang bisa mendaftarkan ibu.");
        if (!profil.persetujuan_tanggal) throw new Error("Tanpa persetujuan ibu, data tidak boleh disimpan.");
        validasi("ibu", profil);
        validasi("keluarga", keluarga);
        const id = uid("i");
        const nikBersih = nik.replace(/\D/g, "");
        const ibu: Ibu = {
          id,
          profil: bersihkan({ ...profil, ibu_id: id }),
          keluarga: bersihkan(keluarga),
          nikHash: nikBersih ? await hashNik(nikBersih) : "",
          nikSamaran: nikBersih ? samarkanNik(nikBersih) : "–",
          persetujuan: { tanggal: String(profil.persetujuan_tanggal), versi: VERSI_PERSETUJUAN, saksi: u.id },
        };
        set({ ibu: [...get().ibu, ibu] });
        let catatanRiwayat: Catatan | undefined;
        if (riwayat && Object.values(riwayat).some((v) => v !== "" && v !== undefined)) {
          // Data kehamilan awal disalin dari Buku KIA saat pendaftaran (4a). Kader boleh mengisi ini
          // hanya sebagai salinan; nakes dapat memperbaruinya kemudian.
          const data = bersihkan({ ...riwayat, kehamilan_id: uid("k") });
          validasi("riwayat", data);
          const c: Catatan = { id: uid("c"), tabel: "riwayat", ibuId: id, data, meta: { dibuat_oleh: u.id, dibuat_pada: new Date().toISOString(), sumber: "Ketik manual" } };
          set({ catatan: [...get().catatan, c] });
          catatanRiwayat = c;
        }
        if (supabase) {
          // Ditunggu (bukan di latar) supaya NIK ganda atau wilayah yang tidak diizinkan langsung terlihat di formulir.
          try {
            await kirim.ibuBaru(supabase, ibu);
            if (catatanRiwayat) await kirim.catatan(supabase, catatanRiwayat);
          } catch (e) {
            set({ ibu: get().ibu.filter((i) => i.id !== id), catatan: get().catatan.filter((c) => c.ibuId !== id) });
            const m = (e as Error).message;
            throw new Error(/ibu_nik_unik|duplicate key/i.test(m) ? "NIK ini sudah terdaftar di Rangkul." : `Gagal menyimpan ke server: ${m}`);
          }
        }
        return ibu;
      },

      ubahProfil: (ibuId, profil, keluarga) => {
        const s = get();
        const u = saya(s);
        if (!bolehIsi(u, "ibu")) throw new Error("Peran ini tidak boleh mengubah identitas.");
        validasi("ibu", profil);
        validasi("keluarga", keluarga);
        const ibu = s.ibu.map((i) => (i.id === ibuId ? { ...i, profil: bersihkan({ ...i.profil, ...profil }), keluarga: bersihkan({ ...i.keluarga, ...keluarga }) } : i));
        set({ ibu });
        const baru = ibu.find((i) => i.id === ibuId);
        if (baru) kirimLatar((sb) => kirim.ubahIbu(sb, baru));
      },

      tambahDraf: (d) => {
        const s = get();
        const u = saya(s);
        if (!bolehOcr(u)) throw new Error("Peran ini tidak bisa memotret Buku KIA.");
        const draf: DrafOcr = { ...d, id: uid("draf"), dibuat_oleh: u.id, dibuat_pada: new Date().toISOString() };
        set({ draf: [draf, ...s.draf] });
        return draf;
      },

      hapusDraf: (id) => set({ draf: get().draf.filter((d) => d.id !== id) }),

      konfirmasiDraf: (id, data) => {
        const s = get();
        const d = s.draf.find((x) => x.id === id);
        if (!d) throw new Error("Draf tidak ditemukan.");
        const c = get().simpan(d.tabel, d.ibuId, data, { sumber: "foto (OCR)", ocr_yakin: d.yakin, foto_id: d.id });
        // Foto hanya disimpan selama belum dikonfirmasi (hemat ruang & privasi, bagian 6).
        set({ draf: get().draf.filter((x) => x.id !== id) });
        return c;
      },

      tutupPeringatan: (id, catatan, ibuId) => {
        const s = get();
        const u = saya(s);
        if (!bolehTutupPeringatan(u)) throw new Error("Peringatan hanya bisa ditutup oleh bidan/nakes atau dokter.");
        const st: StatusPeringatan = { status: "ditutup", oleh: u.id, pada: new Date().toISOString(), catatan };
        set({ status: { ...s.status, [id]: st } });
        kirimLatar((sb) => kirim.tutup(sb, id, ibuId, st));
      },

      bukaLagiPeringatan: (id) => {
        const s = get();
        const u = saya(s);
        if (!bolehTutupPeringatan(u)) throw new Error("Tidak diizinkan.");
        const { [id]: _, ...sisa } = s.status;
        void _;
        set({ status: sisa });
        kirimLatar((sb) => kirim.bukaLagi(sb, id));
      },

      catatPengingat: (l) => {
        const s = get();
        const u = saya(s);
        const log: LogPengingat = { ...l, id: uid("wa"), oleh: u.id, pada: new Date().toISOString() };
        set({ pengingat: [log, ...s.pengingat].slice(0, 200) });
        kirimLatar((sb) => kirim.pengingat(sb, log));
      },

      setujuiPrivasi: () => set({ setujuPrivasi: true }),
      catatBacaan: (slug, lembar) => {
        const lama = get().bacaan[slug] ?? -1;
        if (lembar > lama) set({ bacaan: { ...get().bacaan, [slug]: lembar } });
      },

      resetDemo: () => {
        if (MODE_AWAN) return;
        const seed = buatSeed(new Date());
        set({ versi: VERSI_DATA, ibu: seed.ibu, catatan: seed.catatan, status: seed.status, draf: [], pengingat: [], pengguna: PENGGUNA_DEMO });
      },
      };
    },
    {
      // Mode awan memakai kunci lain supaya sisa data demo di perangkat tidak tercampur.
      name: MODE_AWAN ? "momcare" : "momcare-demo",
      version: VERSI_DATA,
      storage: createJSONStorage(penyimpanan),
      partialize: (s) =>
        MODE_AWAN
          ? // Data kesehatan diambil dari server setiap kali; yang disimpan di perangkat hanya preferensi & draf foto.
            { versi: s.versi, draf: s.draf, setujuPrivasi: s.setujuPrivasi, bacaan: s.bacaan }
          : {
        versi: s.versi,
        penggunaId: s.penggunaId,
        ibu: s.ibu,
        catatan: s.catatan,
        draf: s.draf,
        status: s.status,
        pengingat: s.pengingat,
        setujuPrivasi: s.setujuPrivasi,
        bacaan: s.bacaan,
      },
      migrate: () => ({}) as unknown as State,
      onRehydrateStorage: () => () => {
        // Hidrasi localStorage berjalan sinkron di dalam create(), saat `useStore` belum terdefinisi
        // (di aplikasi Android, AsyncStorage berjalan asinkron): lanjutkan pada tick berikutnya. Data rusak/versi lama → isi ulang data demo.
        setTimeout(() => {
          const s = useStore.getState();
          if (supabase) {
            s.muatAwan()
              .catch((e: Error) => pelaporGalat(`Gagal memuat data: ${e.message}`))
              .finally(() => useStore.setState({ sudahSiap: true }));
            return;
          }
          if (!s.ibu.length || s.versi !== VERSI_DATA) s.resetDemo();
          useStore.setState({ sudahSiap: true, pengguna: PENGGUNA_DEMO });
        }, 0);
      },
    },
  ),
);

export function usePengguna(): Pengguna | null {
  return useStore((s) => s.pengguna.find((p) => p.id === s.penggunaId) ?? null);
}
