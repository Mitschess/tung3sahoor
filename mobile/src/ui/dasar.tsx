/** Komponen dasar aplikasi Ibu (padanan native dari src/components/ui.tsx di web). */
import { useRouter, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, BookOpen, X } from "lucide-react-native";
import { useEffect, type ReactNode } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  Alert,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { urlHalamanCetak } from "@/lib/kamus";
import { BAYANGAN, HURUF, W, type Tebal } from "~/tema";

/* ---------- Teks ---------- */

export function Teks({ w = 400, s = 15, c = W.ink, lh, style, ...p }: TextProps & { w?: Tebal; s?: number; c?: string; lh?: number }) {
  return <Text {...p} style={[{ fontFamily: HURUF[w], fontSize: s, color: c, lineHeight: lh ?? Math.round(s * 1.4) }, style]} />;
}

/* ---------- Ketuk: Pressable dengan umpan balik tekan ---------- */

export function Ketuk({ style, children, skala = 0.98, ...p }: PressableProps & { style?: StyleProp<ViewStyle>; skala?: number; children: ReactNode }) {
  return (
    <Pressable {...p} style={({ pressed }) => [style, pressed && { transform: [{ scale: skala }], opacity: 0.92 }]}>
      {children}
    </Pressable>
  );
}

/* ---------- Kartu ---------- */

export const gayaKartu: ViewStyle = { backgroundColor: W.surface, borderRadius: 16, boxShadow: BAYANGAN };

export function Kartu({ style, children, padat }: { style?: StyleProp<ViewStyle>; children: ReactNode; padat?: boolean }) {
  return <View style={[gayaKartu, { padding: padat ? 0 : 16 }, padat && { overflow: "hidden" }, style]}>{children}</View>;
}

/* ---------- Tombol ---------- */

type Varian = "utama" | "kedua" | "garis" | "bahaya";
const VARIAN: Record<Varian, { latar: string; teks: string; garis?: string }> = {
  utama: { latar: W.brand, teks: "#fff" },
  kedua: { latar: W.brandSoft, teks: W.brandInk },
  garis: { latar: W.surface, teks: W.ink, garis: W.line },
  bahaya: { latar: W.merah, teks: "#fff" },
};

export function Tombol({ children, onPress, varian = "utama", ikon, style, nonaktif, memuat, warna }: { children: ReactNode; onPress?: () => void; varian?: Varian; ikon?: ReactNode; style?: StyleProp<ViewStyle>; nonaktif?: boolean; memuat?: boolean; warna?: string }) {
  const v = VARIAN[varian];
  const latar = nonaktif ? "#dfe4ea" : (warna ?? v.latar);
  return (
    <Ketuk
      onPress={onPress}
      disabled={nonaktif || memuat}
      style={[{ height: 50, borderRadius: 14, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: latar }, v.garis && { borderWidth: 1, borderColor: v.garis }, style]}
    >
      {memuat ? <ActivityIndicator color={v.teks} size="small" /> : ikon}
      <Teks w={600} s={15} c={nonaktif ? W.pudar : v.teks}>
        {children}
      </Teks>
    </Ketuk>
  );
}

/* ---------- Lencana & titik ---------- */

export function Lencana({ latar, warna, children, style }: { latar: string; warna: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: latar }, style]}>
      <Teks w={600} s={12} c={warna} lh={16}>
        {children}
      </Teks>
    </View>
  );
}

export function Titik({ warna, ukuran = 6, style }: { warna: string; ukuran?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width: ukuran, height: ukuran, borderRadius: ukuran / 2, backgroundColor: warna }, style]} />;
}

/* ---------- Tab bergaya pil ---------- */

