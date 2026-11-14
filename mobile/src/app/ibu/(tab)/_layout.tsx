import { Tabs } from "expo-router";
import { ClipboardList, Home, LayoutGrid, UserRound, type LucideIcon } from "lucide-react-native";
import { HURUF, W } from "~/tema";

const ikon = (Ikon: LucideIcon) =>
  function IkonTab({ focused, color }: { focused: boolean; color: unknown }) {
    return <Ikon size={24} color={String(color)} strokeWidth={focused ? 2.3 : 1.8} fill={focused ? "rgba(47,138,245,0.15)" : "none"} />;
  };

/** Menu bawah: Beranda, Fitur, Catatan, Profil (sama dengan web). */
export default function LayoutTab() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: W.brand,
        tabBarInactiveTintColor: W.pudar,
        tabBarLabelStyle: { fontFamily: HURUF[600], fontSize: 12 },
        tabBarStyle: { backgroundColor: W.surface, borderTopColor: W.line },
        sceneStyle: { backgroundColor: W.latar },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Beranda", tabBarIcon: ikon(Home) }} />
      <Tabs.Screen name="fitur" options={{ title: "Fitur", tabBarIcon: ikon(LayoutGrid) }} />
      <Tabs.Screen name="catatan" options={{ title: "Catatan", tabBarIcon: ikon(ClipboardList) }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", tabBarIcon: ikon(UserRound) }} />
    </Tabs>
  );
}
