/**
 * Buku yang dibalik seperti kertas sungguhan (padanan src/components/flipbook.tsx di web):
 * halaman terlipat dari sudut kanan bawah, sisi belakang kertas terlihat, dan lipatan mengikuti jari.
 * Semua bingkai dihitung di thread UI (Reanimated), jadi tetap mulus di HP murah.
 *
 * Kemajuan balikan `p`: 0 = lembar `atas` tampil penuh, 1 = sudah terbalik (lembar `bawah` tampil).
 * Bagian lembar `atas` di kiri garis lipatan ditampilkan lewat wadah besar yang diputar sejajar garis lipatan
 * (overflow: hidden), sedangkan lembar di dalamnya diputar balik sehingga isinya tetap tegak.
 */
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { W } from "~/tema";
import { Ketuk, Teks } from "./dasar";

const DURASI = 850;
const LENTUR = Easing.bezier(0.45, 0.05, 0.25, 1);
/** Seberapa miring garis lipatan di tengah balikan (bagian dari lebar halaman). */
const MIRING = 0.14;
const KERTAS = "#fffdf9";
const BENTUK = { borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 22, borderBottomRightRadius: 22 };

interface Balik {
  atas: number;
  bawah: number;
}

export interface FlipbookProps {
  jumlah: number;
  awal?: number;
  /** Isi tiap lembar; `ke(i)` untuk melompat dari dalam lembar (misalnya "Ulangi"). */
  render: (i: number, ke: (i: number) => void) => ReactNode;
  judul: string;
  label?: string;
  warna: string;
  onUbah?: (i: number) => void;
  onTutup: () => void;
}

/** Posisi garis lipatan untuk kemajuan v. */
function lipatan(v: number, w: number, h: number) {
  "worklet";
  const s = Math.sin(Math.PI * v);
  const k = MIRING * w * s;
  const xa = w * (1 - v) + k; // garis lipatan di tepi atas
  return { s, xa, phi: Math.atan2(2 * k, h), L: 2 * (w + h) };
}

