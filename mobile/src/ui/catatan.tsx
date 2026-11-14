/** Isi satu catatan Buku KIA sebagai daftar label–nilai (padanan TampilCatatan di web). */
import { View } from "react-native";
import { bolehLihatKolom } from "@/lib/akses";
import { kamus, type Kolom } from "@/lib/kamus";
import type { Tanda } from "@/lib/nilai-catatan";
import { usePengguna } from "@/lib/store";
import { tampil, tampilWaktu } from "@/lib/tanggal";
import type { Catatan, Data, Nilai } from "@/lib/types";
import { W, WARNA_NADA } from "~/tema";
import { Teks } from "./dasar";

export function judulCatatan(c: Catatan): string {
  const d = c.data;
  switch (c.tabel) {
    case "anc":
      return `K${d.kunjungan_ke ?? "?"} · ${tampil(d.tanggal)}`;
    case "kf":
      return `KF${d.kf_ke ?? "?"} · ${tampil(d.tanggal)}`;
    case "kn":
      return `${d.kn_ke ?? "KN"} · ${tampilWaktu(d.tanggal_jam)}`;
    case "pemantauan_hamil":
      return `Minggu ke-${d.minggu_kehamilan}`;
    case "pemantauan_nifas":
    case "pemantauan_bayi":
      return `Hari ke-${d.hari_ke}`;
    case "persalinan":
      return tampilWaktu(d.tanggal_jam);
    case "bayi_lahir":
      return `${d.nama_anak ?? "Bayi"} · ${d.berat_lahir_g ?? "?"} g`;
    case "rujukan":
      return `${tampil(d.tanggal_rujuk)} → ${d.tujuan ?? ""}`;
    default:
      return tampil(d.tanggal ?? c.meta.dibuat_pada);
  }
}

export function format(kol: Kolom, v: Nilai): string {
  if (v === undefined || v === null || v === "") return "–";
  if (kol.tipe === "boolean") return v ? "Ya" : "Tidak";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return String((v as Record<string, unknown>).catatan ?? JSON.stringify(v));
  if (kol.tipe === "date") return tampil(String(v).slice(0, 10));
  if (kol.tipe === "datetime") return tampilWaktu(String(v));
  if (kol.tipe === "number") return `${String(v).replace(".", ",")}${kol.satuan ? ` ${kol.satuan}` : ""}`;
  return String(v);
}

export function TampilCatatan({ tabel, data, tandai }: { tabel: string; data: Data; tandai?: Record<string, Tanda> }) {
  const u = usePengguna();
  const def = kamus.tabel[tabel];
  const ada = (v: unknown) => !(v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length));
  const baris = Object.entries(def.kolom).filter(([k, kol]) => {
    if (!ada(data[k])) return false;
    if (kol.tipe === "ref" || ["ibu_id", "kehamilan_id", "anak_id", "rujukan_id"].includes(k)) return false;
    return bolehLihatKolom(u, k);
  });
  const td = ada(data.td_sistolik) && ada(data.td_diastolik);
  return (
    <View>
      {baris.map(([k, kol]) => {
        if (td && k === "td_diastolik") return null;
        let label = kol.label;
        let nilai = format(kol, data[k]);
        let t = tandai?.[k];
        if (td && k === "td_sistolik") {
          label = "Tekanan darah";
          nilai = `${data.td_sistolik}/${data.td_diastolik} mmHg`;
          t = tandai?.td;
        } else if (kol.tipe === "number" && /\s?ke-$/.test(label)) {
          label = label.replace(/\s?ke-$/, "");
          nilai = `ke-${nilai}`;
        } else if (kol.tipe === "number" && !kol.satuan && k.endsWith("_minggu")) {
          nilai = `${nilai} minggu`;
        }
        const warna = t ? WARNA_NADA[t.level] : null;
        return (
          <View
            key={k}
            style={[
              { flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 9, paddingHorizontal: 10, marginHorizontal: -10 },
              warna ? { backgroundColor: warna.latar, borderRadius: 12, marginVertical: 2 } : { borderBottomWidth: 1, borderBottomColor: "rgba(230,235,242,0.7)" },
            ]}
          >
            <Teks w={t ? 500 : 400} s={14} c={warna ? warna.teks : W.muted} style={{ flex: 1 }}>
              {label}
            </Teks>
            <View style={{ flexShrink: 1, maxWidth: "55%" }}>
              <Teks w={600} s={14} c={warna ? warna.teks : W.ink} style={{ textAlign: "right" }}>
                {nilai}
              </Teks>
              {t && (
                <Teks w={600} s={11.5} c={warna!.teks} lh={15} style={{ textAlign: "right" }}>
                  {t.judul}
                  {t.ket ? ` (${t.ket})` : ""}
                </Teks>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
