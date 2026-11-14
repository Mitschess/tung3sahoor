import { useLocalSearchParams } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { ScrollView, View, type ScrollViewInstance } from "react-native";
import type { NamaGambar } from "@/data/gambar-kia";
import { cetakKePdf, kamus, levelDariPeringatanYa } from "@/lib/kamus";
import { useStore } from "@/lib/store";
import type { Catatan, Data } from "@/lib/types";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { Kepala, Ketuk, Layar, Memuat, Tab, TautanBuku, Teks, Tombol, gayaKartu, kabar } from "~/ui/dasar";
import { GambarKia } from "~/ui/gambar";
import { Ilustrasi } from "~/ui/ilustrasi";

type Lembar = "hamil" | "nifas" | "bayi";
const KONFIG: Record<Lembar, { tabel: string; kunci: "minggu_kehamilan" | "hari_ke"; satuan: string; layanan: string[]; hlm: number; maks: number }> = {
  hamil: { tabel: "pemantauan_hamil", kunci: "minggu_kehamilan", satuan: "Minggu", layanan: ["periksa_kehamilan", "kelas_ibu_hamil"], hlm: 10, maks: 42 },
  nifas: { tabel: "pemantauan_nifas", kunci: "hari_ke", satuan: "Hari", layanan: ["periksa_nifas", "vit_a", "ttd", "gizi_cukup"], hlm: 28, maks: 42 },
  bayi: { tabel: "pemantauan_bayi", kunci: "hari_ke", satuan: "Hari", layanan: [], hlm: 42, maks: 28 },
};

/** Gambar tiap kolom, dipotong dari lembar pemantauan Buku KIA (hlm. 10–11, 28–31, 42–45). */
const GAMBAR: Record<string, NamaGambar> = {
  periksa_kehamilan: "ph-periksa",
  kelas_ibu_hamil: "ph-kelas",
  demam_2hari: "ph-demam",
  pusing_berat: "ph-pusing",
  sulit_tidur_cemas: "ph-sulit-tidur",
  risiko_tb: "ph-tb",
  gerak_bayi_kurang: "ph-gerak",
  nyeri_perut_hebat: "ph-nyeri-perut",
  sakit_kencing: "ph-kencing",
  diare_berulang: "ph-diare",
  periksa_nifas: "pn-periksa",
  vit_a: "pn-vit-a",
  ttd: "pn-ttd",
  gizi_cukup: "pn-gizi",
  masalah_jiwa: "pn-jiwa",
  demam_38: "pn-demam",
  sakit_kepala: "pn-sakit-kepala",
  pandangan_kabur: "pn-pandangan",
  nyeri_ulu_hati: "pn-ulu-hati",
  jantung_berdebar: "pn-berdebar",
  napas_pendek: "pn-napas",
  payudara_bermasalah: "pn-payudara",
  gangguan_bak: "pn-bak",
  kelamin_bermasalah: "pn-kelamin",
  darah_nifas_berbau: "pn-darah-berbau",
  perdarahan_banyak: "pn-perdarahan",
  keputihan: "pn-keputihan",
  sesak_napas: "pb-sesak",
  lemah: "pb-lemah",
  kulit_biru: "pb-kulit-biru",
  hisapan_lemah: "pb-hisapan",
  kejang: "pb-kejang",
  suhu_abnormal: "pb-suhu",
  bab_bermasalah: "pb-bab",
  kencing_sedikit: "pb-kencing",
  tali_pusat_infeksi: "pb-tali-pusat",
  mata_bernanah: "pb-mata",
  kulit_bintil: "pb-bintil",
  belum_hb0_bcg: "pb-imunisasi",
};
const gambarKolom = (lembar: Lembar, kolom: string): NamaGambar | undefined => (kolom === "cairan_jalan_lahir" ? (lembar === "hamil" ? "ph-cairan" : "pn-cairan") : GAMBAR[kolom]);

