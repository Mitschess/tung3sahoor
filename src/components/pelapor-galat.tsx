"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { aturPelaporGalat } from "@/lib/store";

/** Tampilkan galat penyimpanan ke Supabase (yang terjadi di latar belakang) sebagai toast. */
export function PelaporGalat() {
  useEffect(() => aturPelaporGalat((m) => toast.error(m)), []);
  return null;
}
