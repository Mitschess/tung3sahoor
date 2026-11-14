import { useRouter, type Href } from "expo-router";
import { BookOpen, ChevronRight, Siren } from "lucide-react-native";
import { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { MATERI, TEMA, jumlahLembar, materiUntuk, type Materi, type Tema } from "@/data/edukasi";
import type { NamaGambar } from "@/data/gambar-kia";
import type { ImageContentPosition } from "expo-image";
import { urlHalamanCetak } from "@/lib/kamus";
import { useStore } from "@/lib/store";
import { useRingkasanSaya } from "~/hooks";
import { W, WARNA_TEMA } from "~/tema";
import { Kepala, Ketuk, Layar, Memuat, Tab, Teks, gayaKartu } from "~/ui/dasar";
import { GambarKia } from "~/ui/gambar";

const URUTAN_BAB: Tema[] = ["rose", "brand", "ungu", "hijau", "teal"];

/**
 * Cara tiap ilustrasi dipasang di sampul. Gambar tegak (buah, depresi) diperbesar pada bendanya
 * supaya tulisan di bawah gambar tidak ikut; gambar yang sangat lebar digeser ke tokoh utamanya.
 */
const POTONG: Partial<Record<NamaGambar, { skala?: number; geserY?: number; latar?: string; posisi?: ImageContentPosition }>> = {
  "buah-jeruk-nipis": { skala: 1.8, geserY: 0.02, latar: "#fbebee" },
  "buah-jagung": { skala: 1.6, geserY: 0.12, latar: "#fbebee" },
  "buah-semangka": { skala: 1.45, geserY: 0.12, latar: "#fbebee" },
  depresi: { skala: 1.2, geserY: 0.04, latar: "#ece8f0" },
  nifas: { posisi: { left: "41%", top: "50%" } },
  "bayi-baru-lahir": { posisi: { left: "36%", top: "50%" } },
  melahirkan: { posisi: { left: "35%", top: "50%" } },
};

export default function Edukasi() {
  const r = useRingkasanSaya();
  const bacaan = useStore((s) => s.bacaan);
  const [mode, setMode] = useState<"tahap" | "semua">("tahap");
  const router = useRouter();
  if (!r) return <Memuat />;
  const untukTahap = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? MATERI : materiUntuk(r.tahap.kode);
  const lanjut = MATERI.find((m) => (bacaan[m.slug] ?? 0) > 0 && (bacaan[m.slug] ?? 0) < jumlahLembar(m) - 1);

  return (
    <Layar kepala={<Kepala judul="Edukasi" sub="Buku bergambar dari Buku KIA 2024" kembali="/ibu" />}>
      {lanjut && <KartuLanjut m={lanjut} dibaca={bacaan[lanjut.slug] ?? 0} />}

      <Ketuk onPress={() => router.push("/ibu/tanda-bahaya")} skala={0.99} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, backgroundColor: W.merahSoft, padding: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: W.merah, alignItems: "center", justifyContent: "center" }}>
          <Siren size={20} color="#fff" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Teks w={700} s={15} c={W.merah}>
            Tanda bahaya bergambar
          </Teks>
          <Teks s={12} c="rgba(31,42,55,0.7)">
            Kenali dengan melihat gambarnya
          </Teks>
        </View>
        <ChevronRight size={20} color={W.merah} />
      </Ketuk>

      <Tab
        nilai={mode}
        setNilai={setMode}
        pilihan={[
          { nilai: "tahap", label: `Untuk Ibu sekarang (${untukTahap.length})` },
          { nilai: "semua", label: `Semua (${MATERI.length})` },
        ]}
      />

      {mode === "tahap" ? (
        <Rak daftar={untukTahap} bacaan={bacaan} />
      ) : (
        URUTAN_BAB.map((tema) => (
          <View key={tema} style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ height: 16, width: 6, borderRadius: 3, backgroundColor: WARNA_TEMA[tema].pita }} />
              <Teks w={700} s={15}>
                {TEMA[tema].bab}
              </Teks>
            </View>
            <Rak daftar={MATERI.filter((m) => m.tema === tema)} bacaan={bacaan} />
          </View>
        ))
      )}

      <Pressable onPress={() => Linking.openURL(urlHalamanCetak(3))} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, borderWidth: 1, borderStyle: "dashed", borderColor: "#c9d3df", padding: 16 }}>
        <BookOpen size={16} color={W.brand} />
        <Teks w={600} s={14} c={W.brand}>
          Buka seluruh Buku KIA 2024 (PDF)
        </Teks>
      </Pressable>
      <Teks s={11} c={W.muted} style={{ textAlign: "center" }}>
        Ilustrasi dan isi: Buku Kesehatan Ibu dan Anak, Kementerian Kesehatan RI, 2024.
      </Teks>
    </Layar>
  );
}