export default function Pantau() {
  const r = useRingkasanSaya();
  const { lembar: awal } = useLocalSearchParams<{ lembar?: Lembar }>();
  const [lembar, setLembar] = useState<Lembar>(awal ?? "hamil");
  if (!r) return <Memuat />;
  const set = r.tahap.set;
  const aktif: Lembar = set === "hamil" ? "hamil" : lembar === "hamil" ? "nifas" : lembar;
  const sekarang = set === "hamil" ? (r.tahap.ukMinggu ?? 1) : aktif === "bayi" ? Math.max(1, r.tahap.umurBayiHari ?? 1) : (r.tahap.hariNifas ?? 1);

  return (
    <Layar kepala={<Kepala judul="Pantau" sub="Diisi oleh ibu · sesuai lembar pemantauan Buku KIA" kembali="/ibu" />}>
      {set === "nifas" && (
        <Tab
          nilai={aktif}
          setNilai={setLembar}
          pilihan={[
            { nilai: "nifas", label: "Ibu nifas" },
            { nilai: "bayi", label: "Bayi 0–28 hari" },
          ]}
        />
      )}
      {set === "belum" || set === "tumbuh" ? (
        <Teks c={W.muted}>Lembar pemantauan tersedia saat hamil dan nifas.</Teks>
      ) : (
        <FormLembar key={`${aktif}-${sekarang}`} lembar={aktif} ibuId={r.ibu.id} sekarang={Math.min(sekarang, KONFIG[aktif].maks)} catatan={r.cari(KONFIG[aktif].tabel)} />
      )}
    </Layar>
  );
}

