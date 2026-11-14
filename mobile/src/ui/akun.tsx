/** Komponen layar masuk & daftar akun (padanan native dari src/components/akun.tsx di web). */
import { Check, Delete, Lock } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PANJANG_PIN } from "@/lib/akun";
import { HURUF, W } from "~/tema";
import { Teks, Tombol } from "./dasar";

/** Tab bergaris bawah seperti SATUSEHAT (Nomor Telepon | Email). */
export function TabGaris<T extends string>({ nilai, setNilai, pilihan }: { nilai: T; setNilai: (v: T) => void; pilihan: { nilai: T; label: string }[] }) {
  return (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: W.line }}>
      {pilihan.map((p) => {
        const aktif = p.nilai === nilai;
        return (
          <Pressable
            key={p.nilai}
            onPress={() => setNilai(p.nilai)}
            accessibilityRole="tab"
            accessibilityState={{ selected: aktif }}
            style={{ flex: 1, alignItems: "center", paddingVertical: 12, marginBottom: -1, borderBottomWidth: 3, borderBottomColor: aktif ? W.brand : "transparent" }}
          >
            <Teks w={aktif ? 600 : 400} s={16} c={aktif ? W.brand : W.muted}>
              {p.label}
            </Teks>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Bidang({ label, wajib, ket, kanan, children }: { label: string; wajib?: boolean; ket?: string; kanan?: string; children: ReactNode }) {
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Teks w={600} s={14}>
          {label}
          {wajib ? <Teks w={600} s={14} c={W.merah}> *</Teks> : null}
        </Teks>
        {kanan ? (
          <Teks s={12} c={W.muted}>
            {kanan}
          </Teks>
        ) : null}
      </View>
      {ket ? (
        <Teks s={12} c={W.muted} style={{ marginTop: 2 }}>
          {ket}
        </Teks>
      ) : null}
      <View style={{ marginTop: 6 }}>{children}</View>
    </View>
  );
}

const gayaIsian = { height: 50, borderWidth: 1, borderColor: W.line, borderRadius: 14, backgroundColor: W.surface, paddingHorizontal: 16, fontFamily: HURUF[400], fontSize: 15, color: W.ink } as const;

export function Isian(p: TextInputProps) {
  const [fokus, setFokus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={W.pudar}
      {...p}
      onFocus={(e) => {
        setFokus(true);
        p.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFokus(false);
        p.onBlur?.(e);
      }}
      style={[gayaIsian, fokus && { borderColor: W.brand }, p.style]}
    />
  );
}

export function IsianTelepon({ nilai, setNilai }: { nilai: string; setNilai: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 50, borderWidth: 1, borderColor: W.line, borderRadius: 14, backgroundColor: W.surface }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, height: "100%", borderRightWidth: 1, borderRightColor: W.line }}>
        <View style={{ width: 20, height: 14, borderRadius: 2, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(0,0,0,0.12)" }}>
          <View style={{ flex: 1, backgroundColor: "#e70011" }} />
          <View style={{ flex: 1, backgroundColor: "#fff" }} />
        </View>
        <Teks w={600} s={15}>
          +62
        </Teks>
      </View>
      <TextInput
        value={nilai}
        onChangeText={(t) => setNilai(t.replace(/\D/g, ""))}
        keyboardType="phone-pad"
        autoComplete="tel"
        maxLength={14}
        placeholder="812xxxxxxxx"
        placeholderTextColor={W.pudar}
        style={{ flex: 1, height: "100%", paddingHorizontal: 12, fontFamily: HURUF[400], fontSize: 15, color: W.ink }}
      />
    </View>
  );
}

/** Pilihan berbentuk pil (posyandu, cara masuk). */
export function Pil({ label, aktif, onPress }: { label: string; aktif: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: aktif }}
      style={{ height: 42, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: aktif ? W.brand : W.line, backgroundColor: aktif ? W.brandSoft : W.surface, justifyContent: "center" }}
    >
      <Teks w={600} s={14} c={aktif ? W.brandInk : W.muted}>
        {label}
      </Teks>
    </Pressable>
  );
}

/**
 * Layar PIN biru penuh seperti "Masukkan PIN" di SATUSEHAT. onSelesai dipanggil saat 6 angka
 * terisi; kembalikan pesan salah untuk mengosongkan PIN dan menggoyang titik.
 */
