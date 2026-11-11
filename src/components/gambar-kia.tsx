import Image from "next/image";
import { GAMBAR_KIA, type NamaGambar } from "@/data/gambar-kia";
import { cn } from "@/lib/util";

/** Ilustrasi dari Buku KIA 2024 (sudah WebP kecil di /public/kia, jadi tidak perlu dioptimasi ulang). */
export function GambarKia({ nama, alt, className, preload, sizes = "(max-width: 448px) 92vw, 420px" }: { nama: NamaGambar; alt: string; className?: string; preload?: boolean; sizes?: string }) {
  const [w, h] = GAMBAR_KIA[nama];
  return <Image src={`/kia/${nama}.webp`} width={w} height={h} alt={alt} unoptimized preload={preload} sizes={sizes} className={cn("h-auto w-full", className)} />;
}

/** Rasio lebar/tinggi ilustrasi. */
export function rasio(nama: NamaGambar): number {
  const [w, h] = GAMBAR_KIA[nama];
  return w / h;
}
