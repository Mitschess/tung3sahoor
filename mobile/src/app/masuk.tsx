import { CloudOff } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MODE_AWAN } from "@/lib/store";
import { W } from "~/tema";
import { Kosong } from "~/ui/dasar";
import { MasukAwan } from "~/ui/masuk-awan";

/** Layar masuk: nomor HP/email + PIN. Tidak ada akun demo; tanpa Supabase aplikasi tidak bisa dipakai. */
export default function Masuk() {
  const ins = useSafeAreaInsets();
  if (MODE_AWAN) return <MasukAwan />;
  return (
    <View style={{ flex: 1, backgroundColor: W.surface, paddingTop: ins.top + 40, paddingHorizontal: 20, justifyContent: "center" }}>
      <Kosong
        ikon={<CloudOff size={36} color={W.brand} />}
        judul="Server belum tersambung"
        teks="Rangkul belum bisa dipakai karena alamat server belum diatur. Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY di mobile/.env, lalu build ulang aplikasi."
      />
    </View>
  );
}
