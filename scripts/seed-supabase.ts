/**
 * Isi Supabase dengan data contoh kecil: 2 ibu (Siti, Dewi) dan 2 petugas (bidan, kader).
 * Jalankan setelah migrasi SQL: `npm run seed:supabase`. Aman dijalankan ulang (data contoh lama dihapus dulu).
 *
 * Butuh di .env.local: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY (atau SUPABASE_SERVICE_ROLE_KEY).
 * Kunci rahasia hanya dipakai di komputer ini, jangan pernah diberi awalan NEXT_PUBLIC_.
 * SEMUA NAMA, NIK, DAN NOMOR TELEPON DI SINI PALSU.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { DOMAIN_HP, buatSeed, VERSI_PERSETUJUAN } from "../src/lib/seed";
import type { Catatan, Ibu } from "../src/lib/types";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Boleh juga lewat variabel lingkungan biasa.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rahasia = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !rahasia) {
  console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY (atau SUPABASE_SERVICE_ROLE_KEY) di .env.local dulu.");
  process.exit(1);
}
const sb = createClient(url, rahasia, { auth: { persistSession: false, autoRefreshToken: false } });

const PIN_CONTOH = "246810";
const SANDI_CONTOH = "Momcare2026";

interface AkunContoh {
  kunci: string;
  email: string;
  sandi: string;
  meta: Record<string, unknown>;
  /** Untuk ibu: data yang harus sudah ada supaya akun langsung tertaut. */
  ibuId?: string;
  nik?: string;
}

const PETUGAS: AkunContoh[] = [
  { kunci: "u_bidan", email: "bidan@momcare.test", sandi: SANDI_CONTOH, meta: { peran: "bidan", nama: "Bidan Lestari Wulandari", posyandu: ["Melati", "Mawar"], telepon: "081200000101" } },
  { kunci: "u_kader", email: "kader@momcare.test", sandi: SANDI_CONTOH, meta: { peran: "kader", nama: "Rina Marlina", posyandu: ["Melati"], telepon: "081200000102" } },
];

const IBU: AkunContoh[] = [
  {
    kunci: "u_ibu_siti",
    email: `6281200000001@${DOMAIN_HP}`,
    sandi: PIN_CONTOH,
    ibuId: "i_siti",
    nik: "3273015403970001",
    meta: { peran: "ibu", nama: "Siti Aminah", tanggal_lahir: "1997-03-14", posyandu: "Melati", telepon: "081200000001" },
  },
  {
    kunci: "u_ibu_dewi",
    email: `6281200000003@${DOMAIN_HP}`,
    sandi: PIN_CONTOH,
    ibuId: "i_dewi",
    nik: "3273014208000003",
    meta: { peran: "ibu", nama: "Dewi Puspita", tanggal_lahir: "2000-08-02", posyandu: "Melati", telepon: "081200000003" },
  },
];

function cek<T>(r: { data: T | null; error: { message: string } | null }, apa: string): T | null {
  if (r.error) throw new Error(`${apa}: ${r.error.message}`);
  return r.data;
}

async function hapusAkunLama(klien: SupabaseClient, email: Set<string>) {
  for (let halaman = 1; ; halaman++) {
    const { data, error } = await klien.auth.admin.listUsers({ page: halaman, perPage: 200 });
    if (error) throw new Error(`Daftar akun: ${error.message}`);
    for (const u of data.users) {
      if (!u.email || !email.has(u.email)) continue;
      const { error: galat } = await klien.auth.admin.deleteUser(u.id);
      if (galat) throw new Error(`Hapus ${u.email}: ${galat.message}`);
    }
    if (data.users.length < 200) break;
  }
}

