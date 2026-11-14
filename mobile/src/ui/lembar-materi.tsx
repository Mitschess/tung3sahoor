/**
 * Isi lembar flipbook Edukasi (padanan src/components/lembar-materi.tsx di web).
 * Lembar tidak pernah digulir: gambar menyusut mengikuti ruang yang tersisa di layar.
 */
import { useRouter } from "expo-router";
import { BookOpen, ChevronRight, RotateCcw, Siren, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { Linking, Pressable, View, useWindowDimensions } from "react-native";
import { TEMA, WARNA_TINJA, jumlahLembar, type ItemGambar, type Lembar, type Materi, type Tema } from "@/data/edukasi";
import type { NamaGambar } from "@/data/gambar-kia";
import { urlHalamanCetak } from "@/lib/kamus";
import { W, WARNA_TEMA } from "~/tema";
import { Teks, useBuka } from "./dasar";
import { GambarKia, rasio } from "./gambar";

/** Urutan bab untuk letak penanda tepi (seperti indeks jempol di kamus). */
const URUTAN_BAB: Tema[] = ["rose", "brand", "ungu", "hijau", "teal"];
const GARIS = "#ece4d4";
const ABU = "#a39a88";

/** Lebar isi lembar: layar dikurangi jarak tepi layar (16) dan jarak tepi lembar (24) di kedua sisi. */
function useLebarIsi() {
  return useWindowDimensions().width - 32 - 48;
}

/** Punggung buku di tepi kiri sampul. */
function Punggung() {
  return (
    <>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 16, backgroundColor: "rgba(0,0,0,0.16)" }} />
      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 16, width: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
    </>
  );
}

/** Lembar pertama: sampul berwarna bab, sama seperti buku di rak Edukasi. */
export function LembarSampul({ m }: { m: Materi }) {
  const t = TEMA[m.tema];
  return (
    <View style={{ flex: 1, backgroundColor: WARNA_TEMA[m.tema].pita }}>
      <Punggung />
      <View style={{ flex: 1, paddingLeft: 40, paddingRight: 24, paddingTop: 32, paddingBottom: 20 }}>
        <Teks w={700} s={11} c="rgba(255,255,255,0.78)" style={{ textTransform: "uppercase", letterSpacing: 1.6 }}>
          {t.bab} · {m.kategori}
        </Teks>
        <Teks w={800} s={30} lh={33} c="#fff" style={{ marginTop: 8, letterSpacing: -0.4 }}>
          {m.judul}
        </Teks>
        <Teks s={15} lh={20} c="rgba(255,255,255,0.88)" style={{ marginTop: 10 }}>
          {m.sub}
        </Teks>

        <View style={{ flex: 1, minHeight: 0, marginVertical: 24, alignItems: "center", justifyContent: "center" }}>
          <View style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 20, backgroundColor: "#fff", padding: 8, boxShadow: "0px 20px 34px -18px rgba(0,0,0,0.55)" }}>
            <GambarKia nama={m.sampul} style={{ borderRadius: 13, maxHeight: "100%" }} fit="contain" />
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.25)", paddingTop: 12 }}>
          <View>
            <Teks w={600} s={12} c="#fff">
              Buku KIA 2024
            </Teks>
            <Teks s={12} c="rgba(255,255,255,0.8)">
              Halaman {m.halaman}
            </Teks>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <BookOpen size={16} color="#fff" />
            <Teks w={600} s={12} c="rgba(255,255,255,0.9)">
              {jumlahLembar(m)} lembar
            </Teks>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Kertas halaman isi: putih hangat dengan penanda bab di tepi kanan. */
function Kertas({ tema, children }: { tema: Tema; children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fffdf8" }}>
      <View pointerEvents="none" style={{ position: "absolute", right: 0, top: `${16 + URUTAN_BAB.indexOf(tema) * 13}%`, height: 56, width: 5, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: WARNA_TEMA[tema].pita }} />
      {children}
    </View>
  );
}

/** Kepala halaman seperti buku cetak: nama bab di kiri, keterangan di kanan. */
function KepalaLembar({ m, kanan }: { m: Materi; kanan?: string }) {
  const warna = WARNA_TEMA[m.tema].pita;
  const huruf = { textTransform: "uppercase", letterSpacing: 1.4 } as const;
  return (
    <View style={{ marginHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottomWidth: 1, borderBottomColor: GARIS, paddingTop: 16, paddingBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: warna }} />
        <Teks w={700} s={10.5} c={warna} numberOfLines={1} style={huruf}>
          {TEMA[m.tema].bab}
        </Teks>
      </View>
      {kanan ? (
        <Teks w={700} s={10.5} c={ABU} style={huruf}>
          {kanan}
        </Teks>
      ) : null}
    </View>
  );
}