export function PapanPin({ judul, sub, onSelesai, bawah }: { judul: string; sub: string; onSelesai: (pin: string) => Promise<string | null>; bawah?: ReactNode }) {
  const ins = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [salah, setSalah] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const x = useSharedValue(0);
  const gayaGoyang = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const tekan = (k: string) => {
    if (sibuk) return;
    setSalah(null);
    if (k === "hapus") return setPin(pin.slice(0, -1));
    if (pin.length >= PANJANG_PIN) return;
    const baru = pin + k;
    setPin(baru);
    if (baru.length < PANJANG_PIN) return;
    setSibuk(true);
    void onSelesai(baru).then((m) => {
      setSibuk(false);
      if (!m) return;
      setSalah(m);
      setPin("");
      x.value = withSequence(withTiming(-12, { duration: 60 }), withTiming(12, { duration: 60 }), withTiming(-8, { duration: 60 }), withTiming(8, { duration: 60 }), withTiming(0, { duration: 60 }));
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: W.brand, alignItems: "center", paddingHorizontal: 24, paddingTop: ins.top + 40, paddingBottom: ins.bottom + 20 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Lock size={24} color={W.brand} strokeWidth={2.4} />
      </View>
      <Teks w={700} s={26} lh={32} c="#fff" style={{ marginTop: 20 }}>
        {judul}
      </Teks>
      <Teks s={15} c="rgba(255,255,255,0.85)" style={{ marginTop: 8, textAlign: "center", maxWidth: 300 }}>
        {sub}
      </Teks>
      <Animated.View style={[{ flexDirection: "row", gap: 20, marginTop: 32 }, gayaGoyang]} accessibilityLabel={`${pin.length} dari ${PANJANG_PIN} angka terisi`}>
        {Array.from({ length: PANJANG_PIN }, (_, i) => (
          <View key={i} style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: "#fff", backgroundColor: i < pin.length ? "#fff" : "transparent" }} />
        ))}
      </Animated.View>
      <Teks w={600} s={14} c="#ffe08a" style={{ marginTop: 16, minHeight: 40, textAlign: "center", maxWidth: 300 }} accessibilityLiveRegion="polite">
        {sibuk ? "Memeriksa…" : (salah ?? "")}
      </Teks>
      <View style={{ width: "100%", maxWidth: 300, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "hapus"].map((k, i) =>
          k === "" ? (
            <View key={i} style={{ width: "28%" }} />
          ) : (
            <Pressable
              key={k}
              onPress={() => tekan(k)}
              accessibilityLabel={k === "hapus" ? "Hapus satu angka" : k}
              style={({ pressed }) => [
                { width: "28%", aspectRatio: 1, borderRadius: 999, alignItems: "center", justifyContent: "center" },
                k !== "hapus" && { backgroundColor: "#fff", boxShadow: "0px 1px 3px rgba(0,0,0,0.12)" },
                pressed && { transform: [{ scale: 0.94 }], opacity: 0.85 },
              ]}
            >
              {k === "hapus" ? (
                <Delete size={32} color="#fff" />
              ) : (
                <Teks w={600} s={28} lh={34}>
                  {k}
                </Teks>
              )}
            </Pressable>
          ),
        )}
      </View>
      <View style={{ marginTop: "auto", paddingTop: 24 }}>{bawah}</View>
    </View>
  );
}

/** Isi lembar Syarat & Ketentuan dengan kotak centang dan tombol "Saya Setuju". */
export function IsiSyarat({ poin, onSetuju, onBatal }: { poin: string[]; onSetuju: () => void; onBatal: () => void }) {
  const [setuju, setSetuju] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <Teks w={700} s={22} lh={28}>
        Syarat & Ketentuan Penggunaan dan Pemberitahuan Privasi Rangkul
      </Teks>
      <Teks s={15} c="rgba(31,42,55,0.85)">
        Syarat & Ketentuan ini perlu dibaca, dipahami, dan disetujui sebelum memakai Rangkul:
      </Teks>
      {poin.map((b) => (
        <View key={b} style={{ flexDirection: "row", gap: 10, paddingRight: 4 }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: W.ink, marginTop: 8 }} />
          <Teks s={14} style={{ flex: 1 }}>
            {b}
          </Teks>
        </View>
      ))}
      <Pressable onPress={() => setSetuju(!setuju)} accessibilityRole="checkbox" accessibilityState={{ checked: setuju }} style={{ flexDirection: "row", gap: 12, padding: 16, borderRadius: 16, backgroundColor: W.bg }}>
        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: W.brand, backgroundColor: setuju ? W.brand : W.surface, alignItems: "center", justifyContent: "center" }}>
          {setuju && <Check size={16} color="#fff" strokeWidth={3} />}
        </View>
        <Teks s={14} style={{ flex: 1 }}>
          Dengan menyatakan Setuju, saya menerima seluruh isi Syarat & Ketentuan Penggunaan dan Pemberitahuan Privasi Rangkul.
        </Teks>
      </Pressable>
      <Tombol nonaktif={!setuju} onPress={onSetuju}>
        Saya Setuju
      </Tombol>
      <Pressable onPress={onBatal} style={{ alignItems: "center", padding: 8 }}>
        <Teks w={600} s={14} c={W.muted}>
          Batal
        </Teks>
      </Pressable>
    </View>
  );
}
