/** Ilustrasi Buku KIA 2024 (WebP dari ../public/kia, dipaketkan ke dalam aplikasi). */
import { Image, type ImageContentFit, type ImageContentPosition } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";
import { GAMBAR_KIA, type NamaGambar } from "@/data/gambar-kia";
import { SUMBER_GAMBAR } from "./sumber-gambar";

export function rasio(nama: NamaGambar): number {
  const [w, h] = GAMBAR_KIA[nama];
  return w / h;
}

/** Tanpa `style.height`, tinggi gambar mengikuti rasio aslinya. */
export function GambarKia({ nama, style, fit = "cover", posisi = "top", alt }: { nama: NamaGambar; style?: StyleProp<ImageStyle>; fit?: ImageContentFit; posisi?: ImageContentPosition; alt?: string }) {
  return (
    <Image
      source={SUMBER_GAMBAR[nama]}
      style={[{ width: "100%", aspectRatio: rasio(nama) }, style]}
      contentFit={fit}
      contentPosition={posisi}
      transition={0}
      accessibilityLabel={alt}
      accessible={!!alt}
    />
  );
}