function Rak({ daftar, bacaan }: { daftar: Materi[]; bacaan: Record<string, number> }) {
  const baris: Materi[][] = [];
  for (let k = 0; k < daftar.length; k += 2) baris.push(daftar.slice(k, k + 2));
  return (
    <View style={{ gap: 24, paddingRight: 6 }}>
      {baris.map((b) => (
        <View key={b[0].slug} style={{ flexDirection: "row", gap: 20 }}>
          {b.map((m) => (
            <SampulBuku key={m.slug} m={m} dibaca={bacaan[m.slug]} />
          ))}
          {b.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

/** Tepi halaman yang terlihat dari samping kanan buku: garis-garis tipis putih dan abu. */
function TepiHalaman() {
  return (
    <View style={{ position: "absolute", top: 6, bottom: 6, right: -5, width: 10, borderTopRightRadius: 4, borderBottomRightRadius: 4, overflow: "hidden", flexDirection: "row", backgroundColor: "#fff", boxShadow: "1px 2px 4px rgba(23,60,110,0.18)" }}>
      {Array.from({ length: 4 }, (_, k) => (
        <View key={k} style={{ width: 1.5, marginLeft: 1, backgroundColor: "#d5dbe4" }} />
      ))}
    </View>
  );
}

/**
 * Buku di rak: sampul tegak dengan panel judul berwarna bab, ilustrasi Buku KIA di bawahnya,
 * punggung buku di kiri, tepi halaman di kanan, dan pita pembatas bila sudah selesai dibaca.
 */
function SampulBuku({ m, dibaca }: { m: Materi; dibaca?: number }) {
  const router = useRouter();
  const warna = WARNA_TEMA[m.tema];
  const total = jumlahLembar(m);
  const selesai = dibaca !== undefined && dibaca >= total - 1;
  const sedang = !selesai && !!dibaca;
  const potong = POTONG[m.sampul];
  return (
    <Ketuk onPress={() => router.push(`/ibu/edukasi/${m.slug}` as Href)} skala={0.97} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`${m.judul}, ${selesai ? "sudah dibaca" : `${total} lembar`}`}>
      <View style={{ aspectRatio: 3 / 4.1 }}>
        <TepiHalaman />
        <View style={{ position: "absolute", inset: 0, overflow: "hidden", borderTopLeftRadius: 5, borderBottomLeftRadius: 5, borderTopRightRadius: 11, borderBottomRightRadius: 11, backgroundColor: warna.pita, boxShadow: "0px 14px 22px -14px rgba(23,60,110,0.6), 0px 1px 3px rgba(23,60,110,0.22)" }}>
          <View style={{ flex: 1, paddingLeft: 22, paddingRight: 12, paddingTop: 14, paddingBottom: 8 }}>
            <Teks w={700} s={9.5} c="rgba(255,255,255,0.78)" style={{ textTransform: "uppercase", letterSpacing: 1.2 }}>
              {m.kategori}
            </Teks>
            <Teks w={800} s={15} lh={18} c="#fff" numberOfLines={3} style={{ marginTop: 4 }}>
              {m.judul}
            </Teks>
          </View>
          <View style={{ height: "55%", overflow: "hidden", backgroundColor: potong?.latar ?? "#fff" }}>
            <GambarKia
              nama={m.sampul}
              fit={potong?.skala ? "contain" : "cover"}
              posisi={potong?.posisi ?? "center"}
              style={{ width: "100%", height: "100%", aspectRatio: undefined, transform: potong?.skala ? [{ scale: potong.skala }, { translateY: `${(potong.geserY ?? 0) * 100}%` }] : undefined }}
            />
          </View>
          {/* Punggung buku: bidang lebih gelap dan garis lipatan. */}
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 11, backgroundColor: "rgba(0,0,0,0.17)" }} />
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 11, width: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
        </View>
        {selesai && (
          <Svg width={18} height={40} style={{ position: "absolute", top: -3, right: 16 }}>
            <Polygon points="0,0 18,0 18,40 9,30 0,40" fill="#f5b50f" />
          </Svg>
        )}
      </View>

      <View style={{ marginTop: 12, paddingLeft: 2 }}>
        {selesai ? (
          <Teks w={600} s={12} c={W.hijau}>
            Sudah dibaca
          </Teks>
        ) : sedang ? (
          <>
            <Teks w={600} s={12}>
              Lembar {dibaca + 1} dari {total}
            </Teks>
            <Kemajuan warna={warna.pita} nilai={(dibaca + 1) / total} style={{ marginTop: 6 }} />
          </>
        ) : (
          <Teks s={12} c={W.muted}>
            {total} lembar · hlm. {m.halaman}
          </Teks>
        )}
      </View>
    </Ketuk>
  );
}

function Kemajuan({ warna, nilai, style }: { warna: string; nilai: number; style?: object }) {
  return (
    <View style={[{ height: 4, borderRadius: 2, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.08)" }, style]}>
      <View style={{ height: "100%", width: `${Math.round(nilai * 100)}%`, borderRadius: 2, backgroundColor: warna }} />
    </View>
  );
}

function KartuLanjut({ m, dibaca }: { m: Materi; dibaca: number }) {
  const router = useRouter();
  const warna = WARNA_TEMA[m.tema];
  const total = jumlahLembar(m);
  return (
    <Ketuk onPress={() => router.push(`/ibu/edukasi/${m.slug}` as Href)} skala={0.99} style={[gayaKartu, { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }]}>
      <View style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", backgroundColor: warna.lembut }}>
        <GambarKia nama={m.sampul} style={{ width: "100%", height: "100%", aspectRatio: undefined }} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Teks w={600} s={12} c={W.muted}>
          Lanjutkan membaca
        </Teks>
        <Teks w={700} s={15} numberOfLines={1}>
          {m.judul}
        </Teks>
        <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Kemajuan warna={warna.pita} nilai={(dibaca + 1) / total} style={{ flex: 1 }} />
          <Teks s={12} c={W.muted}>
            {dibaca + 1}/{total}
          </Teks>
        </View>
      </View>
      <ChevronRight size={20} color={W.muted} />
    </Ketuk>
  );
}
