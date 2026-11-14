/**
 * Masuk saat tersambung ke Supabase, mengikuti alur SATUSEHAT Mobile:
 * sambutan (Masuk / Daftar) → nomor telepon atau email → PIN 6 angka.
 * Aplikasi ini khusus Ibu; kader dan nakes masuk lewat Rangkul web dengan email & kata sandi.
 */
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { alamatAkunIbu, masukAkun, type CaraMasuk } from "@/lib/akun";
import { W } from "~/tema";
import { Bidang, Isian, IsianTelepon, PapanPin, TabGaris } from "./akun";
import { LogoMark, Teks, Tombol } from "./dasar";
import { GambarKia } from "./gambar";
import { TombolSos } from "./sos";

export function MasukAwan() {
  const ins = useSafeAreaInsets();
  const router = useRouter();
  const [langkah, setLangkah] = useState<"sambutan" | "isi" | "pin">("sambutan");
  const [cara, setCara] = useState<CaraMasuk>("telepon");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");

  const alamat = alamatAkunIbu(cara, cara === "telepon" ? telepon : email);

  if (langkah === "pin" && alamat) {
    return (
      <PapanPin
        judul="Masukkan PIN"
        sub="Masukkan PIN Anda untuk masuk ke Rangkul"
        onSelesai={async (pin) => {
          try {
            await masukAkun(alamat, pin, true);
            router.replace("/ibu");
            return null;
          } catch (e) {
            return (e as Error).message;
          }
        }}
        bawah={
          <Pressable onPress={() => setLangkah("isi")} hitSlop={8}>
            <Teks w={600} s={15} c="#fff">
              Ganti nomor atau email
            </Teks>
          </Pressable>
        }
      />
    );
  }

  if (langkah === "isi") {
    return (
      <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: W.surface }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: ins.top + 8, paddingBottom: ins.bottom + 24 }}>
          <Pressable onPress={() => setLangkah("sambutan")} accessibilityLabel="Kembali" style={{ width: 44, height: 44, marginLeft: -8, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={24} color={W.ink} />
          </Pressable>
          <Teks w={700} s={28} lh={34} style={{ marginTop: 12 }}>
            Masukkan Email atau Nomor Telepon
          </Teks>
          <View style={{ marginTop: 24 }}>
            <TabGaris
              nilai={cara}
              setNilai={setCara}
              pilihan={[
                { nilai: "telepon", label: "Nomor Telepon" },
                { nilai: "email", label: "Email" },
              ]}
            />
          </View>
          <View style={{ marginTop: 24 }}>
            {cara === "telepon" ? (
              <Bidang label="Nomor Telepon" kanan={`${telepon.length}/13`}>
                <IsianTelepon nilai={telepon} setNilai={setTelepon} />
              </Bidang>
            ) : (
              <Bidang label="Email">
                <Isian value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="Masukkan email" />
              </Bidang>
            )}
          </View>
          <Teks s={14} c={W.muted} style={{ marginTop: 16 }}>
            Lupa PIN? Minta bantuan bidan atau kader posyandu Ibu.
          </Teks>
          <View style={{ marginTop: "auto", paddingTop: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
              <Teks s={14} c={W.muted}>
                Belum punya akun Rangkul?{" "}
              </Teks>
              <Pressable onPress={() => router.push("/daftar")} hitSlop={8}>
                <Teks w={600} s={14} c={W.brand}>
                  Daftar
                </Teks>
              </Pressable>
            </View>
            <Tombol nonaktif={!alamat} onPress={() => setLangkah("pin")}>
              Lanjut
            </Tombol>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: W.surface, paddingHorizontal: 24, paddingTop: ins.top + 16, paddingBottom: ins.bottom + 24 }}>
      <View style={{ alignSelf: "flex-start" }}>
        <TombolSos tandaBahaya={false} />
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
        <View style={{ width: "100%", maxWidth: 300 }}>
          <View style={{ overflow: "hidden", borderRadius: 140, backgroundColor: "#f4f2e7", aspectRatio: 1.05, alignItems: "center", justifyContent: "center" }}>
            <GambarKia nama="menyusui" alt="Ayah, ibu, dan bayi yang sedang menyusu" style={{ transform: [{ scale: 1.15 }] }} />
          </View>
          <LogoMark ukuran={64} style={{ position: "absolute", bottom: -22, alignSelf: "center", borderWidth: 4, borderColor: W.surface }} />
        </View>
        <Teks w={800} s={30} lh={36} c={W.brand} style={{ marginTop: 44, letterSpacing: -0.5 }}>
          Rangkul
        </Teks>
        <Teks s={15} c={W.muted} style={{ marginTop: 6, textAlign: "center", maxWidth: 280 }}>
          Teman Buku KIA untuk Ibu hamil, ibu nifas, dan bayi baru lahir.
        </Teks>
      </View>
      <Tombol onPress={() => setLangkah("isi")}>Masuk</Tombol>
      <Tombol varian="garis" onPress={() => router.push("/daftar")} style={{ marginTop: 12, borderWidth: 2, borderColor: W.brand }}>
        <Teks w={600} s={15} c={W.brand}>
          Daftar
        </Teks>
      </Tombol>
    </View>
  );
}
