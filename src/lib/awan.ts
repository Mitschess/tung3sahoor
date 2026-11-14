/**
 * Penyambung data Rangkul ke Supabase: baca semua data yang boleh dilihat akun ini, kirim perubahan,
 * dan dengarkan perubahan dari perangkat lain (realtime). Hak akses dijaga RLS di database
 * (supabase/migrations), sama dengan aturan di akses.ts.
 */
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Catatan, Ibu, LogPengingat, Pengguna, Peran, StatusPeringatan } from "./types";

interface BarisIbu {
  id: string;
  profil: Ibu["profil"];
  keluarga: Ibu["keluarga"];
  nik_hash: string;
  nik_samaran: string;
  persetujuan: Ibu["persetujuan"];
}

interface BarisCatatan {
  id: string;
  tabel: string;
  ibu_id: string;
  anak_id: string | null;
  data: Catatan["data"];
  meta: Catatan["meta"];
}

interface BarisPengguna {
  id: string;
  nama: string;
  peran: Peran;
  posyandu: string[] | null;
  ibu_id: string | null;
  telepon: string | null;
  keterangan: string | null;
}

interface BarisStatus {
  id: string;
  ibu_id: string;
  oleh: string;
  pada: string;
  catatan: string;
}

interface BarisPengingat {
  id: string;
  ibu_id: string;
  ke: LogPengingat["ke"];
  telepon: string;
  pesan: string;
  oleh: string;
  pada: string;
}

export const keIbu = (b: BarisIbu): Ibu => ({ id: b.id, profil: b.profil, keluarga: b.keluarga, nikHash: b.nik_hash, nikSamaran: b.nik_samaran, persetujuan: b.persetujuan });
const dariIbu = (i: Ibu): BarisIbu => ({ id: i.id, profil: i.profil, keluarga: i.keluarga, nik_hash: i.nikHash, nik_samaran: i.nikSamaran, persetujuan: i.persetujuan });

export const keCatatan = (b: BarisCatatan): Catatan => ({ id: b.id, tabel: b.tabel, ibuId: b.ibu_id, ...(b.anak_id ? { anakId: b.anak_id } : {}), data: b.data, meta: b.meta });
const dariCatatan = (c: Catatan): BarisCatatan & { dibuat_pada: string } => ({
  id: c.id,
  tabel: c.tabel,
  ibu_id: c.ibuId,
  anak_id: c.anakId ?? null,
  data: c.data,
  meta: c.meta,
  dibuat_pada: c.meta.dibuat_pada,
});

export function kePengguna(b: BarisPengguna): Pengguna {
  const ket =
    b.keterangan ??
    (b.peran === "kader" ? `Kader Posyandu ${b.posyandu?.join(" & ")}` : b.peran === "bidan" ? `Bidan, wilayah ${b.posyandu?.join(" & ")}` : b.peran === "dokter" ? "Dokter puskesmas" : undefined);
  return {
    id: b.id,
    nama: b.nama,
    peran: b.peran,
    ...(b.posyandu ? { posyandu: b.posyandu } : {}),
    ...(b.ibu_id ? { ibuId: b.ibu_id } : {}),
    ...(b.telepon ? { telepon: b.telepon } : {}),
    ...(ket ? { keterangan: ket } : {}),
  };
}

export const keStatus = (b: BarisStatus): StatusPeringatan => ({ status: "ditutup", oleh: b.oleh, pada: b.pada, catatan: b.catatan });
const kePengingat = (b: BarisPengingat): LogPengingat => ({ id: b.id, ibuId: b.ibu_id, ke: b.ke, telepon: b.telepon, pesan: b.pesan, oleh: b.oleh, pada: b.pada });

function cek<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export interface DataAwan {
  penggunaId: string;
  pengguna: Pengguna[];
  ibu: Ibu[];
  catatan: Catatan[];
  status: Record<string, StatusPeringatan>;
  pengingat: LogPengingat[];
}

