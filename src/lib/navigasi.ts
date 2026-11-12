"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * Jejak halaman yang dibuka di dalam aplikasi pada tab ini.
 * Dipakai tombol kembali: bila ada halaman sebelumnya di aplikasi, kembali ke sana (seperti tombol kembali HP);
 * bila halaman dibuka langsung dari tautan, pindah ke halaman induknya tanpa menambah riwayat.
 */
const jejak: string[] = [];
/** True bila perpindahan berikutnya mengganti halaman sekarang (router.replace), bukan menambah riwayat. */
let ganti = false;

/** Panggil sebelum pindah halaman dengan replace, supaya jejak tetap sama dengan riwayat browser. */
export function tandaiGanti() {
  ganti = true;
}

/** Dipasang sekali di layout untuk mencatat setiap perpindahan halaman. */
export function useCatatJejak() {
  const path = usePathname();
  useEffect(() => {
    const n = jejak.length;
    if (jejak[n - 1] === path) return;
    if (ganti && n) {
      ganti = false;
      jejak[n - 1] = path;
      return;
    }
    // Kembali ke halaman sebelumnya (tombol kembali HP atau router.back) mengeluarkan halaman terakhir dari jejak.
    if (jejak[n - 2] === path) jejak.pop();
    else jejak.push(path);
  }, [path]);
}

/** Halaman induk dari path, mis. /ibu/pantau → /ibu. */
function induk(path: string) {
  const i = path.lastIndexOf("/");
  return i > 0 ? path.slice(0, i) : "/";
}

/** Fungsi kembali ke halaman sebelumnya; `cadangan` dipakai bila tidak ada halaman sebelumnya di aplikasi. */
export function useKembali(cadangan?: string) {
  const router = useRouter();
  const path = usePathname();
  return useCallback(() => {
    if (jejak.length > 1) router.back();
    else {
      tandaiGanti();
      router.replace(cadangan ?? induk(path));
    }
  }, [router, path, cadangan]);
}
