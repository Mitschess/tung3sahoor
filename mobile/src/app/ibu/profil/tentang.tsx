import Constants from "expo-constants";
import { ExternalLink, TriangleAlert } from "lucide-react-native";
import { Linking, Pressable, View } from "react-native";
import { kamus } from "@/lib/kamus";
import { W } from "~/tema";
import { Kartu, Kepala, Layar, LogoMark, Pemisah, Teks, gayaKartu } from "~/ui/dasar";
import { Ilustrasi, type NamaIlustrasi } from "~/ui/ilustrasi";

const KEGUNAAN: { gambar: NamaIlustrasi; judul: string; teks: string }[] = [
  { gambar: "jadwal", judul: "Ingat jadwal periksa", teks: "K1–K6, kunjungan nifas, dan kunjungan bayi." },
  { gambar: "pantau", judul: "Pantau kondisi Ibu dan bayi", teks: "Cukup ketuk gambar keluhan yang dialami." },
  { gambar: "bahaya", judul: "Kenali tanda bahaya", teks: "Bergambar, dengan arahan kapan harus ke Puskesmas." },
  { gambar: "buku", judul: "Belajar dari buku bergambar", teks: "Materi Buku KIA sesuai tahap Ibu." },
];

/** Tentang Rangkul: apa gunanya, dari mana isinya, dan batasannya. */
export default function Tentang() {
  return (
    <Layar jarak={24} kepala={<Kepala judul="Tentang Rangkul" kembali="/ibu/profil" />}>
      <Kartu style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 }}>
        <LogoMark ukuran={64} />
        <Teks w={800} s={24} style={{ marginTop: 12, letterSpacing: -0.3 }}>
          Rangkul
        </Teks>
        <Teks s={14} c={W.muted}>
          Buku KIA yang tidak berhenti di kertas
        </Teks>
        <Teks s={15} lh={23} c="rgba(31,42,55,0.8)" style={{ marginTop: 16, textAlign: "center" }}>
          Rangkul membantu Ibu, kader, bidan, dan dokter memakai isi Buku KIA setiap hari, dari masa hamil sampai bayi berusia 28 hari.
        </Teks>
      </Kartu>

      <View>
        <Teks w={600} s={14} c={W.muted} style={{ marginBottom: 10 }}>
          Yang bisa Ibu lakukan
        </Teks>
        <View style={[gayaKartu, { overflow: "hidden" }]}>
          {KEGUNAAN.map((k, i) => (
            <View key={k.judul}>
              {i > 0 && <Pemisah />}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 }}>
                <Ilustrasi nama={k.gambar} ukuran={48} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Teks w={600} s={15} lh={20}>
                    {k.judul}
                  </Teks>
                  <Teks s={14} lh={19} c={W.muted}>
                    {k.teks}
                  </Teks>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View>
        <Teks w={600} s={14} c={W.muted} style={{ marginBottom: 10 }}>
          Sumber isi
        </Teks>
        <Pressable onPress={() => Linking.openURL(kamus.url_pdf)} style={({ pressed }) => [gayaKartu, { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, opacity: pressed ? 0.85 : 1 }]}>
          <Ilustrasi nama="bukuKia" ukuran={48} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Teks w={600} s={15} lh={20}>
              Buku Kesehatan Ibu dan Anak 2024
            </Teks>
            <Teks s={14} c={W.muted}>
              Kementerian Kesehatan RI · buka PDF
            </Teks>
          </View>
          <ExternalLink size={18} color={W.muted} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 12, borderRadius: 16, backgroundColor: W.kuningSoft, padding: 16 }}>
        <TriangleAlert size={20} color={W.kuning} style={{ marginTop: 1 }} />
        <Teks s={14} lh={20} c="rgba(31,42,55,0.8)" style={{ flex: 1 }}>
          Rangkul tidak menggantikan Buku KIA dan pemeriksaan tenaga kesehatan. Bila ada tanda bahaya, segera ke fasilitas kesehatan terdekat.
        </Teks>
      </View>

      <Teks s={12} c={W.muted} style={{ textAlign: "center" }}>
        Versi {Constants.expoConfig?.version ?? "1.0.0"} (demo) · semua data di aplikasi ini adalah data contoh
      </Teks>
    </Layar>
  );
}