/** Judul lembar dengan garis aksen berwarna bab. */
function JudulLembar({ judul, tema, besar }: { judul: string; tema: Tema; besar?: boolean }) {
  return (
    <View>
      <Teks w={800} s={besar ? 26 : 21} lh={besar ? 30 : 25} style={{ letterSpacing: -0.3 }}>
        {judul}
      </Teks>
      <View style={{ marginTop: 8, height: 4, width: 40, borderRadius: 2, backgroundColor: WARNA_TEMA[tema].pita }} />
    </View>
  );
}

/** Gambar yang mengisi ruang tersisa di lembar: menyusut di layar pendek, tidak melebihi lebar penuh di layar tinggi. */
function GambarPas({ nama, alt }: { nama: NamaGambar; alt: string }) {
  const lebar = useLebarIsi();
  return (
    <View style={{ marginTop: 14, flex: 1, minHeight: 88, maxHeight: lebar / rasio(nama), alignItems: "center", justifyContent: "center" }}>
      <GambarKia nama={nama} alt={alt} fit="contain" posisi="center" style={{ width: "100%", height: "100%", aspectRatio: undefined, borderRadius: 18 }} />
    </View>
  );
}

function TandaJangan() {
  return (
    <View style={{ position: "absolute", left: 6, top: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: W.merah, alignItems: "center", justifyContent: "center" }}>
      <X size={14} color="#fff" strokeWidth={3} />
    </View>
  );
}

function bagiBaris<T>(isi: T[], kolom: number): T[][] {
  const baris: T[][] = [];
  for (let k = 0; k < isi.length; k += kolom) baris.push(isi.slice(k, k + kolom));
  return baris;
}

function aturKisi(isi: ItemGambar[]) {
  const r = isi.reduce((a, b) => a + rasio(b.gambar), 0) / isi.length;
  const kolom = isi.length > 2 && r < 0.8 ? 3 : 2;
  return { kolom, rTampil: Math.min(Math.max(r, 0.55), 1.7) };
}