/** Ambil semua data yang boleh dilihat akun yang sedang masuk (RLS menyaring di server). */
export async function muatSemua(sb: SupabaseClient): Promise<DataAwan | null> {
  const { data: sesi } = await sb.auth.getSession();
  const uid = sesi.session?.user.id;
  if (!uid) return null;
  const [pengguna, ibu, catatan, status, pengingat] = await Promise.all([
    sb.from("pengguna").select("id,nama,peran,posyandu,ibu_id,telepon,keterangan"),
    sb.from("ibu").select("id,profil,keluarga,nik_hash,nik_samaran,persetujuan").order("dibuat_pada"),
    sb.from("catatan").select("id,tabel,ibu_id,anak_id,data,meta").order("dibuat_pada").limit(10000),
    sb.from("status_peringatan").select("id,ibu_id,oleh,pada,catatan"),
    sb.from("pengingat").select("id,ibu_id,ke,telepon,pesan,oleh,pada").order("pada", { ascending: false }).limit(200),
  ]);
  const daftarPengguna = cek(pengguna) as BarisPengguna[];
  if (!daftarPengguna.some((p) => p.id === uid)) throw new Error("Profil akun belum ada. Hubungi admin Rangkul.");
  return {
    penggunaId: uid,
    pengguna: daftarPengguna.map(kePengguna),
    ibu: (cek(ibu) as BarisIbu[]).map(keIbu),
    catatan: (cek(catatan) as BarisCatatan[]).map(keCatatan),
    status: Object.fromEntries((cek(status) as BarisStatus[]).map((s) => [s.id, keStatus(s)])),
    pengingat: (cek(pengingat) as BarisPengingat[]).map(kePengingat),
  };
}

export const kirim = {
  catatan: async (sb: SupabaseClient, c: Catatan) => void cek(await sb.from("catatan").upsert(dariCatatan(c))),
  ibuBaru: async (sb: SupabaseClient, i: Ibu) => void cek(await sb.from("ibu").insert({ ...dariIbu(i) })),
  ubahIbu: async (sb: SupabaseClient, i: Ibu) => void cek(await sb.from("ibu").update({ profil: i.profil, keluarga: i.keluarga }).eq("id", i.id)),
  tutup: async (sb: SupabaseClient, id: string, ibuId: string, s: StatusPeringatan) =>
    void cek(await sb.from("status_peringatan").insert({ id, ibu_id: ibuId, oleh: s.oleh, pada: s.pada, catatan: s.catatan })),
  bukaLagi: async (sb: SupabaseClient, id: string) => void cek(await sb.from("status_peringatan").delete().eq("id", id)),
  pengingat: async (sb: SupabaseClient, l: LogPengingat) =>
    void cek(await sb.from("pengingat").insert({ id: l.id, ibu_id: l.ibuId, ke: l.ke, telepon: l.telepon, pesan: l.pesan, oleh: l.oleh, pada: l.pada })),
};

export interface Perubahan {
  ibu?: { simpan?: Ibu; hapus?: string };
  catatan?: { simpan?: Catatan; hapus?: string };
  status?: { simpan?: [string, StatusPeringatan]; hapus?: string };
  pengguna?: Pengguna;
}

/** Dengarkan perubahan dari perangkat lain. Kembalikan fungsi untuk berhenti mendengarkan. */
export function dengarkan(sb: SupabaseClient, terima: (p: Perubahan) => void): () => void {
  const kanal: RealtimeChannel = sb
    .channel("momcare")
    .on("postgres_changes", { event: "*", schema: "public", table: "catatan" }, (e) => {
      if (e.eventType === "DELETE") terima({ catatan: { hapus: (e.old as { id: string }).id } });
      else terima({ catatan: { simpan: keCatatan(e.new as BarisCatatan) } });
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "ibu" }, (e) => {
      if (e.eventType === "DELETE") terima({ ibu: { hapus: (e.old as { id: string }).id } });
      else terima({ ibu: { simpan: keIbu(e.new as BarisIbu) } });
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "status_peringatan" }, (e) => {
      if (e.eventType === "DELETE") terima({ status: { hapus: (e.old as { id: string }).id } });
      else {
        const b = e.new as BarisStatus;
        terima({ status: { simpan: [b.id, keStatus(b)] } });
      }
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "pengguna" }, (e) => terima({ pengguna: kePengguna(e.new as BarisPengguna) }))
    .subscribe();
  return () => void sb.removeChannel(kanal);
}
