import { Phone, Siren } from "lucide-react-native";
import { Linking, Pressable, View } from "react-native";
import { TANDA_BAHAYA, tandaBahayaUntuk } from "@/data/edukasi";
import { useRingkasanSaya } from "~/hooks";
import { W, WARNA_NADA } from "~/tema";
import { JudulBagian, Kartu, Kepala, Layar, Memuat, TautanBuku, Teks, Titik, gayaKartu } from "~/ui/dasar";
import { KisiGambar } from "~/ui/lembar-materi";

export default function TandaBahaya() {
  const r = useRingkasanSaya();
  if (!r) return <Memuat />;
  const daftar = r.tahap.kode === "belum" || r.tahap.kode === "anak" ? TANDA_BAHAYA : tandaBahayaUntuk(r.tahap.kode);
  return (
    <Layar kepala={<Kepala judul="Tanda bahaya" sub="Jika mengalami, segera ke Puskesmas/Rumah Sakit" kembali="/ibu" />}>
      <View style={{ borderRadius: 24, backgroundColor: W.merah, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Siren size={24} color="#fff" />
          <Teks w={800} s={18} c="#fff">
            Ada tanda bahaya?
          </Teks>
        </View>
        <Teks s={14} lh={20} c="rgba(255,255,255,0.92)" style={{ marginTop: 4 }}>
          Jangan menunggu jadwal periksa. Segera ke fasilitas kesehatan terdekat. Rangkul bukan layanan gawat darurat.
        </Teks>
        <Pressable onPress={() => Linking.openURL("tel:119")} style={({ pressed }) => ({ marginTop: 16, alignSelf: "flex-start", height: 44, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 22, backgroundColor: "#fff", paddingHorizontal: 20, opacity: pressed ? 0.85 : 1 })}>
          <Phone size={16} color={W.merah} />
          <Teks w={700} s={15} c={W.merah}>
            Telepon 119
          </Teks>
        </Pressable>
      </View>

      {r.peringatan.length > 0 && (
        <View>
          <JudulBagian>Catatan Ibu yang perlu diperiksa</JudulBagian>
          <View style={{ gap: 8 }}>
            {r.peringatan.map((p) => (
              <View key={p.id} style={[gayaKartu, { flexDirection: "row", gap: 12, padding: 16, borderWidth: 1, borderColor: p.level === "merah" ? "rgba(217,45,58,0.3)" : "rgba(184,110,0,0.3)" }]}>
                <Titik warna={WARNA_NADA[p.level].teks} ukuran={10} style={{ marginTop: 6 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Teks w={700} s={15} lh={20}>
                    {p.judul}
                  </Teks>
                  <Teks s={14} lh={19} c={W.muted} style={{ marginTop: 2 }}>
                    {p.detail}
                  </Teks>
                  {p.halamanCetak ? <TautanBuku halaman={p.halamanCetak} style={{ marginTop: 8 }} /> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {daftar.map((t) => {
        const bergambar = t.butir.filter((b) => b.gambar).map((b) => ({ gambar: b.gambar!, label: b.teks }));
        const tanpaGambar = t.butir.filter((b) => !b.gambar);
        return (
          <Kartu key={t.judul} style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Teks w={700} s={18} lh={23} style={{ flex: 1 }}>
                {t.judul}
              </Teks>
              <TautanBuku halaman={t.halaman} label={`hlm. ${t.halaman}`} />
            </View>
            {bergambar.length > 0 && <KisiGambar isi={bergambar} />}
            {tanpaGambar.length > 0 && (
              <View style={{ marginTop: 12, gap: 8 }}>
                {tanpaGambar.map((b) => (
                  <View key={b.teks} style={{ flexDirection: "row", gap: 8 }}>
                    <Titik warna={W.merah} style={{ marginTop: 7 }} />
                    <Teks s={14} lh={20} style={{ flex: 1 }}>
                      {b.teks}
                    </Teks>
                  </View>
                ))}
              </View>
            )}
          </Kartu>
        );
      })}
      <Teks s={11} c={W.muted} style={{ textAlign: "center" }}>
        Gambar: Buku KIA, Kementerian Kesehatan RI, 2024.
      </Teks>
    </Layar>
  );
}