/** Kumpulan gambar berlabel yang mengisi ruang tersisa di lembar. */
function KisiPas({ isi, jangan }: { isi: ItemGambar[]; jangan?: boolean }) {
  const lebar = useLebarIsi();
  const { kolom, rTampil } = aturKisi(isi);
  const baris = bagiBaris(isi, kolom);
  const keterangan = kolom === 3 ? 40 : 38;
  const tinggiMaks = baris.length * ((lebar - (kolom - 1) * 10) / kolom / rTampil + keterangan) + (baris.length - 1) * 10;
  return (
    <View style={{ marginTop: 14, flex: 1, minHeight: 150, maxHeight: tinggiMaks, gap: 10 }}>
      {baris.map((b, n) => (
        <View key={n} style={{ flex: 1, flexDirection: "row", gap: 10 }}>
          {b.map((g) => (
            <View key={g.gambar} style={{ flex: 1, overflow: "hidden", borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: GARIS }}>
              <View style={{ flex: 1, minHeight: 0 }}>
                <GambarKia nama={g.gambar} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", aspectRatio: undefined }} posisi="center" />
                {jangan && <TandaJangan />}
              </View>
              <Teks w={500} s={kolom === 3 ? 12 : 13} lh={kolom === 3 ? 15 : 16} numberOfLines={2} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                {g.label}
              </Teks>
            </View>
          ))}
          {Array.from({ length: kolom - b.length }, (_, k) => (
            <View key={`kosong${k}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Lembar isi: kepala halaman, judul, gambar atau kumpulan gambar, teks, poin, lalu nomor halaman. */
export function LembarIsi({ m, l, nomor }: { m: Materi; l: Lembar; nomor: number }) {
  const buka = useBuka();
  const warna = WARNA_TEMA[m.tema];
  const bergambar = !!(l.gambar || l.kisi);
  // Lembar yang hanya berisi tulisan dibuat seperti halaman pembuka bab: huruf besar dan teks lebih lega.
  const hanyaTeks = !bergambar && !l.poin && !l.warnaTinja;
  return (
    <Kertas tema={m.tema}>
      <KepalaLembar m={m} kanan={l.halaman ? `Buku KIA hlm. ${l.halaman}` : undefined} />

      <View style={{ flex: 1, minHeight: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: bergambar ? 0 : 16, justifyContent: bergambar ? "flex-start" : "center" }}>
        {l.nada === "bahaya" && (
          <View style={{ marginBottom: 14, flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 16, backgroundColor: W.merah, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Siren size={20} color="#fff" />
            <Teks w={600} s={14} lh={19} c="#fff" style={{ flex: 1 }}>
              Kalau mengalami, segera ke Puskesmas atau Rumah Sakit.
            </Teks>
          </View>
        )}

        <JudulLembar judul={l.judul} tema={m.tema} besar={hanyaTeks} />

        {l.gambar && <GambarPas nama={l.gambar} alt={l.judul} />}

        {l.teks &&
          (hanyaTeks ? (
            <Teks s={18} lh={29} c="rgba(31,42,55,0.86)" style={{ marginTop: 20 }}>
              <Teks w={800} s={44} lh={44} c={warna.pita}>
                {l.teks.charAt(0)}
              </Teks>
              {l.teks.slice(1)}
            </Teks>
          ) : (
            <Teks s={15.5} lh={24} c="rgba(31,42,55,0.82)" style={{ marginTop: 12 }}>
              {l.teks}
            </Teks>
          ))}
        {l.kisi && <KisiPas isi={l.kisi} jangan={l.nada === "jangan"} />}
        {l.warnaTinja && <KartuTinja />}
        {l.poin && <DaftarPoin poin={l.poin} nada={l.nada} titik={warna.pita} />}
        {l.aksi && (
          <Pressable onPress={() => buka(l.aksi!.href)} style={({ pressed }) => ({ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: warna.lembut, opacity: pressed ? 0.8 : 1 })}>
            <Teks w={600} s={15} c={warna.pita} style={{ flex: 1 }}>
              {l.aksi.label}
            </Teks>
            <ChevronRight size={20} color={warna.pita} />
          </Pressable>
        )}
      </View>

      <NomorHalaman nomor={nomor} />
    </Kertas>
  );
}

/** Nomor halaman di kaki lembar, diapit garis tipis. */
function NomorHalaman({ nomor }: { nomor: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 14 }} accessible={false}>
      <View style={{ height: 1, width: 24, backgroundColor: "#e6dccb" }} />
      <Teks w={600} s={12} c={ABU} style={{ fontVariant: ["tabular-nums"] }}>
        {nomor}
      </Teks>
      <View style={{ height: 1, width: 24, backgroundColor: "#e6dccb" }} />
    </View>
  );
}

/** Kotak kuning bernomor seperti kotak "Hal-hal yang perlu dilakukan" di Buku KIA. */
function KotakBernomor({ poin, warnaNomor, besar }: { poin: string[]; warnaNomor: string; besar?: boolean }) {
  return (
    <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: "#fff6dd", borderWidth: 1, borderColor: "#f1dfaa", paddingHorizontal: 16, paddingVertical: 4 }}>
      {poin.map((p, i) => (
        <View key={p} style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: i < poin.length - 1 ? 1 : 0, borderStyle: "dashed", borderBottomColor: "#ecd79c" }}>
          <Teks w={800} s={besar ? 18 : 15.5} lh={besar ? 21 : 20} c={warnaNomor} style={{ width: 16, textAlign: "right", fontVariant: ["tabular-nums"] }}>
            {i + 1}
          </Teks>
          <Teks s={15.5} lh={20} style={{ flex: 1 }}>
            {p}
          </Teks>
        </View>
      ))}
    </View>
  );
}

/** Daftar poin bergaya Buku KIA: "tips" = kotak kuning bernomor, "jangan"/"bahaya" = garis pendek merah, lainnya = titik berwarna bab. */
function DaftarPoin({ poin, nada, titik }: { poin: string[]; nada?: Lembar["nada"]; titik: string }) {
  if (nada === "tips") return <KotakBernomor poin={poin} warnaNomor="#c27c00" />;
  const merah = nada === "jangan" || nada === "bahaya";
  return (
    <View style={{ marginTop: 12 }}>
      {poin.map((p, i) => (
        <View key={p} style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: "#efe7d8" }}>
          {merah ? <View style={{ marginTop: 9, height: 3, width: 12, borderRadius: 2, backgroundColor: W.merah }} /> : <View style={{ marginTop: 7, height: 7, width: 7, borderRadius: 4, backgroundColor: titik }} />}
          <Teks s={15.5} lh={20} style={{ flex: 1 }}>
            {p}
          </Teks>
        </View>
      ))}
    </View>
  );
}

/** Kumpulan gambar berlabel (dipakai halaman Tanda bahaya). Gambar tegak dibuat 3 kolom. */
export function KisiGambar({ isi, jangan }: { isi: ItemGambar[]; jangan?: boolean }) {
  const { kolom, rTampil } = aturKisi(isi);
  return (
    <View style={{ marginTop: 16, gap: 10 }}>
      {bagiBaris(isi, kolom).map((b, n) => (
        <View key={n} style={{ flexDirection: "row", gap: 10 }}>
          {b.map((g) => (
            <View key={g.gambar} style={{ flex: 1, overflow: "hidden", borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line }}>
              <View style={{ aspectRatio: rTampil, overflow: "hidden" }}>
                <GambarKia nama={g.gambar} style={{ width: "100%", height: "100%", aspectRatio: undefined }} posisi="center" />
                {jangan && <TandaJangan />}
              </View>
              <Teks w={500} s={kolom === 3 ? 12.5 : 13.5} lh={kolom === 3 ? 16 : 17} style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                {g.label}
              </Teks>
            </View>
          ))}
          {Array.from({ length: kolom - b.length }, (_, k) => (
            <View key={`kosong${k}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Kartu warna tinja bayi (Buku KIA hlm. 47). */
export function KartuTinja() {
  return (
    <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.03)", padding: 12 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {WARNA_TINJA.map((w, k) => (
          <View key={w} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 8, backgroundColor: w, borderWidth: k < 3 ? 2 : 1, borderColor: k < 3 ? W.merah : "rgba(0,0,0,0.1)" }} />
            <Teks w={700} s={12} c={k < 3 ? W.merah : W.muted} style={{ marginTop: 4 }}>
              {k + 1}
            </Teks>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
        <View style={{ flex: 3, borderRadius: 8, backgroundColor: W.merahSoft, paddingVertical: 4, alignItems: "center" }}>
          <Teks w={600} s={11} c={W.merah}>
            Pucat: ke dokter
          </Teks>
        </View>
        <View style={{ flex: 4, borderRadius: 8, backgroundColor: W.hijauSoft, paddingVertical: 4, alignItems: "center" }}>
          <Teks w={600} s={11} c={W.hijau}>
            Normal
          </Teks>
        </View>
      </View>
      <Teks s={11} lh={15} c={W.muted} style={{ marginTop: 8 }}>
        Warna di layar bisa sedikit berbeda. Bandingkan juga dengan kartu di Buku KIA hlm. 47.
      </Teks>
    </View>
  );
}

/** Lembar terakhir: ringkasan, materi berikutnya, dan tautan ke halaman asli. */
export function LembarPenutup({ m, berikut, ulang }: { m: Materi; berikut?: Materi; ulang: () => void }) {
  const router = useRouter();
  return (
    <Kertas tema={m.tema}>
      <KepalaLembar m={m} kanan="Selesai dibaca" />
      <View style={{ flex: 1, minHeight: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
        <JudulLembar judul="Yang perlu Ibu ingat" tema={m.tema} />
        <KotakBernomor poin={m.ringkas} warnaNomor={WARNA_TEMA[m.tema].pita} besar />
        <View style={{ marginTop: "auto", paddingTop: 20, gap: 8 }}>
          {/* replace: buku berikutnya menggantikan buku ini, jadi tombol kembali tetap ke halaman sebelum buku pertama. */}
          {berikut && (
            <Pressable onPress={() => router.replace(`/ibu/edukasi/${berikut.slug}`)} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: GARIS, padding: 10, opacity: pressed ? 0.8 : 1 })}>
              <View style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", backgroundColor: WARNA_TEMA[berikut.tema].lembut }}>
                <GambarKia nama={berikut.sampul} style={{ width: "100%", height: "100%", aspectRatio: undefined }} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Teks s={12} c={W.muted}>
                  Materi berikutnya
                </Teks>
                <Teks w={600} s={15} numberOfLines={1}>
                  {berikut.judul}
                </Teks>
              </View>
              <ChevronRight size={20} color={W.muted} />
            </Pressable>
          )}
          <Pressable onPress={() => Linking.openURL(urlHalamanCetak(m.halaman))} style={({ pressed }) => ({ height: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: GARIS, opacity: pressed ? 0.8 : 1 })}>
            <BookOpen size={16} color={W.brand} />
            <Teks w={600} s={15} c={W.brand}>
              Baca halaman aslinya (PDF)
            </Teks>
          </Pressable>
          <Pressable onPress={ulang} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 }}>
            <RotateCcw size={16} color={W.muted} />
            <Teks w={600} s={14} c={W.muted}>
              Ulangi dari awal
            </Teks>
          </Pressable>
        </View>
      </View>
    </Kertas>
  );
}
