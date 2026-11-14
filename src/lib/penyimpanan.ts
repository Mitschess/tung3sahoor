import type { StateStorage } from "zustand/middleware";

/** Web: data demo disimpan di localStorage browser. Aplikasi Android memakai penyimpanan.native.ts. */
export function penyimpanan(): StateStorage {
  return localStorage;
}
