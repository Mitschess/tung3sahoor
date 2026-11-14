/** Tombol SOS: jalan pintas ke 119 dan daftar tanda bahaya. Rangkul bukan layanan gawat darurat. */
import { useRouter } from "expo-router";
import { BellRing, ChevronRight, Phone, ShieldAlert } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Linking, View } from "react-native";
import { W } from "~/tema";
import { Ketuk, LembarBawah, Teks } from "./dasar";

export function TombolSos({ tandaBahaya = true }: { tandaBahaya?: boolean }) {
  const [buka, setBuka] = useState(false);
  const router = useRouter();
  return (
    <>
      <Ketuk onPress={() => setBuka(true)} style={{ height: 36, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 14, backgroundColor: W.rose, boxShadow: "0px 6px 16px -8px #e84d8a" }} accessibilityLabel="SOS, bantuan darurat">
        <BellRing size={16} color="#fff" />
        <Teks w={600} s={14} c="#fff">
          SOS
        </Teks>
      </Ketuk>
      <LembarBawah buka={buka} tutup={() => setBuka(false)} judul="Butuh bantuan segera?" deskripsi="Jika ada tanda bahaya, jangan menunggu jadwal periksa.">
        <View style={{ gap: 12 }}>
          <Pilihan latar={W.merah} ikonLatar="rgba(255,255,255,0.2)" ikon={<Phone size={20} color="#fff" />} judul="Telepon 119" sub="Layanan gawat darurat nasional" warna="#fff" subWarna="rgba(255,255,255,0.85)" onPress={() => Linking.openURL("tel:119")} />
          {tandaBahaya && (
            <Pilihan
              latar={W.merahSoft}
              ikonLatar="#fff"
              ikon={<ShieldAlert size={20} color={W.merah} />}
              judul="Lihat tanda bahaya"
              sub="Kehamilan, nifas, dan bayi baru lahir"
              warna={W.merah}
              subWarna="rgba(31,42,55,0.7)"
              onPress={() => {
                setBuka(false);
                router.push("/ibu/tanda-bahaya");
              }}
            />
          )}
          <Teks s={12} c={W.muted} style={{ textAlign: "center" }}>
            Rangkul bukan layanan gawat darurat. Segera ke Puskesmas atau Rumah Sakit terdekat.
          </Teks>
        </View>
      </LembarBawah>
    </>
  );
}

function Pilihan({ latar, ikonLatar, ikon, judul, sub, warna, subWarna, onPress }: { latar: string; ikonLatar: string; ikon: ReactNode; judul: string; sub: string; warna: string; subWarna: string; onPress: () => void }) {
  return (
    <Ketuk onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 16, backgroundColor: latar }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: ikonLatar }}>{ikon}</View>
      <View style={{ flex: 1 }}>
        <Teks w={700} s={15} c={warna}>
          {judul}
        </Teks>
        <Teks s={14} c={subWarna}>
          {sub}
        </Teks>
      </View>
      <ChevronRight size={20} color={warna} />
    </Ketuk>
  );
}