export function Tab<T extends string>({ nilai, setNilai, pilihan, style }: { nilai: T; setNilai: (v: T) => void; pilihan: { nilai: T; label: string }[]; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ flexGrow: 0 }, style]} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.04)", flexGrow: 1 }}>
        {pilihan.map((p) => {
          const aktif = p.nilai === nilai;
          return (
            <Pressable
              key={p.nilai}
              onPress={() => setNilai(p.nilai)}
              accessibilityRole="tab"
              accessibilityState={{ selected: aktif }}
              style={[{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 }, aktif && { backgroundColor: W.surface, boxShadow: "0px 1px 3px rgba(0,0,0,0.08)" }]}
            >
              <Teks w={600} s={14} c={aktif ? W.ink : W.muted} lh={19}>
                {p.label}
              </Teks>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* ---------- Navigasi ---------- */

/** Buka tujuan: tautan luar (PDF Buku KIA, telepon) lewat sistem, rute aplikasi lewat router. */
export function useBuka() {
  const router = useRouter();
  return (href: string) => {
    if (/^(https?:|tel:|mailto:)/.test(href)) void Linking.openURL(href);
    else router.push(href.replace(/#.*$/, "") as Href);
  };
}

/** Kembali ke layar sebelumnya; bila layar dibuka langsung, pindah ke `cadangan`. */
export function useKembali(cadangan: string) {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace(cadangan as Href));
}

export function TautanBuku({ halaman, label, style }: { halaman: number; label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={() => Linking.openURL(urlHalamanCetak(halaman))} hitSlop={8} style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} accessibilityRole="link">
      <BookOpen size={14} color={W.brand} />
      <Teks w={600} s={12} c={W.brand} lh={16}>
        {label ?? `Buku KIA hlm. ${halaman}`}
      </Teks>
    </Pressable>
  );
}

/* ---------- Layar & kepala ---------- */

/** Latar Ibu: putih bersih dengan semburat biru lembut di bagian atas. */
export function LatarIbu() {
  return <LinearGradient colors={["#d6e7fd", "#eef4fe", W.latar]} locations={[0, 0.45, 1]} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420 }} pointerEvents="none" />;
}

export function Layar({ children, kepala, gulir = true, jarak = 20, tab }: { children: ReactNode; kepala?: ReactNode; gulir?: boolean; jarak?: number; tab?: boolean }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: W.latar }}>
      <LatarIbu />
      <View style={{ height: ins.top }} />
      {kepala}
      {gulir ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: kepala ? 4 : 20, paddingBottom: tab ? 28 : ins.bottom + 28, gap: jarak }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}

/** Judul layar dengan tombol kembali. `kembali` dipakai bila layar dibuka tanpa layar sebelumnya. */
export function Kepala({ judul, sub, kembali, aksi }: { judul: string; sub?: string; kembali?: string; aksi?: ReactNode }) {
  const keKembali = useKembali(kembali ?? "/ibu");
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 8 }}>
      {kembali !== undefined && (
        <Pressable onPress={keKembali} accessibilityLabel="Kembali" hitSlop={6} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(0,0,0,0.06)" : "transparent" })}>
          <ArrowLeft size={24} color={W.ink} />
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0, paddingLeft: kembali !== undefined ? 0 : 8 }}>
        <Teks w={700} s={20} lh={26} numberOfLines={1}>
          {judul}
        </Teks>
        {sub ? (
          <Teks s={12} c={W.muted} lh={16} numberOfLines={1}>
            {sub}
          </Teks>
        ) : null}
      </View>
      {aksi}
    </View>
  );
}

/** Judul layar tab (tanpa tombol kembali). */
export function JudulTab({ judul, sub }: { judul: string; sub?: string }) {
  return (
    <View>
      <Teks w={700} s={20} lh={26}>
        {judul}
      </Teks>
      {sub ? (
        <Teks s={14} c={W.muted}>
          {sub}
        </Teks>
      ) : null}
    </View>
  );
}

export function JudulBagian({ children, aksi, style }: { children: ReactNode; aksi?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }, style]}>
      <Teks w={700} s={17} lh={22} style={{ flexShrink: 1 }}>
        {children}
      </Teks>
      {aksi}
    </View>
  );
}

export function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(230,235,242,0.7)" }}>
      <Teks s={14} c={W.muted}>
        {label}
      </Teks>
      <Teks w={600} s={14} style={{ flexShrink: 1, textAlign: "right" }}>
        {children}
      </Teks>
    </View>
  );
}

export function Pemisah({ kiri = 0 }: { kiri?: number }) {
  return <View style={{ height: 1, backgroundColor: W.line, marginLeft: kiri }} />;
}

