/** Kartu usia kehamilan/nifas dan garis waktu jadwal kunjungan (padanan src/components/tahap.tsx). */
import { ArrowRight, Baby } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import type { NamaGambar } from "@/data/gambar-kia";
import type { Kunjungan } from "@/lib/jadwal";
import type { Tahap } from "@/lib/tahap";
import { W } from "~/tema";
import { Ketuk, Lencana, Teks, gayaKartu, useBuka } from "./dasar";
import { GambarKia } from "./gambar";

const BUAH: { m: number; nama: string }[] = [
  { m: 4, nama: "biji beras" },
  { m: 12, nama: "jeruk nipis" },
  { m: 16, nama: "apel" },
  { m: 24, nama: "jagung" },
  { m: 30, nama: "pepaya" },
  { m: 99, nama: "semangka" },
];

/** Perbandingan ukuran bayi sesuai Buku KIA hlm. 4–19. */
function ukuranBayi(minggu: number) {
  return BUAH.find((b) => minggu <= b.m) ?? BUAH[BUAH.length - 1];
}

/** Gambaran janin dari Buku KIA hlm. 4 (usia 1, 3, 6, dan 9 bulan). */
function gambarJanin(minggu: number): NamaGambar {
  if (minggu <= 6) return "janin-1";
  if (minggu <= 16) return "janin-3";
  if (minggu <= 28) return "janin-6";
  return "janin-9";
}

const PENANDA_HAMIL = [
  { label: "T1", posisi: 0 },
  { label: "T2", posisi: 13 / 40 },
  { label: "T3", posisi: 25 / 40 },
];
const PENANDA_NIFAS = [
  { label: "Lahir", posisi: 0 },
  { label: "Hari 7", posisi: 7 / 42 },
  { label: "Hari 28", posisi: 28 / 42 },
];

const tglPanjang = (d?: Date) => d?.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export function KartuTahap({ t, href }: { t: Tahap; href?: string }) {
  const buka = useBuka();
  const hamil = t.set === "hamil";
  const nifas = t.set === "nifas";
  const buah = hamil ? ukuranBayi(t.ukMinggu ?? 0) : null;
  const sisaHari = hamil && t.hpl ? Math.max(0, 280 - (t.ukHari ?? 0)) : null;
  const penanda = hamil ? PENANDA_HAMIL : nifas ? PENANDA_NIFAS : null;

  return (
    <Ketuk onPress={href ? () => buka(href) : undefined} disabled={!href} skala={0.99} style={[gayaKartu, { padding: 16 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Teks w={600} s={14} c={W.muted}>
          {hamil ? "Usia kehamilan" : nifas ? "Masa nifas" : "Tahap Ibu"}
        </Teks>
        {href && <ArrowRight size={20} color={W.brand} />}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {hamil ? (
            <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6 }}>
              <Teks w={800} s={40} lh={46}>
                {t.ukMinggu}
              </Teks>
              <Teks w={700} s={18}>
                minggu
              </Teks>
              {!!t.ukSisaHari && (
                <Teks w={600} s={16} c={W.muted}>
                  {t.ukSisaHari} hari
                </Teks>
              )}
            </View>
          ) : nifas ? (
            <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6 }}>
              <Teks w={700} s={18}>
                Hari ke-
              </Teks>
              <Teks w={800} s={40} lh={46} style={{ marginLeft: -6 }}>
                {t.hariNifas}
              </Teks>
              <Teks w={600} s={16} c={W.muted}>
                dari 42
              </Teks>
            </View>
          ) : (
            <Teks w={800} s={24} lh={30}>
              {t.label}
            </Teks>
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {hamil && (
              <Lencana latar={W.brandSoft} warna={W.brandInk}>
                Trimester {t.trimester}
              </Lencana>
            )}
            {hamil && t.hpl && (
              <Lencana latar={W.roseSoft} warna={W.rose}>
                HPL {tglPanjang(t.hpl)}
                {t.sumberHpl === "USG T1" ? " (USG)" : ""}
              </Lencana>
            )}
            {nifas && (
              <Lencana latar={W.roseSoft} warna={W.rose}>
                Bayi berumur {t.umurBayiHari} hari
              </Lencana>
            )}
            {!hamil && !nifas && (
              <Teks w={500} s={12} c={W.muted}>
                {t.sublabel}
              </Teks>
            )}
          </View>
        </View>
        {hamil && (
          <View style={{ width: 76, height: 76, borderRadius: 38, overflow: "hidden", backgroundColor: "#fbebee" }}>
            <GambarKia nama={gambarJanin(t.ukMinggu ?? 0)} alt="Gambaran janin di dalam kandungan" style={{ width: 76, height: 76 }} posisi="center" />
          </View>
        )}
        {nifas && (
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: W.roseSoft, alignItems: "center", justifyContent: "center" }}>
            <Baby size={28} color={W.rose} />
          </View>
        )}
      </View>
      {buah && (
        <Teks s={14} c="rgba(31,42,55,0.75)" style={{ marginTop: 12 }}>
          Bayi Ibu kira-kira sebesar{" "}
          <Teks w={600} s={14}>
            {buah.nama}
          </Teks>
          {sisaHari !== null ? `, ${sisaHari ? `${sisaHari} hari lagi menuju HPL` : "sudah masuk HPL"}.` : ""}
        </Teks>
      )}
      {nifas && (
        <Teks s={14} c="rgba(31,42,55,0.75)" style={{ marginTop: 12 }}>
          Masa nifas berlangsung sampai hari ke-42 setelah melahirkan.
        </Teks>
      )}
      {penanda && <GarisKemajuan progres={t.progres} penanda={penanda} akhir={hamil ? "HPL" : "Hari 42"} />}
    </Ketuk>
  );
}

