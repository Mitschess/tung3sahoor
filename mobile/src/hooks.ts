import { useRingkasan, type Ringkasan } from "@/lib/hooks";
import { usePengguna } from "@/lib/store";

/** Ringkasan Buku KIA milik Ibu yang sedang masuk (tahap, jadwal, peringatan). */
export function useRingkasanSaya(): Ringkasan | null {
  const u = usePengguna();
  return useRingkasan(u?.ibuId);
}