export function Kosong({ ikon, judul, teks, aksi }: { ikon?: ReactNode; judul: string; teks?: string; aksi?: ReactNode }) {
  return (
    <Kartu style={{ alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 36 }}>
      {ikon}
      <Teks w={600} s={15} style={{ textAlign: "center" }}>
        {judul}
      </Teks>
      {teks ? (
        <Teks s={14} c={W.muted} style={{ textAlign: "center" }}>
          {teks}
        </Teks>
      ) : null}
      {aksi}
    </Kartu>
  );
}

/** Kotak keterangan abu-abu dengan ikon kecil (privasi, batasan). */
export function Catatan({ ikon, children, latar = "rgba(0,0,0,0.03)", warna = W.muted }: { ikon: ReactNode; children: ReactNode; latar?: string; warna?: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, borderRadius: 16, padding: 16, backgroundColor: latar }}>
      <View style={{ marginTop: 1 }}>{ikon}</View>
      <Teks s={12} c={warna} lh={17} style={{ flex: 1 }}>
        {children}
      </Teks>
    </View>
  );
}

/* ---------- Logo & memuat ---------- */

/** Logo Rangkul "pelukan" (lengkung ibu memeluk bayi), sama dengan LogoMark di web. */
export function LogoMark({ ukuran = 36, style }: { ukuran?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: ukuran, height: ukuran, borderRadius: ukuran * 0.32, backgroundColor: W.brand, alignItems: "center", justifyContent: "center" }, style]}>
      <Svg viewBox="0 0 96 96" width="100%" height="100%" fill="none">
        <Path d="M66 27A27 27 0 1 0 74 60" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        <Circle cx={51} cy={51} r={11} fill="#f48fb8" />
      </Svg>
    </View>
  );
}

export function Memuat() {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.45, { duration: 800 }), -1, true);
  }, [o]);
  const gaya = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: W.latar }} accessibilityLabel="Memuat">
      <Animated.View style={gaya}>
        <LogoMark ukuran={56} />
      </Animated.View>
    </View>
  );
}

/* ---------- Lembar bawah (pengganti dialog di web) ---------- */

export function LembarBawah({ buka, tutup, judul, deskripsi, children, tanpaTutup }: { buka: boolean; tutup: () => void; judul: string; deskripsi?: string; children: ReactNode; tanpaTutup?: boolean }) {
  const ins = useSafeAreaInsets();
  return (
    <Modal visible={buka} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={tanpaTutup ? () => undefined : tutup}>
      {buka && (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(31,42,55,0.42)" }}>
            <Pressable style={{ flex: 1 }} onPress={tanpaTutup ? undefined : tutup} accessibilityLabel="Tutup" />
          </Animated.View>
          <Animated.View entering={SlideInDown.duration(260)} exiting={SlideOutDown.duration(200)} style={{ maxHeight: "92%", backgroundColor: W.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 12, paddingBottom: ins.bottom + 24 }} keyboardShouldPersistTaps="handled">
              <View style={{ alignSelf: "center", width: 48, height: 6, borderRadius: 3, backgroundColor: W.line, marginBottom: 16 }} />
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Teks w={700} s={18} lh={24}>
                    {judul}
                  </Teks>
                  {deskripsi ? (
                    <Teks s={14} c={W.muted} style={{ marginTop: 2 }}>
                      {deskripsi}
                    </Teks>
                  ) : null}
                </View>
                {!tanpaTutup && (
                  <Pressable onPress={tutup} hitSlop={8} accessibilityLabel="Tutup" style={{ padding: 4 }}>
                    <X size={20} color={W.muted} />
                  </Pressable>
                )}
              </View>
              {children}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

/* ---------- Kabar singkat (pengganti toast) ---------- */

export function kabar(teks: string, galat?: boolean) {
  if (Platform.OS === "android") ToastAndroid.show(teks, galat ? ToastAndroid.LONG : ToastAndroid.SHORT);
  else Alert.alert(galat ? "Perlu dicek" : "Berhasil", teks);
}

export const gayaTeksTengah: TextStyle = { textAlign: "center" };
