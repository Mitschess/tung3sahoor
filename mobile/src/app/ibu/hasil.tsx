import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { JudulBagian, Kartu, Kepala, Ketuk, Layar, Memuat, Teks, gayaKartu } from "~/ui/dasar";
import { GrafikBB, GrafikTfuDjj } from "~/ui/grafik";
import { DaftarJadwal } from "~/ui/tahap";

/** Jadwal kunjungan dan grafik. Isi tiap pemeriksaan dibaca di Catatan supaya tidak tampil dua kali. */
export default function Hasil() {
  const r = useRingkasanSaya();
  const router = useRouter();
  if (!r) return <Memuat />;
  const hamil = r.tahap.set === "hamil";
  return (
    <Layar jarak={24} kepala={<Kepala judul={hamil ? "Jadwal & grafik" : "Jadwal kunjungan"} kembali="/ibu" />}>
      {r.jadwal.length > 0 && (
        <View>
          <JudulBagian>Jadwal kunjungan</JudulBagian>
          <DaftarJadwal js={r.jadwal} />
        </View>
      )}

      {hamil && (
        <>
          <Kartu style={{ padding: 20 }}>
            <JudulBagian>Kenaikan berat badan</JudulBagian>
            <GrafikBB r={r} />
          </Kartu>
          <Kartu style={{ padding: 20 }}>
            <JudulBagian>Tinggi rahim & denyut jantung bayi</JudulBagian>
            <GrafikTfuDjj r={r} />
          </Kartu>
        </>
      )}

      <Ketuk onPress={() => router.navigate("/ibu/catatan")} skala={0.99} style={[gayaKartu, { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }]}>
        <View style={{ flex: 1 }}>
          <Teks w={600} s={15}>
            Lihat hasil tiap pemeriksaan
          </Teks>
          <Teks s={14} c={W.muted}>
            Semua catatan dari bidan dan kader ada di Catatan.
          </Teks>
        </View>
        <ChevronRight size={20} color={W.muted} />
      </Ketuk>
    </Layar>
  );
}