function GarisKemajuan({ progres, penanda, akhir }: { progres: number; penanda: { label: string; posisi: number }[]; akhir: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(progres, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [p, progres]);
  const isi = useAnimatedStyle(() => ({ width: `${Math.round(p.value * 100)}%` }));
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: W.brandSoft }}>
        <Animated.View style={[{ height: "100%", borderRadius: 4, backgroundColor: W.brand }, isi]} />
        {penanda.slice(1).map((x) => (
          <View key={x.label} style={{ position: "absolute", top: 0, bottom: 0, width: 2, left: `${x.posisi * 100}%`, backgroundColor: W.surface }} />
        ))}
      </View>
      <View style={{ height: 18, marginTop: 6 }}>
        {penanda.map((x) => (
          <Teks key={x.label} w={500} s={11} c={W.muted} lh={14} style={{ position: "absolute", left: `${x.posisi * 100}%` }}>
            {x.label}
          </Teks>
        ))}
        <Teks w={500} s={11} c={W.muted} lh={14} style={{ position: "absolute", right: 0 }}>
          {akhir}
        </Teks>
      </View>
    </View>
  );
}

const tgl = (d: Date | string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

/** Jadwal kunjungan sebagai garis waktu: hijau sudah, biru sekarang, kuning terlambat, kosong nanti. */
export function DaftarJadwal({ js, ringkas }: { js: Kunjungan[]; ringkas?: boolean }) {
  const tampil = ringkas ? js.filter((k) => k.status !== "selesai").slice(0, 4) : js;
  return (
    <View style={[gayaKartu, { paddingHorizontal: 16, paddingVertical: 6 }]}>
      {tampil.length > 1 && <View style={{ position: "absolute", left: 22, top: 28, bottom: 28, width: 2, borderRadius: 1, backgroundColor: W.line }} />}
      {tampil.map((k) => (
        <View key={k.kode} style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 10 }}>
          <View style={{ width: 14, height: 20, alignItems: "center", justifyContent: "center" }}>
            <TitikJadwal status={k.status} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Teks w={600} s={15} c={k.status === "selesai" ? "rgba(31,42,55,0.6)" : W.ink} lh={20}>
              {k.nama}
            </Teks>
            <Teks s={12} c={W.muted} lh={16}>
              {k.status === "selesai" && k.tanggalSelesai ? `Selesai ${tgl(k.tanggalSelesai)}` : `${tgl(k.mulai)} – ${tgl(k.selesai)}`} · {k.oleh}
              {!ringkas ? ` · hlm. ${k.halamanCetak}` : ""}
            </Teks>
          </View>
          {k.status === "sekarang" && (
            <Lencana latar={W.brand} warna="#fff" style={{ marginTop: 2 }}>
              Sekarang
            </Lencana>
          )}
          {k.status === "terlambat" && (
            <Teks w={700} s={12} c={W.kuning} style={{ marginTop: 2 }}>
              Terlambat
            </Teks>
          )}
        </View>
      ))}
    </View>
  );
}

function TitikJadwal({ status }: { status: Kunjungan["status"] }) {
  const cincin = { borderWidth: 4, borderColor: W.surface };
  if (status === "selesai") return <View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: W.hijau }, cincin]} />;
  if (status === "terlambat") return <View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: W.kuning }, cincin]} />;
  if (status === "sekarang") return <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: W.brand, borderWidth: 4, borderColor: W.brandSoft }} />;
  return (
    <View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: W.surface }, cincin]}>
      <View style={{ flex: 1, borderRadius: 6, borderWidth: 2, borderColor: "#c3ccd8" }} />
    </View>
  );
}