function FormLembar({ lembar, ibuId, sekarang, catatan }: { lembar: Lembar; ibuId: string; sekarang: number; catatan: Catatan[] }) {
  const k = KONFIG[lembar];
  const def = kamus.tabel[k.tabel];
  const simpan = useStore((s) => s.simpan);
  const [periode, setPeriode] = useState(sekarang);
  const [nilai, setNilai] = useState<Data>(() => catatan.find((c) => Number(c.data[k.kunci]) === sekarang)?.data ?? {});
  const [hasil, setHasil] = useState<null | { merah: string[]; kuning: string[] }>(null);
  const gulirPeriode = useRef<ScrollViewInstance>(null);

  const gejala = useMemo(() => Object.entries(def.kolom).filter(([kk, kol]) => kol.tipe === "boolean" && !k.layanan.includes(kk)), [def, k.layanan]);
  const layanan = k.layanan.map((kk) => [kk, def.kolom[kk]] as const);
  const levelGejala = (kk: string) => (kk === "gerak_bayi_kurang" && periode < 24 ? "kuning" : levelDariPeringatanYa(def.kolom[kk]) === "merah" ? "merah" : "kuning");

  const pilihPeriode = (p: number) => {
    setPeriode(p);
    setNilai(catatan.find((c) => Number(c.data[k.kunci]) === p)?.data ?? {});
    setHasil(null);
  };

  const kirim = () => {
    try {
      const data: Data = { ...nilai, [k.kunci]: periode };
      const lama = catatan.find((c) => Number(c.data[k.kunci]) === periode);
      simpan(k.tabel, ibuId, data, lama ? { catatanId: lama.id } : {});
      const merah: string[] = [];
      const kuning: string[] = [];
      for (const [kk, kol] of gejala) {
        if (data[kk] !== true) continue;
        (levelGejala(kk) === "merah" ? merah : kuning).push(kol.label);
      }
      setHasil({ merah, kuning });
      kabar("Pemantauan tersimpan");
    } catch (e) {
      kabar((e as Error).message, true);
    }
  };

  const daftarPeriode = Array.from({ length: Math.min(sekarang, k.maks) }, (_, i) => i + 1).slice(-8);

  return (
    <View style={{ gap: 20 }}>
      <ScrollView ref={gulirPeriode} horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {daftarPeriode.map((p) => {
          const terisi = catatan.some((c) => Number(c.data[k.kunci]) === p);
          const aktif = p === periode;
          return (
            <Ketuk
              key={p}
              onPress={() => pilihPeriode(p)}
              // Periode yang dipilih (minggu/hari ini) langsung terlihat, tidak tersembunyi di kanan.
              onLayout={aktif ? (e) => gulirPeriode.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 80), animated: false }) : undefined}
              style={{ minWidth: 56, alignItems: "center", borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderColor: aktif ? W.brand : W.line, backgroundColor: aktif ? W.brand : W.surface }}
            >
              <Teks w={600} s={10} c={aktif ? "rgba(255,255,255,0.85)" : W.muted} lh={13} style={{ textTransform: "uppercase" }}>
                {k.satuan}
              </Teks>
              <Teks w={800} s={18} c={aktif ? "#fff" : W.muted} lh={22}>
                {p}
              </Teks>
              <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: 3, backgroundColor: terisi ? (aktif ? "#fff" : W.hijau) : "transparent" }} />
            </Ketuk>
          );
        })}
      </ScrollView>

      {layanan.length > 0 && (
        <View>
          <Teks w={700} s={17}>
            Pelayanan kesehatan
          </Teks>
          <Teks s={14} c={W.muted} style={{ marginTop: 2 }}>
            Ketuk yang sudah Ibu dapat {lembar === "hamil" ? "minggu" : "hari"} ini.
          </Teks>
          <Kisi>
            {layanan.map(([kk, kol]) => (
              <KartuGambar key={kk} label={kol.label} gambar={gambarKolom(lembar, kk)} nilai={nilai[kk] === true} ubah={(v) => setNilai((s) => ({ ...s, [kk]: v }))} />
            ))}
          </Kisi>
        </View>
      )}

      <View>
        <Teks w={700} s={17}>
          {lembar === "bayi" ? "Kondisi bayi hari ini" : lembar === "nifas" ? "Kondisi Ibu hari ini" : "Kondisi Ibu minggu ini"}
        </Teks>
        <Teks s={14} c={W.muted} style={{ marginTop: 2 }}>
          Ketuk gambar yang {lembar === "bayi" ? "terjadi pada bayi" : "Ibu alami"}. Bila ada, segera periksa ke Puskesmas.
        </Teks>
        <Kisi>
          {gejala.map(([kk, kol]) => (
            <KartuGambar key={kk} label={kol.label} gambar={gambarKolom(lembar, kk)} nilai={nilai[kk] === true} ubah={(v) => setNilai((s) => ({ ...s, [kk]: v }))} level={levelGejala(kk)} />
          ))}
        </Kisi>
      </View>

      {hasil && <KotakHasil hasil={hasil} lembar={lembar} />}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <TautanBuku halaman={k.hlm} label={`Lembar asli di Buku KIA hlm. ${k.hlm}–${k.hlm + 3}`} style={{ flexShrink: 1 }} />
        <Teks s={11} c={W.muted}>
          PDF hlm. {cetakKePdf(k.hlm)}
        </Teks>
      </View>
      <Tombol onPress={kirim}>
        Simpan {k.satuan.toLowerCase()} ke-{periode}
      </Tombol>

      <Riwayat lembar={lembar} catatan={catatan} gejala={gejala.map(([kk, kol]) => [kk, kol.label] as const)} />
    </View>
  );
}

function Kisi({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 }}>{children}</View>;
}

function KotakHasil({ hasil, lembar }: { hasil: { merah: string[]; kuning: string[] }; lembar: Lembar }) {
  const merah = hasil.merah.length > 0;
  const ada = merah || hasil.kuning.length > 0;
  return (
    <View style={{ borderRadius: 16, padding: 16, backgroundColor: merah ? W.merahSoft : ada ? W.kuningSoft : W.tealSoft }}>
      {ada ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CircleAlert size={20} color={merah ? W.merah : W.kuning} />
            <Teks w={700} s={15} c={merah ? W.merah : W.kuning} style={{ flex: 1 }}>
              {merah ? "Segera ke Puskesmas hari ini" : "Periksakan pada kunjungan terdekat"}
            </Teks>
          </View>
          <Teks s={14} style={{ marginTop: 4 }}>
            Kader dan bidan Ibu sudah diberi tahu lewat MOMCARE. {merah ? "Bila perdarahan, kejang, atau sesak, langsung ke fasilitas kesehatan terdekat." : ""}
          </Teks>
        </>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ilustrasi nama="tanaman" tanpaLatar ukuran={48} />
          <View style={{ flex: 1 }}>
            <Teks w={700} s={15} c={W.teal}>
              Terima kasih, Bu.
            </Teks>
            <Teks s={14}>Tidak ada keluhan {lembar === "hamil" ? "minggu" : "hari"} ini.</Teks>
          </View>
        </View>
      )}
    </View>
  );
}

