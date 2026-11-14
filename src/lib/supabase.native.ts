import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

/**
 * Klien Supabase untuk aplikasi Android (berkas ini hanya dibaca Metro). Sesi masuk disimpan di HP
 * dengan AsyncStorage. Isi EXPO_PUBLIC_SUPABASE_URL dan kuncinya di mobile/.env; bila kosong,
 * aplikasi berjalan dalam mode demo.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const kunci = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && kunci
    ? createClient(url, kunci, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;

// Token hanya diperbarui selama aplikasi tampil di layar (anjuran Supabase untuk React Native).
if (supabase) {
  const klien = supabase;
  AppState.addEventListener("change", (s) => {
    if (s === "active") void klien.auth.startAutoRefresh();
    else void klien.auth.stopAutoRefresh();
  });
}