async function buatAkun(a: AkunContoh): Promise<string> {
  const { data, error } = await sb.auth.admin.createUser({
    email: a.email,
    password: a.sandi,
    email_confirm: true,
    // NIK mentah diganti hash oleh trigger database sebelum disimpan.
    user_metadata: { ...a.meta, ...(a.nik ? { nik: a.nik, versi_persetujuan: VERSI_PERSETUJUAN } : {}) },
  });
  if (error || !data.user) throw new Error(`Buat akun ${a.email}: ${error?.message}. Sudahkah migrasi SQL dijalankan?`);
  return data.user.id;
}

async function main() {
  const seed = buatSeed(new Date());
  const idIbu = IBU.map((a) => a.ibuId!);

  console.log("Menghapus data contoh lama…");
  // Ibu dulu (ikut menghapus catatan, status, dan log pengingatnya), baru akunnya.
  cek(await sb.from("ibu").delete().in("id", idIbu), "Hapus ibu lama");
  await hapusAkunLama(sb, new Set([...PETUGAS, ...IBU].map((a) => a.email)));

  console.log("Membuat akun petugas…");
  const peta: Record<string, string> = {};
  for (const a of PETUGAS) peta[a.kunci] = await buatAkun(a);
  // Data contoh memakai pemeriksaan dokter; belum ada akun dokter, jadi dicatat atas nama bidan.
  peta.u_dokter = peta.u_bidan;

  console.log("Menyimpan data ibu…");
  const nikHash = (nik: string) => createHash("sha256").update(nik).digest("hex");
  const barisIbu = seed.ibu
    .filter((i) => idIbu.includes(i.id))
    .map((i: Ibu) => {
      const a = IBU.find((x) => x.ibuId === i.id)!;
      return {
        id: i.id,
        profil: i.profil,
        keluarga: i.keluarga,
        nik_hash: nikHash(a.nik!),
        nik_samaran: `${"•".repeat(12)}${a.nik!.slice(-4)}`,
        persetujuan: { ...i.persetujuan, saksi: peta.u_kader },
      };
    });
  cek(await sb.from("ibu").insert(barisIbu), "Simpan ibu");

  console.log("Membuat akun ibu (tertaut lewat NIK + tanggal lahir)…");
  for (const a of IBU) peta[a.kunci] = await buatAkun(a);
  const tertaut = cek(await sb.from("pengguna").select("nama,ibu_id").in("id", IBU.map((a) => peta[a.kunci])), "Cek tautan");
  for (const t of (tertaut ?? []) as { nama: string; ibu_id: string }[]) console.log(`  ${t.nama} → ${t.ibu_id}`);

  console.log("Menyimpan catatan Buku KIA…");
  // Ganti id akun demo (u_bidan, …) dengan id akun Supabase di seluruh isi catatan.
  const gantiId = (c: Catatan): Catatan => JSON.parse(JSON.stringify(c).replace(/"(u_[a-z_]+)"/g, (m, k: string) => (peta[k] ? `"${peta[k]}"` : m)));
  const catatan = seed.catatan
    .filter((c) => idIbu.includes(c.ibuId))
    .map(gantiId)
    .map((c) => ({ id: c.id, tabel: c.tabel, ibu_id: c.ibuId, anak_id: c.anakId ?? null, data: c.data, meta: c.meta, dibuat_pada: c.meta.dibuat_pada }));
  cek(await sb.from("catatan").insert(catatan), "Simpan catatan");

  console.log(`\nSelesai: ${barisIbu.length} ibu, ${catatan.length} catatan, ${PETUGAS.length} petugas.\n`);
  console.log("Akun contoh:");
  console.log(`  Ibu    Siti Aminah   telepon 081200000001   PIN ${PIN_CONTOH}`);
  console.log(`  Ibu    Dewi Puspita  telepon 081200000003   PIN ${PIN_CONTOH}`);
  for (const a of PETUGAS) console.log(`  ${String(a.meta.peran).padEnd(6)} ${String(a.meta.nama).padEnd(24)} ${a.email.padEnd(20)} sandi ${a.sandi}`);
}

main().catch((e: Error) => {
  console.error(`\nGagal: ${e.message}`);
  process.exit(1);
});