/** Kartu bergambar seperti kolom lembar pemantauan. Diketuk untuk menandai, tanpa kotak centang. */
function KartuGambar({ label, gambar, nilai, ubah, level }: { label: string; gambar?: NamaGambar; nilai: boolean; ubah: (v: boolean) => void; level?: "merah" | "kuning" }) {
  const gaya = !nilai ? null : !level ? { warna: W.hijau, latar: W.hijauSoft, teks: "Sudah" } : level === "merah" ? { warna: W.merah, latar: W.merahSoft, teks: "Dialami" } : { warna: W.kuning, latar: W.kuningSoft, teks: "Dialami" };
  return (
    <Ketuk
      onPress={() => ubah(!nilai)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: nilai }}
      accessibilityLabel={label}
      style={[{ flexBasis: "47%", flexGrow: 1, borderRadius: 16, overflow: "hidden" }, gaya ? { borderWidth: 2.5, borderColor: gaya.warna, backgroundColor: gaya.latar } : gayaKartu]}
    >
      <View style={{ aspectRatio: 4 / 3, backgroundColor: "#fff", overflow: "hidden" }}>{gambar && <GambarKia nama={gambar} style={{ width: "100%", height: "100%" }} />}</View>
      <Teks w={500} s={13.5} lh={18} style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 }}>
        {label.replace(/\//g, "/​")}
      </Teks>
      {gaya && (
        <View style={{ position: "absolute", left: 8, top: 8, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: gaya.warna }}>
          <Teks w={700} s={12} c="#fff">
            {gaya.teks}
          </Teks>
        </View>
      )}
    </Ketuk>
  );
}

function Riwayat({ lembar, catatan, gejala }: { lembar: Lembar; catatan: Catatan[]; gejala: (readonly [string, string])[] }) {
  const k = KONFIG[lembar];
  const kolom = catatan.map((c) => Number(c.data[k.kunci])).sort((a, b) => a - b).slice(-8);
  if (!kolom.length) return null;
  return (
    <View style={[gayaKartu, { padding: 16 }]}>
      <Teks w={700} s={15}>
        Riwayat {k.satuan.toLowerCase()} sebelumnya
      </Teks>
      <Teks s={12} c={W.muted} style={{ marginBottom: 12 }}>
        Titik merah berarti keluhan yang Ibu tandai.
      </Teks>
      <View style={{ flexDirection: "row", paddingBottom: 8 }}>
        <Teks w={600} s={12} c={W.muted} style={{ flex: 1 }}>
          {k.satuan} ke-
        </Teks>
        {kolom.map((p) => (
          <Teks key={p} w={700} s={12} style={{ width: 26, textAlign: "center" }}>
            {p}
          </Teks>
        ))}
      </View>
      {gejala.map(([kk, label]) => (
        <View key={kk} style={{ flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(230,235,242,0.7)", paddingVertical: 6 }}>
          <Teks s={12} c={W.muted} numberOfLines={1} style={{ flex: 1, paddingRight: 8 }}>
            {label}
          </Teks>
          {kolom.map((p) => {
            const c = catatan.find((x) => Number(x.data[k.kunci]) === p);
            const ya = c?.data[kk] === true;
            return (
              <View key={p} style={{ width: 26, alignItems: "center" }}>
                <View style={{ width: ya ? 10 : 4, height: ya ? 10 : 4, borderRadius: 5, backgroundColor: ya ? W.merah : W.line }} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
