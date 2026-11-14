import { Redirect } from "expo-router";
import { usePengguna } from "@/lib/store";

/** Layar awal: Ibu yang sudah masuk langsung ke Beranda. */
export default function Awal() {
  const u = usePengguna();
  return <Redirect href={u?.peran === "ibu" ? "/ibu" : "/masuk"} />;
}