export function Flipbook({ jumlah, awal = 0, render, judul, label, warna, onUbah, onTutup }: FlipbookProps) {
  const ins = useSafeAreaInsets();
  const mula = Math.min(Math.max(awal, 0), jumlah - 1);
  const [i, setI] = useState(mula);
  const [balik, setBalik] = useState<Balik | null>(null);
  const kurangiGerak = useReducedMotion();

  const p = useSharedValue(0);
  const aktif = useSharedValue(0);
  const w = useSharedValue(1);
  const h = useSharedValue(1);
  const iSV = useSharedValue(mula);
  const seret = useSharedValue(0);
  const siapSeret = useSharedValue(0);
  const [ukuran, setUkuran] = useState({ w: 0, h: 0 });
  const iRef = useRef(mula);
  const balikRef = useRef<Balik | null>(null);

  useEffect(() => {
    onUbah?.(i);
  }, [i, onUbah]);

  const pasang = useCallback(
    (b: Balik | null) => {
      balikRef.current = b;
      setBalik(b);
    },
    [],
  );

  const selesai = useCallback(
    (target: number) => {
      const b = balikRef.current;
      if (!b) return;
      const baru = target === 1 ? b.bawah : b.atas;
      aktif.set(0);
      iRef.current = baru;
      iSV.set(baru);
      pasang(null);
      setI(baru);
    },
    [aktif, iSV, pasang],
  );

  const jalankan = useCallback(
    (target: 0 | 1, durasi: number) => {
      p.set(
        withTiming(target, { duration: durasi, easing: LENTUR }, (beres) => {
          if (beres) scheduleOnRN(selesai, target);
        }),
      );
    },
    [p, selesai],
  );

  const ke = useCallback(
    (tujuan: number) => {
      const t = Math.min(Math.max(tujuan, 0), jumlah - 1);
      const b = balikRef.current;
      if (b) {
        if (seret.value !== 0) return;
        if (t === b.bawah) jalankan(1, DURASI * (1 - p.value) + 150);
        else if (t === b.atas) jalankan(0, DURASI * p.value + 150);
        return;
      }
      const kini = iRef.current;
      if (t === kini) return;
      if (kurangiGerak || !ukuran.w) {
        iRef.current = t;
        iSV.set(t);
        setI(t);
        return;
      }
      const maju = t > kini;
      p.set(maju ? 0 : 1);
      aktif.set(1);
      pasang({ atas: maju ? kini : t, bawah: maju ? t : kini });
      jalankan(maju ? 1 : 0, DURASI);
    },
    [aktif, iSV, jalankan, jumlah, kurangiGerak, p, pasang, seret, ukuran.w],
  );

  const mulaiSeret = useCallback(
    (arah: number) => {
      const kini = iRef.current;
      pasang({ atas: arah === 1 ? kini : kini - 1, bawah: arah === 1 ? kini + 1 : kini });
    },
    [pasang],
  );

  // Saat buku baru dibuka di sampul, sudut halaman terangkat sebentar sebagai petunjuk.
  useEffect(() => {
    if (kurangiGerak || mula !== 0 || jumlah < 2 || !ukuran.w) return;
    const id = setTimeout(() => {
      if (balikRef.current || iRef.current !== 0) return;
      p.set(0);
      aktif.set(1);
      pasang({ atas: 0, bawah: 1 });
      p.set(
        withSequence(
          withTiming(0.17, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) }, (beres) => {
            if (beres) scheduleOnRN(selesai, 0);
          }),
        ),
      );
    }, 700);
    return () => clearTimeout(id);
  }, [aktif, jumlah, kurangiGerak, mula, p, pasang, selesai, ukuran.w]);

  useEffect(() => () => cancelAnimation(p), [p]);

  const geser = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-24, 24],
    enabled: !kurangiGerak,
    // Event onActivate di GH v3 belum membawa translasi (selalu 0), jadi arah tarikan
    // baru ditentukan pada pembaruan pertama yang sudah bergeser.
    onActivate: () => {
      "worklet";
      if (aktif.value === 0) siapSeret.set(1); // abaikan tarikan saat halaman masih beranimasi
    },
    onUpdate: (e) => {
      "worklet";
      if (seret.value === 0) {
        if (siapSeret.value === 0 || e.translationX === 0) return;
        siapSeret.set(0);
        const arah = e.translationX < 0 ? 1 : -1;
        const kini = iSV.value;
        if (arah === 1 ? kini >= jumlah - 1 : kini <= 0) return;
        seret.set(arah);
        p.set(arah === 1 ? 0 : 1);
        aktif.set(1);
        scheduleOnRN(mulaiSeret, arah);
      }
      const q = Math.min(Math.max(((seret.value === 1 ? -1 : 1) * e.translationX) / (w.value * 0.9), 0), 1);
      p.set(seret.value === 1 ? q : 1 - q);
    },
    onDeactivate: (e) => {
      "worklet";
      siapSeret.set(0);
      const arah = seret.value;
      if (arah === 0) return;
      seret.set(0);
      const v = p.value;
      const target = arah === 1 ? (v > 0.3 || e.velocityX < -400 ? 1 : 0) : v < 0.7 || e.velocityX > 400 ? 0 : 1;
      p.set(
        withTiming(target, { duration: 200 + 400 * Math.abs(target - v), easing: LENTUR }, (beres) => {
          if (beres) scheduleOnRN(selesai, target);
        }),
      );
    },
  });

  const ukur = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    w.set(width);
    h.set(height);
    setUkuran({ w: width, h: height });
  };

  const terakhir = i === jumlah - 1;
  const tampil = balik ? [balik.bawah, balik.atas] : [i];

  return (
    <View style={{ flex: 1, paddingTop: ins.top }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, paddingTop: 8 }}>
        <Pressable onPress={onTutup} accessibilityLabel="Tutup buku" style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(0,0,0,0.06)" : "transparent" })}>
          <ArrowLeft size={24} color={W.ink} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          {label ? (
            <Teks w={700} s={11} c={warna} lh={14} numberOfLines={1} style={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
              {label}
            </Teks>
          ) : null}
          <Teks w={700} s={17} lh={22} numberOfLines={1}>
            {judul}
          </Teks>
        </View>
        <View style={{ marginRight: 8, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: W.surface, boxShadow: "0px 2px 10px -4px rgba(23,60,110,0.2)" }} accessibilityLiveRegion="polite">
          <Teks w={600} s={14} style={{ fontVariant: ["tabular-nums"] }}>
            {i + 1}/{jumlah}
          </Teks>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 4, paddingHorizontal: 16, paddingTop: 12 }}>
        {jumlah <= 16 ? (
          Array.from({ length: jumlah }, (_, k) => <View key={k} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: k <= i ? warna : "rgba(0,0,0,0.08)" }} />)
        ) : (
          <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <View style={{ width: `${((i + 1) / jumlah) * 100}%`, height: "100%", backgroundColor: warna }} />
          </View>
        )}
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <GestureDetector gesture={geser}>
          <View style={{ flex: 1 }} onLayout={ukur}>
            {/* Tebal buku: lembar-lembar berikutnya mengintip di tepi kanan bawah. */}
            {!terakhir && (
              <>
                <View style={[BENTUK, { position: "absolute", top: 7, left: 7, right: -7, bottom: -7, backgroundColor: "#ebe8e1" }]} />
                <View style={[BENTUK, { position: "absolute", top: 3.5, left: 3.5, right: -3.5, bottom: -3.5, backgroundColor: "#f6f4ef" }]} />
              </>
            )}
            <View style={[BENTUK, { flex: 1, overflow: "hidden", backgroundColor: KERTAS, boxShadow: "0px 18px 40px -20px rgba(23,60,110,0.45), 0px 0px 0px 1px rgba(23,60,110,0.05)" }]}>
              {ukuran.w > 0 &&
                tampil.map((k) => (
                  <Halaman key={k} atas={!!balik && k === balik.atas} p={p} w={ukuran.w} h={ukuran.h} sibuk={!!balik}>
                    {/* `ke` hanya membaca ref saat diketuk, bukan saat render. */}
                    {/* eslint-disable-next-line react-hooks/refs */}
                    {render(k, ke)}
                  </Halaman>
                ))}
              {ukuran.w > 0 && <Lipatan p={p} aktif={aktif} w={ukuran.w} h={ukuran.h} />}
            </View>
          </View>
        </GestureDetector>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: Math.max(16, ins.bottom + 8) }}>
        <Ketuk onPress={() => ke(iRef.current - 1)} disabled={i === 0} accessibilityLabel="Lembar sebelumnya" style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: W.surface, opacity: i === 0 ? 0.4 : 1, boxShadow: "0px 2px 14px -6px rgba(23,60,110,0.2)" }}>
          <ChevronLeft size={24} color={W.ink} />
        </Ketuk>
        <Teks s={12} c={W.muted} lh={15} style={{ flex: 1, textAlign: "center" }}>
          {i === 0 ? "Tarik halaman ke kiri atau tekan Buka" : terakhir ? "Sudah selesai dibaca" : "Tarik halaman untuk membalik"}
        </Teks>
        <Ketuk
          onPress={() => (terakhir && !balik ? onTutup() : ke(iRef.current + 1))}
          style={{ height: 56, borderRadius: 28, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: warna, boxShadow: "0px 10px 22px -12px rgba(0,0,0,0.5)" }}
        >
          <Teks w={600} s={17} c="#fff">
            {terakhir ? "Selesai" : i === 0 ? "Buka" : "Lanjut"}
          </Teks>
          {!terakhir && <ChevronRight size={20} color="#fff" />}
        </Ketuk>
      </View>
    </View>
  );
}

