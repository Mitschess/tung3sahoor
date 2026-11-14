import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

/** Aplikasi Android (React Native): data disimpan di perangkat dengan AsyncStorage. Berkas ini hanya dibaca Metro. */
export function penyimpanan(): StateStorage {
  return AsyncStorage;
}
