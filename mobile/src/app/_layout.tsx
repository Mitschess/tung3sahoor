import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSiap } from "@/lib/hooks";
import { W } from "~/tema";

void SplashScreen.preventAutoHideAsync();

/** Akar aplikasi: tunggu huruf dan data Buku KIA di perangkat siap, baru tampilkan layar. */
export default function Akar() {
  const [huruf] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  const siap = useSiap();
  const tampil = huruf && siap;

  useEffect(() => {
    if (tampil) void SplashScreen.hideAsync();
  }, [tampil]);

  if (!tampil) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: W.latar }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.latar }, animation: "slide_from_right" }} />
    </GestureHandlerRootView>
  );
}
