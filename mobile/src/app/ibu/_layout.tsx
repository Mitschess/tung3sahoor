import { Redirect, Stack } from "expo-router";
import { usePengguna } from "@/lib/store";
import { W } from "~/tema";

/** Semua layar Ibu hanya untuk akun ibu; akun lain kembali ke layar masuk. */
export default function LayoutIbu() {
  const u = usePengguna();
  if (!u || u.peran !== "ibu") return <Redirect href="/masuk" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.latar }, animation: "slide_from_right" }} />;
}
