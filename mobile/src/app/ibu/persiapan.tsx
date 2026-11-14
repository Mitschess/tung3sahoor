import { View } from "react-native";
import { kamus } from "@/lib/kamus";
import { useStore } from "@/lib/store";
import { terakhir } from "@/lib/tahap";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { Kepala, Ketuk, Layar, Memuat, TautanBuku, Teks, gayaKartu, kabar } from "~/ui/dasar";
import { GambarKia } from "~/ui/gambar";
import { Ilustrasi, type NamaIlustrasi } from "~/ui/ilustrasi";

const GAMBAR: Record<string, NamaIlustrasi> = {
  tanya_tanggal_persalinan: "jadwal",
  pendamping_siap: "keluarga",
  tabungan_persalinan: "dompet",
  kartu_jkn: "kartu",
  penolong_dipilih: "rs",
  dokumen_siap: "persiapan",
  donor_darah_siap: "darah",
  kendaraan_siap: "mobil",
  stiker_p4k: "rumah",
  rencana_kb: "kb",
};

/** Ceklis P4K (Buku KIA hlm. 18): tiap butir diketuk untuk menandai sudah siap. */
export default function Persiapan() {
  const r = useRingkasanSaya();
  const simpan = useStore((s) => s.simpan);
  if (!r) return <Memuat />;
  const rec = terakhir(r.cari, "persiapan");
  const data = rec?.data ?? {};
  const kolom = Object.entries(kamus.tabel.persiapan.kolom);
  const sudah = kolom.filter(([k]) => data[k] === true).length;
  const minggu = r.tahap.ukMinggu ?? 0;

  const ubah = (k: string) => {
    try {
      simpan("persiapan", r.ibu.id, { ...data, [k]: !(data[k] === true) }, rec ? { catatanId: rec.id } : {});
    } catch (e) {
      kabar((e as Error).message, true);
    }
  };

  return (
    <Layar kepala={<Kepala judul="Persiapan melahirkan" sub="Ceklis P4K · diisi oleh ibu" kembali="/ibu" />}>
      <View style={[gayaKartu, { overflow: "hidden" }]}>
        <View style={{ backgroundColor: "#eef3fb", alignItems: "center" }}>
          <GambarKia nama="p4k" alt="Ibu dan suami berkonsultasi dengan bidan menentukan tanggal persalinan" style={{ height: 176, width: undefined }} fit="contain" />
        </View>
        <View style={{ padding: 16 }}>
          <Teks w={700} s={15}>
            {sudah === kolom.length ? "Semua persiapan sudah siap" : `${sudah} dari ${kolom.length} sudah siap`}
          </Teks>
          <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
            {kolom.map(([k]) => (
              <View key={k} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: data[k] === true ? W.teal : "rgba(0,0,0,0.07)" }} />
            ))}
          </View>
          <Teks s={14} c={W.muted} style={{ marginTop: 10 }}>
            {minggu >= 36 ? "Sudah minggu ke-36: penolong, donor darah, dan kendaraan sebaiknya sudah siap." : "Mulai sejak trimester 2. Suami dan kader ikut melihat kemajuannya."}
          </Teks>
        </View>
      </View>

      <View>
        <Teks w={700} s={17}>
          Daftar persiapan
        </Teks>
        <Teks s={14} c={W.muted} style={{ marginBottom: 12 }}>
          Ketuk butir yang sudah Ibu siapkan.
        </Teks>
        <View style={{ gap: 10 }}>
          {kolom.map(([k, kol]) => {
            const v = data[k] === true;
            const penting = /minggu ke-36/.test(kol.peringatan ?? "") && !v && minggu >= 30;
            return (
              <Ketuk
                key={k}
                onPress={() => ubah(k)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: v }}
                skala={0.99}
                style={[{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 12 }, v ? gayaKartu : { borderWidth: 1.5, borderStyle: "dashed", borderColor: "#c9d3df" }]}
              >
                <Ilustrasi nama={GAMBAR[k] ?? "persiapan"} ukuran={48} redup={!v} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Teks w={500} s={15} lh={20}>
                    {kol.label}
                  </Teks>
                  {penting && (
                    <Teks w={600} s={12} c={W.kuning} style={{ marginTop: 2 }}>
                      Penting sebelum minggu ke-36
                    </Teks>
                  )}
                </View>
                <View style={[{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }, v ? { backgroundColor: W.teal } : { borderWidth: 1, borderColor: W.line }]}>
                  <Teks w={700} s={12} c={v ? "#fff" : W.muted} lh={16}>
                    {v ? "Siap" : "Belum"}
                  </Teks>
                </View>
              </Ketuk>
            );
          })}
        </View>
      </View>
      <TautanBuku halaman={18} label="Persiapan melahirkan di Buku KIA hlm. 18" />
    </Layar>
  );
}
