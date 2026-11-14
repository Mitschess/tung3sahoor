/**
 * Masuk dan daftar akun Rangkul lewat Supabase Auth (dipakai web dan aplikasi Android).
 * - Ibu: nomor telepon ATAU email + PIN 6 angka (seperti SATUSEHAT Mobile).
 * - Kader/bidan/dokter: email + kata sandi.
 * Nomor telepon diubah menjadi alamat email internal (628…@hp.momcare.app) karena masuk dengan
 * nomor HP di Supabase butuh layanan SMS berbayar. PIN dipakai sebagai kata sandi akun.
 */
import { DOMAIN_HP, VERSI_PERSETUJUAN, PUSKESMAS } from "./seed";
import { useStore } from "./store";
import { supabase } from "./supabase";
import type { Peran } from "./types";

/** Ringkasan Syarat & Ketentuan yang disetujui saat mendaftar (web dan aplikasi Android). */
export const SYARAT_IBU = [
  "Data Buku KIA Ibu disimpan di server Rangkul dan hanya dilihat kader di posyandu Ibu, bidan wilayah, dan dokter puskesmas.",
  "Hasil tes HIV/sifilis/hepatitis B dan skrining kesehatan jiwa hanya untuk bidan/dokter, tidak pernah dikirim ke keluarga.",
  "NIK disimpan tersandi (hash); yang tampil hanya 4 angka terakhir.",
  "Ibu bisa mengisi lembar pemantauan, tetapi tidak bisa mengubah hasil pemeriksaan petugas.",
  "Rangkul bukan layanan gawat darurat dan tidak menggantikan pemeriksaan tenaga kesehatan.",
  "Ibu boleh berhenti kapan saja tanpa memengaruhi pelayanan.",
];

export const SYARAT_NAKES = [
  "Akun hanya untuk kader, bidan, dan dokter yang bertugas di wilayah puskesmas ini.",
  "Data ibu bersifat rahasia: tidak boleh disalin, difoto ulang, atau dibagikan di luar keperluan pelayanan.",
  "Setiap isian dan perubahan dicatat bersama nama akun Anda dan waktunya.",
  "Kader tidak melihat hasil tes HIV/sifilis/hepatitis B dan skrining kesehatan jiwa.",
  "Jangan bagikan kata sandi. Keluar dari akun bila memakai perangkat bersama.",
];

export { DOMAIN_HP };
export const PANJANG_PIN = 6;
export const PANJANG_SANDI = 8;

export type CaraMasuk = "telepon" | "email";

/** 0812…, +62812…, 62812… → 62812… ; null bila bukan nomor HP Indonesia. */
export function rapikanTelepon(masukan: string): string | null {
  let s = masukan.replace(/\D/g, "");
  if (s.startsWith("0")) s = "62" + s.slice(1);
  else if (s.startsWith("8")) s = "62" + s;
  return /^628\d{7,11}$/.test(s) ? s : null;
}