/** Satu lembar. Lembar `atas` hanya tampil di kiri garis lipatan; lembar lain tampil penuh. */
function Halaman({ atas, p, w, h, sibuk, children }: { atas: boolean; p: SharedValue<number>; w: number; h: number; sibuk: boolean; children: ReactNode }) {
  const L = 2 * (w + h);
  const wadah = useAnimatedStyle(() => {
    const { xa, phi } = lipatan(atas ? p.value : 0, w, h);
    return { transform: [{ translateX: xa }, { translateX: L / 2 }, { rotate: `${phi}rad` }, { translateX: -L / 2 }] };
  });
  const isi = useAnimatedStyle(() => {
    const { xa, phi } = lipatan(atas ? p.value : 0, w, h);
    return { transform: [{ translateX: -w / 2 }, { translateY: -h / 2 }, { rotate: `${-phi}rad` }, { translateX: w / 2 - xa }, { translateY: h / 2 }] };
  });
  return (
    <Animated.View pointerEvents={sibuk ? "none" : "auto"} style={[{ position: "absolute", left: -L, top: -L / 2, width: L, height: L, overflow: "hidden", zIndex: atas ? 3 : 1 }, wadah]}>
      <Animated.View style={[{ position: "absolute", left: L, top: L / 2, width: w, height: h, backgroundColor: KERTAS, overflow: "hidden" }, isi]}>
        {children}
        {/* Lipatan tengah buku. */}
        <LinearGradient colors={["rgba(0,0,0,0.06)", "rgba(0,0,0,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20 }} pointerEvents="none" />
      </Animated.View>
    </Animated.View>
  );
}

/** Bayangan lipatan di lembar bawah dan sisi belakang kertas yang sedang terlipat. */
function Lipatan({ p, aktif, w, h }: { p: SharedValue<number>; aktif: SharedValue<number>; w: number; h: number }) {
  const L = 2 * (w + h);
  const B = 114;
  const tampak = (v: number) => {
    "worklet";
    return aktif.value === 1 && v > 0.002 && v < 0.998;
  };
  const bayang = useAnimatedStyle(() => {
    const v = p.value;
    const { s, xa, phi } = lipatan(v, w, h);
    return {
      opacity: tampak(v) ? Math.min(1, 0.25 + s) : 0,
      transform: [{ translateX: xa }, { translateX: -B / 2 }, { rotate: `${phi}rad` }, { scaleX: (24 + 90 * s) / B }, { translateX: B / 2 }],
    };
  });
  const wadah = useAnimatedStyle(() => {
    const v = p.value;
    const { xa, phi } = lipatan(v, w, h);
    return { opacity: tampak(v) ? 1 : 0, transform: [{ translateX: xa }, { translateX: L / 2 }, { rotate: `${phi}rad` }, { translateX: -L / 2 }] };
  });
  // Cermin lembar terhadap garis lipatan: bagian kanan lipatan tampil terbalik di sebelah kirinya.
  const cermin = useAnimatedStyle(() => {
    const { xa, phi } = lipatan(p.value, w, h);
    return { transform: [{ translateX: -w / 2 }, { translateY: -h / 2 }, { scaleX: -1 }, { rotate: `${-phi}rad` }, { translateX: w / 2 - xa }, { translateY: h / 2 }] };
  });
  return (
    <>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: -L / 2, width: B, height: L, zIndex: 2 }, bayang]}>
        <LinearGradient colors={["rgba(15,30,60,0.32)", "rgba(15,30,60,0.08)", "rgba(15,30,60,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: -L, top: -L / 2, width: L, height: L, overflow: "hidden", zIndex: 4 }, wadah]}>
        <Animated.View style={[{ position: "absolute", left: L, top: L / 2, width: w, height: h }, cermin]}>
          <LinearGradient colors={["#efebe3", "#fffdf9", "#f8f5ef", "#e8e3d9"]} locations={[0, 0.22, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
        </Animated.View>
        {/* Bayangan halus di sepanjang lipatan, pada sisi belakang kertas. */}
        <LinearGradient colors={["rgba(60,45,20,0)", "rgba(60,45,20,0.05)", "rgba(60,45,20,0.18)"]} locations={[0, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 38 }} />
      </Animated.View>
    </>
  );
}
