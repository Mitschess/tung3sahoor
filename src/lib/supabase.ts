import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase untuk web. Bila NEXT_PUBLIC_SUPABASE_URL dan kuncinya tidak diisi, nilainya null
 * dan Rangkul berjalan dalam mode demo (data contoh di browser saja).
 * Aplikasi Android memakai supabase.native.ts.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const kunci = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && kunci ? createClient(url, kunci) : null;