export function emailValid(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

/** Alamat yang dipakai Supabase Auth untuk akun ibu. */
export function alamatAkunIbu(cara: CaraMasuk, nilai: string): string | null {
  if (cara === "email") return emailValid(nilai) ? nilai.trim().toLowerCase() : null;
  const hp = rapikanTelepon(nilai);
  return hp ? `${hp}@${DOMAIN_HP}` : null;
}

/** PIN 6 angka yang tidak mudah ditebak (bukan 111111, 123456, 654321, …). */
export function cekPin(pin: string): string | null {
  if (!new RegExp(`^\\d{${PANJANG_PIN}}$`).test(pin)) return `PIN harus ${PANJANG_PIN} angka.`;
  if (/^(\d)\1+$/.test(pin)) return "PIN tidak boleh angka yang sama semua.";
  const naik = "01234567890123456789";
  const turun = "98765432109876543210";
  if (naik.includes(pin) || turun.includes(pin)) return "PIN tidak boleh angka berurutan.";
  return null;
}

export function cekSandi(sandi: string): string | null {
  if (sandi.length < PANJANG_SANDI) return `Kata sandi minimal ${PANJANG_SANDI} karakter.`;
  if (!/[A-Za-z]/.test(sandi) || !/\d/.test(sandi)) return "Kata sandi harus berisi huruf dan angka.";
  return null;
}

/** Pesan galat Supabase dalam bahasa yang dimengerti ibu dan petugas. */
export function pesanGalat(e: unknown, untukIbu = false): string {
  const m = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  if (/invalid login credentials/i.test(m)) return untukIbu ? "Nomor/email atau PIN salah." : "Email atau kata sandi salah.";
  if (/already registered|already been registered|already exists/i.test(m)) return untukIbu ? "Nomor/email ini sudah punya akun. Silakan masuk." : "Email ini sudah punya akun. Silakan masuk.";
  if (/NIK sudah terdaftar|database error saving new user/i.test(m))
    return "Pendaftaran ditolak: NIK ini sudah dipakai akun lain, atau tanggal lahir tidak sama dengan data yang didaftarkan kader. Hubungi kader/bidan.";
  if (/email not confirmed/i.test(m)) return "Akun belum dikonfirmasi. Admin perlu mematikan \"Confirm email\" di Supabase (Authentication → Sign In / Providers → Email).";
  if (/rate limit|too many/i.test(m)) return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (/failed to fetch|network/i.test(m)) return "Tidak tersambung ke internet. Periksa koneksi lalu coba lagi.";
  return m.replace(/^MOMCARE:\s*/, "");
}

function klien() {
  if (!supabase) throw new Error("Supabase belum diatur. Isi URL dan kunci Supabase di berkas .env.");
  return supabase;
}

async function setelahMasuk() {
  await useStore.getState().muatAwan();
}

/** Masuk dengan alamat akun (lihat alamatAkunIbu untuk ibu) dan PIN/kata sandi. */
export async function masukAkun(alamat: string, rahasia: string, untukIbu = false) {
  const sb = klien();
  const { error } = await sb.auth.signInWithPassword({ email: alamat, password: rahasia });
  if (error) throw new Error(pesanGalat(error, untukIbu));
  try {
    await setelahMasuk();
  } catch (e) {
    await sb.auth.signOut();
    throw new Error(pesanGalat(e, untukIbu));
  }
  const u = useStore.getState().pengguna.find((p) => p.id === useStore.getState().penggunaId);
  if (untukIbu && u && u.peran !== "ibu") {
    await useStore.getState().keluar();
    throw new Error("Akun ini akun petugas. Masuk lewat tab Kader / Nakes.");
  }
  if (!untukIbu && u?.peran === "ibu") {
    await useStore.getState().keluar();
    throw new Error("Akun ini akun ibu. Masuk lewat tab Ibu dengan PIN.");
  }
}

export interface DataDaftarIbu {
  cara: CaraMasuk;
  nilai: string;
  nama: string;
  nik: string;
  tanggalLahir: string;
  posyandu: string;
  pin: string;
}

export function cekDataIbu(d: Omit<DataDaftarIbu, "pin">): string | null {
  if (!alamatAkunIbu(d.cara, d.nilai)) return d.cara === "telepon" ? "Nomor telepon belum benar (contoh 0812xxxxxxxx)." : "Alamat email belum benar.";
  if (d.nama.trim().length < 3) return "Isi nama lengkap sesuai KTP.";
  if (d.nik.replace(/\D/g, "").length !== 16) return "NIK harus 16 angka.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggalLahir)) return "Isi tanggal lahir.";
  if (!d.posyandu) return "Pilih posyandu tempat Ibu biasa periksa.";
  return null;
}

/**
 * Ibu mendaftar sendiri. Database (trigger) menyandikan NIK, lalu menautkan akun ke data yang sudah
 * didaftarkan kader bila NIK + tanggal lahirnya sama; bila belum ada, data ibu baru dibuat.
 */
export async function daftarIbuMandiri(d: DataDaftarIbu) {
  const sb = klien();
  const salah = cekDataIbu(d) ?? cekPin(d.pin);
  if (salah) throw new Error(salah);
  const alamat = alamatAkunIbu(d.cara, d.nilai)!;
  const telepon = d.cara === "telepon" ? `0${rapikanTelepon(d.nilai)!.slice(2)}` : undefined;
  const { data, error } = await sb.auth.signUp({
    email: alamat,
    password: d.pin,
    options: {
      data: {
        peran: "ibu",
        nama: d.nama.trim(),
        nik: d.nik.replace(/\D/g, ""),
        tanggal_lahir: d.tanggalLahir,
        posyandu: d.posyandu,
        puskesmas: PUSKESMAS,
        versi_persetujuan: VERSI_PERSETUJUAN,
        ...(telepon ? { telepon } : {}),
      },
    },
  });
  if (error) throw new Error(pesanGalat(error, true));
  if (!data.session) throw new Error(pesanGalat(new Error("Email not confirmed")));
  await setelahMasuk();
}

export type PeranNakes = Exclude<Peran, "ibu">;

export interface DataDaftarNakes {
  nama: string;
  email: string;
  telepon: string;
  peran: PeranNakes;
  posyandu: string[];
  sandi: string;
}

export function cekDataNakes(d: Omit<DataDaftarNakes, "sandi">): string | null {
  if (d.nama.trim().length < 3) return "Isi nama lengkap.";
  if (!emailValid(d.email)) return "Alamat email belum benar.";
  if (d.telepon && !rapikanTelepon(d.telepon)) return "Nomor telepon belum benar (contoh 0812xxxxxxxx).";
  if (d.peran !== "dokter" && d.posyandu.length === 0) return d.peran === "kader" ? "Pilih posyandu Anda." : "Pilih minimal satu posyandu wilayah kerja.";
  if (d.peran === "kader" && d.posyandu.length > 1) return "Kader hanya untuk satu posyandu.";
  return null;
}

export async function daftarNakes(d: DataDaftarNakes) {
  const sb = klien();
  const salah = cekDataNakes(d) ?? cekSandi(d.sandi);
  if (salah) throw new Error(salah);
  const { data, error } = await sb.auth.signUp({
    email: d.email.trim().toLowerCase(),
    password: d.sandi,
    options: {
      data: {
        peran: d.peran,
        nama: d.nama.trim(),
        posyandu: d.peran === "dokter" ? [] : d.posyandu,
        ...(d.telepon ? { telepon: d.telepon.trim() } : {}),
      },
    },
  });
  if (error) throw new Error(pesanGalat(error));
  if (!data.session) throw new Error(pesanGalat(new Error("Email not confirmed")));
  await setelahMasuk();
}
