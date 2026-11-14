import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NamaGambar } from "@/data/gambar-kia";
import { MODE_AWAN, useStore } from "@/lib/store";
import type { Pengguna } from "@/lib/types";
import { W } from "~/tema";
import { Ketuk, LatarIbu, LembarBawah, LogoMark, Teks, Tombol, gayaKartu, kabar } from "~/ui/dasar";
import { GambarKia } from "~/ui/gambar";
import { MasukAwan } from "~/ui/masuk-awan";
import { TombolSos } from "~/ui/sos";

/** Potret akun demo: potongan ilustrasi Buku KIA (bukan foto orang sungguhan). */
const potret = (u: Pengguna): NamaGambar => (u.keterangan?.includes("Nifas") ? "avatar-ibu-nifas" : "avatar-ibu-hamil");

/** Layar masuk. Tersambung ke Supabase: nomor HP/email + PIN. Tanpa Supabase: pilih akun demo. */
export default function Masuk() {
  return MODE_AWAN ? <MasukAwan /> : <MasukDemo />;
}

/** Sambutan, persetujuan privasi, lalu pilih akun Ibu. Aplikasi ini khusus Ibu; kader dan nakes memakai web. */
function MasukDemo() {
  const ins = useSafeAreaInsets();
  const router = useRouter();
  const pengguna = useStore((s) => s.pengguna);
  const masuk = useStore((s) => s.masuk);
  const reset = useStore((s) => s.resetDemo);
  const setuju = useStore((s) => s.setujuPrivasi);
  const setujui = useStore((s) => s.setujuiPrivasi);
  const [pilih, setPilih] = useState(false);

  if (pilih) {
    const akun = pengguna.filter((u) => u.peran === "ibu");
    return (
      <View style={{ flex: 1, backgroundColor: W.latar }}>
        <LatarIbu />
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: ins.top + 8, paddingBottom: ins.bottom + 24 }}>
          <Pressable onPress={() => setPilih(false)} accessibilityLabel="Kembali" style={{ width: 44, height: 44, marginLeft: -8, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={24} color={W.ink} />
          </Pressable>
          <Teks w={700} s={28} lh={34} style={{ marginTop: 20 }}>
            Masuk sebagai siapa?
          </Teks>
          <Teks s={14} c={W.muted} style={{ marginTop: 8 }}>
            Pilih akun Ibu. Tampilan paling sederhana: tahap kehamilan, tugas hari ini, dan tanda bahaya.
          </Teks>
          <View style={{ gap: 12, marginTop: 20 }}>
            {akun.map((u) => (
              <Ketuk
                key={u.id}
                skala={0.99}
                onPress={() => {
                  masuk(u.id);
                  router.replace("/ibu");
                }}
                style={[gayaKartu, { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 }]}
              >
                <View style={{ width: 56, height: 56, borderRadius: 28, overflow: "hidden" }}>
                  <GambarKia nama={potret(u)} style={{ width: 56, height: 56 }} posisi="center" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Teks w={600} s={12} c={W.muted} style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                    Ibu
                  </Teks>
                  <Teks w={600} s={17} numberOfLines={1}>
                    {u.nama}
                  </Teks>
                  <Teks s={14} c={W.muted} numberOfLines={1}>
                    {u.keterangan}
                  </Teks>
                </View>
                <ChevronRight size={20} color={W.brand} />
              </Ketuk>
            ))}
          </View>
          <View style={{ marginTop: "auto", paddingTop: 40, alignItems: "center", gap: 8 }}>
            <Teks s={14} c={W.muted} style={{ textAlign: "center" }}>
              Akun demo tanpa kata sandi. Semua data fiktif dan hanya tersimpan di HP ini. Kader dan nakes memakai Rangkul versi web.
            </Teks>
            <Pressable
              onPress={() => {
                reset();
                kabar("Data demo dikembalikan ke awal");
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, padding: 6 }}
            >
              <RotateCcw size={16} color={W.brand} />
              <Teks w={600} s={14} c={W.brand}>
                Kembalikan data demo
              </Teks>
            </Pressable>
          </View>
        </ScrollView>
      </View>
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
      <Tombol onPress={() => setPilih(true)}>Masuk</Tombol>
      <Teks s={14} c={W.muted} style={{ marginTop: 16, textAlign: "center" }}>
        Belum terdaftar? Bawa Buku KIA ke kader posyandu, pendaftaran dilakukan bersama Ibu.
      </Teks>

      <LembarBawah buka={!setuju} tutup={() => undefined} tanpaTutup judul="Syarat penggunaan & privasi">
        <View style={{ gap: 12 }}>
          <Teks s={15} c="rgba(31,42,55,0.85)">
            Sebelum memakai Rangkul, mohon baca ringkasan berikut:
          </Teks>
          {[
            "Data diambil dari Buku KIA dan hanya dilihat kader di posyandu Ibu, bidan wilayah, dan dokter puskesmas.",
            "Hasil tes HIV/sifilis/hepatitis B dan kesehatan jiwa hanya untuk bidan/dokter.",
            "NIK disimpan tersandi. Foto Buku KIA dihapus setelah dicek petugas.",
            "Rangkul bukan layanan gawat darurat dan tidak menggantikan pemeriksaan tenaga kesehatan.",
            "Versi demo ini memakai data fiktif yang tersimpan di HP Ibu saja.",
          ].map((b) => (
            <View key={b} style={{ flexDirection: "row", gap: 10, paddingRight: 4 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: W.ink, marginTop: 8 }} />
              <Teks s={14} style={{ flex: 1 }}>
                {b}
              </Teks>
            </View>
          ))}
          <Tombol onPress={setujui} style={{ marginTop: 4 }}>
            Saya setuju
          </Tombol>
        </View>
      </LembarBawah>
    </View>
  );
}
