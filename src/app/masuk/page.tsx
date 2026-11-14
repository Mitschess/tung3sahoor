"use client";

import { Suspense } from "react";
import { Memuat } from "@/components/ui";
import { MasukAwan } from "./awan";

/**
 * Layar masuk: Ibu dengan nomor HP/email + PIN, kader/bidan/dokter dengan email + kata sandi.
 * Suspense diperlukan karena layar ini membaca URL (?pilih langsung membuka isian masuk).
 */
export default function Masuk() {
  return (
    <Suspense fallback={<Memuat penuh />}>
      <MasukAwan />
    </Suspense>
  );
}
