/**
 * Teks pengingat WhatsApp (demo memakai tautan wa.me, bukan WhatsApp Business resmi).
 * Pesan TIDAK PERNAH memuat data sensitif (tripel eliminasi, kesehatan jiwa) atau nilai pemeriksaan.
 */
import type { Ringkasan } from "./hooks";
import { namaDepan } from "./util";

export function pesanKunjungan(r: Ringkasan, ke: "ibu" | "pendamping"): string {
  const nama = namaDepan(r.ibu.profil.nama);
  const k = r.berikut;
  const kembali = [...r.cari("anc")].reverse().find((a) => a.data.tanggal_kembali)?.data.tanggal_kembali as string | undefined;
  const kapan = kembali
    ? new Date(kembali).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })
    : k
      ? `antara ${k.mulai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}–${k.selesai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
      : "secepatnya";
  // Hanya huruf pertama yang dikecilkan, supaya singkatan seperti "T3" dan "USG" tetap utuh.
  const apa = k ? k.nama.charAt(0).toLowerCase() + k.nama.slice(1) : "pemeriksaan";
  const sapa = ke === "ibu" ? `Halo Bu ${nama}` : `Halo Bapak/Ibu, keluarga Bu ${nama}`;
  return `${sapa}, ini pengingat dari kader posyandu (Rangkul). Jadwal ${apa} ${kapan}. Jangan lupa bawa Buku KIA ya. ${ke === "pendamping" ? "Mohon bantu dampingi Ibu. " : ""}Terima kasih 🙏`;
}

export function pesanMerah(r: Ringkasan, ke: "ibu" | "pendamping"): string {
  const nama = namaDepan(r.ibu.profil.nama);
  const sapa = ke === "ibu" ? `Bu ${nama}` : `Bapak/Ibu keluarga Bu ${nama}`;
  return `${sapa}, dari catatan Buku KIA ada hal yang perlu segera diperiksa oleh bidan hari ini. Mohon segera ke ${r.ibu.profil.faskes_tk1 ?? "Puskesmas"} atau hubungi bidan. Bila ada perdarahan, kejang, atau sesak, langsung ke fasilitas kesehatan terdekat. (Rangkul)`;
}
