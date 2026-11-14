import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { ArrowLeft, CalendarDays, Info, Lock } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SYARAT_IBU, cekDataIbu, cekPin, daftarIbuMandiri, type CaraMasuk } from "@/lib/akun";
import { POSYANDU } from "@/lib/seed";
import { MODE_AWAN } from "@/lib/store";
import { iso, parse, tampil } from "@/lib/tanggal";
import { W } from "~/tema";
import { Bidang, Isian, IsianTelepon, IsiSyarat, PapanPin, Pil, TabGaris } from "~/ui/akun";
import { Catatan, Kosong, LembarBawah, Teks, Tombol, kabar } from "~/ui/dasar";

/** Pendaftaran Ibu: Syarat & Ketentuan → Lengkapi Identitas Diri → Buat PIN → Konfirmasi PIN. */
export default function Daftar() {
  const ins = useSafeAreaInsets();
  const router = useRouter();
  const [sudahSetuju, setSudahSetuju] = useState(false);
  const [langkah, setLangkah] = useState<"identitas" | "pin" | "ulang">("identitas");
  const [cara, setCara] = useState<CaraMasuk>("telepon");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [lahir, setLahir] = useState("");
  const [posyandu, setPosyandu] = useState("");
  const [pin, setPin] = useState("");
  const [coba, setCoba] = useState(false);
  const [galatKirim, setGalatKirim] = useState<string | null>(null);
  const [pilihIos, setPilihIos] = useState(false);

  if (!MODE_AWAN) {
    return (
      <View style={{ flex: 1, backgroundColor: W.surface, paddingTop: ins.top + 40, paddingHorizontal: 20 }}>
        <Kosong ikon={<Info size={36} color={W.brand} />} judul="Server belum tersambung" teks="Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY di mobile/.env, lalu build ulang aplikasi." aksi={<Tombol onPress={() => router.back()}>Kembali</Tombol>} />
      </View>
    );
  }

  const kembali = () => (router.canGoBack() ? router.back() : router.replace("/masuk"));
  const data = { cara, nilai: cara === "telepon" ? telepon : email, nama, nik, tanggalLahir: lahir, posyandu };
  const salah = cekDataIbu(data);

  if (langkah === "pin") {
    return (
      <PapanPin
        key="pin"
        judul="Buat PIN"
        sub="Buat 6 angka PIN untuk masuk ke Rangkul. Jangan beri tahu siapa pun."
        onSelesai={async (p) => {
          const m = cekPin(p);
          if (m) return m;
          setPin(p);
          setLangkah("ulang");
          return null;
        }}
        bawah={
          <Pressable onPress={() => setLangkah("identitas")} hitSlop={8}>
            <Teks w={600} s={15} c="#fff">
              Kembali ke identitas
            </Teks>
          </Pressable>
        }
      />
    );
  }

  if (langkah === "ulang") {
    return (
      <PapanPin
        key="ulang"
        judul="Konfirmasi PIN"
        sub="Masukkan sekali lagi PIN yang baru dibuat."
        onSelesai={async (p) => {
          if (p !== pin) return "PIN tidak sama. Coba lagi.";
          try {
            await daftarIbuMandiri({ ...data, pin });
            kabar("Akun Ibu sudah dibuat. Selamat datang di Rangkul!");
            router.replace("/ibu");
            return null;
          } catch (e) {
            setGalatKirim((e as Error).message);
            setLangkah("identitas");
            return (e as Error).message;
          }
        }}
        bawah={
          <Pressable onPress={() => setLangkah("pin")} hitSlop={8}>
            <Teks w={600} s={15} c="#fff">
              Buat ulang PIN
            </Teks>
          </Pressable>
        }
      />
    );
  }

  const bukaTanggal = () => {
    const nilai = parse(lahir) ?? new Date(2000, 0, 1);
    if (Platform.OS === "android") DateTimePickerAndroid.open({ value: nilai, mode: "date", maximumDate: new Date(), onChange: (e, d) => e.type === "set" && d && setLahir(iso(d)) });
    else setPilihIos(true);
  };
  const nikBersih = nik.replace(/\D/g, "");

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: W.surface }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: ins.top + 8, paddingBottom: ins.bottom + 32, gap: 20 }}>
        <View>
          <Pressable onPress={kembali} accessibilityLabel="Kembali" style={{ width: 44, height: 44, marginLeft: -8, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={24} color={W.ink} />
          </Pressable>
          <Teks w={700} s={26} lh={32} style={{ marginTop: 8 }}>
            Lengkapi Identitas Diri
          </Teks>
          <Teks s={14} c={W.muted} style={{ marginTop: 4 }}>
            Agar data Buku KIA Ibu tersambung dengan kader, bidan, dan dokter puskesmas.
          </Teks>
        </View>

        <Bidang label="Cara masuk" wajib>
          <TabGaris
            nilai={cara}
            setNilai={setCara}
            pilihan={[
              { nilai: "telepon", label: "Nomor Telepon" },
              { nilai: "email", label: "Email" },
            ]}
          />
        </Bidang>
        {cara === "telepon" ? (
          <Bidang label="Nomor Telepon" wajib kanan={`${telepon.length}/13`}>
            <IsianTelepon nilai={telepon} setNilai={setTelepon} />
          </Bidang>
        ) : (
          <Bidang label="Email" wajib>
            <Isian value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="Masukkan email" />
          </Bidang>
        )}
        <Bidang label="Nama Lengkap" wajib ket="Nama harus sesuai dengan KTP">
          <Isian value={nama} onChangeText={setNama} autoCapitalize="words" autoComplete="name" placeholder="Masukkan nama lengkap" />
        </Bidang>
        <Bidang label="NIK" wajib kanan={`${nikBersih.length}/16`}>
          <Isian value={nikBersih} onChangeText={setNik} keyboardType="number-pad" maxLength={16} placeholder="Masukkan NIK sesuai KTP" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Lock size={12} color={W.muted} />
            <Teks s={12} c={W.muted}>
              Disimpan tersandi, yang tampil hanya 4 angka terakhir
            </Teks>
          </View>
        </Bidang>
        <Bidang label="Tanggal Lahir" wajib>
          <Pressable onPress={bukaTanggal} style={{ height: 50, borderWidth: 1, borderColor: W.line, borderRadius: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Teks s={15} c={lahir ? W.ink : W.pudar}>
              {lahir ? tampil(lahir) : "Pilih tanggal lahir"}
            </Teks>
            <CalendarDays size={20} color={W.muted} />
          </Pressable>
          {pilihIos && (
            <DateTimePicker
              value={parse(lahir) ?? new Date(2000, 0, 1)}
              mode="date"
              display="inline"
              maximumDate={new Date()}
              onChange={(_, d) => {
                setPilihIos(false);
                if (d) setLahir(iso(d));
              }}
            />
          )}
        </Bidang>
        <Bidang label="Posyandu" wajib ket="Tempat Ibu biasa menimbang dan periksa">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {POSYANDU.map((p) => (
              <Pil key={p} label={p} aktif={posyandu === p} onPress={() => setPosyandu(p)} />
            ))}
          </View>
        </Bidang>
        <Catatan ikon={<Info size={16} color={W.brandInk} />} latar={W.brandSoft} warna={W.brandInk}>
          Sudah didaftarkan kader atau bidan? Isi NIK dan tanggal lahir yang sama, catatan Buku KIA Ibu langsung tersambung.
        </Catatan>
        {(coba && salah) || galatKirim ? (
          <View style={{ backgroundColor: W.merahSoft, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Teks w={500} s={14} c={W.merah} accessibilityRole="alert">
              {(coba && salah) || galatKirim}
            </Teks>
          </View>
        ) : null}
        <Tombol
          onPress={() => {
            setCoba(true);
            setGalatKirim(null);
            if (!salah) setLangkah("pin");
          }}
        >
          Lanjut buat PIN
        </Tombol>
      </ScrollView>

      <LembarBawah buka={!sudahSetuju} tutup={kembali} tanpaTutup judul="Syarat & Ketentuan">
        <IsiSyarat poin={SYARAT_IBU} onSetuju={() => setSudahSetuju(true)} onBatal={kembali} />
      </LembarBawah>
    </KeyboardAvoidingView>
  );
}
