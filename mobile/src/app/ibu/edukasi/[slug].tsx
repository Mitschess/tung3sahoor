import { useLocalSearchParams } from "expo-router";
import { BookX } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { MATERI, TEMA, cariMateri, jumlahLembar, materiUntuk, type Materi } from "@/data/edukasi";
import { useStore } from "@/lib/store";
import { useRingkasanSaya } from "~/hooks";
import { W, WARNA_TEMA } from "~/tema";
import { Kosong, Memuat, Tombol, useKembali } from "~/ui/dasar";
import { Flipbook } from "~/ui/flipbook";
import { LembarIsi, LembarPenutup, LembarSampul } from "~/ui/lembar-materi";

export default function BacaMateri() {
  const { slug = "" } = useLocalSearchParams<{ slug: string }>();
  const r = useRingkasanSaya();
  const kembali = useKembali("/ibu/edukasi");
  const m = cariMateri(slug);

  if (!r) return <Memuat />;
  if (!m)
    return (
      <View style={{ flex: 1, backgroundColor: W.latar, paddingHorizontal: 16, paddingTop: 96 }}>
        <Kosong ikon={<BookX size={32} color={W.muted} />} judul="Materi tidak ditemukan" aksi={<Tombol onPress={kembali}>Kembali ke Edukasi</Tombol>} />
      </View>
    );

  const urutan = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? MATERI : materiUntuk(r.tahap.kode);
  const posisi = urutan.findIndex((x) => x.slug === m.slug);
  const berikut = posisi >= 0 ? urutan[posisi + 1] : MATERI[MATERI.findIndex((x) => x.slug === m.slug) + 1];
  return <Buku key={m.slug} m={m} berikut={berikut} />;
}

function Buku({ m, berikut }: { m: Materi; berikut?: Materi }) {
  const tutup = useKembali("/ibu/edukasi");
  const catat = useStore((s) => s.catatBacaan);
  const total = jumlahLembar(m);
  // Lanjutkan dari lembar terjauh yang sudah dibaca, kecuali materi sudah selesai.
  const [awal] = useState(() => {
    const sudah = useStore.getState().bacaan[m.slug] ?? 0;
    return sudah >= total - 1 ? 0 : sudah;
  });
  const onUbah = useCallback((i: number) => catat(m.slug, i), [catat, m.slug]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f0ea" }}>
      <Flipbook
        jumlah={total}
        awal={awal}
        judul={m.judul}
        label={`${TEMA[m.tema].bab} · Buku KIA`}
        warna={WARNA_TEMA[m.tema].pita}
        onUbah={onUbah}
        onTutup={tutup}
        render={(i, ke) => (i === 0 ? <LembarSampul m={m} /> : i === total - 1 ? <LembarPenutup m={m} berikut={berikut} ulang={() => ke(0)} /> : <LembarIsi m={m} l={m.lembar[i - 1]} nomor={i + 1} />)}
      />
    </View>
  );
}
