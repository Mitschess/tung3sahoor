/** Kompres foto di perangkat sebelum dikirim (sisi terpanjang maks `maks` px, JPEG). */
export async function kompres(file: File | Blob, maks = 1600, kualitas = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const skala = Math.min(1, maks / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * skala);
  const h = Math.round(bitmap.height * skala);
  const kanvas = document.createElement("canvas");
  kanvas.width = w;
  kanvas.height = h;
  const ctx = kanvas.getContext("2d");
  if (!ctx) throw new Error("Peramban tidak mendukung kanvas.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return kanvas.toDataURL("image/jpeg", kualitas);
}

/** Ukuran data URL dalam kB (perkiraan). */
export function ukuranKb(dataUrl: string) {
  return Math.round(((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75) / 1024);
}
