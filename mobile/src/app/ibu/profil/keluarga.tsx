import { BellRing, EyeOff, Info, Phone, Siren, Users, type LucideIcon } from "lucide-react-native";
import { Linking, View } from "react-native";
import { pesanKunjungan } from "@/lib/pesan";
import { inisial } from "@/lib/util";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { Baris, Catatan, Kartu, Kepala, Kosong, Layar, Memuat, Teks, Tombol, gayaKartu } from "~/ui/dasar";

/** Suami/keluarga pendamping: siapa dia, cara menghubungi, dan pesan apa saja yang ia terima. */
export default function Keluarga() {
  const r = useRingkasanSaya();
  if (!r) return <Memuat />;
  const k = r.ibu.keluarga;
  const nama = k.nama_pendamping ? String(k.nama_pendamping) : "";
  const telepon = k.telepon_pendamping ? String(k.telepon_pendamping) : "";
  const posyandu = String(r.ibu.profil.wilayah_posyandu);

  return (
    <Layar jarak={24} kepala={<Kepala judul="Suami / Keluarga" sub="Pendamping Ibu selama hamil dan nifas" kembali="/ibu/profil" />}>
      {nama ? (
        <Kartu style={{ padding: 20, alignItems: "center" }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: W.roseSoft, alignItems: "center", justifyContent: "center" }}>
            <Teks w={700} s={20} c={W.rose}>
              {inisial(nama)}
            </Teks>
          </View>
          <Teks w={700} s={18} style={{ marginTop: 12 }}>
            {nama}
          </Teks>
          <Teks s={14} c={W.muted}>
            {String(k.hubungan ?? "Pendamping")} · pendamping Ibu
          </Teks>
          {telepon ? (
            <Tombol onPress={() => Linking.openURL(`tel:${telepon}`)} ikon={<Phone size={16} color="#fff" />} style={{ marginTop: 16, alignSelf: "center", paddingHorizontal: 20 }}>
              {`Telepon ${nama.split(" ")[0]}`}
            </Tombol>
          ) : null}
          <View style={{ alignSelf: "stretch", marginTop: 20, borderTopWidth: 1, borderTopColor: W.line, paddingTop: 4 }}>
            <Baris label="Nomor HP">{telepon || "–"}</Baris>
            <Baris label="Golongan darah">{String(k.golongan_darah_pendamping ?? "–")}</Baris>
          </View>
        </Kartu>
      ) : (
        <Kosong ikon={<Users size={32} color={W.muted} />} judul="Belum ada pendamping" teks={`Sampaikan nama dan nomor HP suami atau keluarga ke kader Posyandu ${posyandu}.`} />
      )}

      <View>
        <Teks w={600} s={14} c={W.muted} style={{ marginBottom: 10 }}>
          Pesan yang diterima keluarga
        </Teks>
        <Kartu style={{ padding: 16, gap: 14 }}>
          <Butir ikon={BellRing} judul="Pengingat jadwal periksa" teks="Dikirim kader 2 hari sebelum, pada hari periksa, dan 2 hari sesudahnya bila Ibu belum datang." />
          <Butir ikon={Siren} judul="Kabar bila Ibu perlu segera ke bidan" teks="Hanya ajakan untuk mendampingi Ibu ke Puskesmas, tanpa menyebut hasilnya." />
          <Butir ikon={EyeOff} judul="Tidak berisi hasil pemeriksaan" teks="Angka periksa, tes darah, dan skrining kesehatan jiwa tidak pernah dikirim ke keluarga." />
        </Kartu>
      </View>

      {nama ? (
        <View>
          <Teks w={600} s={14} c={W.muted} style={{ marginBottom: 10 }}>
            Contoh pesan pengingat
          </Teks>
          <View style={{ borderRadius: 16, backgroundColor: "rgba(232,242,254,0.7)", padding: 16 }}>
            <View style={[gayaKartu, { maxWidth: "90%", borderTopLeftRadius: 6, padding: 14 }]}>
              <Teks s={14} lh={21}>
                {pesanKunjungan(r, "pendamping")}
              </Teks>
              <Teks s={11} c={W.muted} style={{ marginTop: 6, textAlign: "right" }}>
                dari kader posyandu
              </Teks>
            </View>
          </View>
        </View>
      ) : null}

      <Catatan ikon={<Info size={16} color={W.muted} />}>Mau mengganti pendamping atau nomor HP? Sampaikan ke kader Posyandu {posyandu} atau bidan saat periksa.</Catatan>
    </Layar>
  );
}

function Butir({ ikon: Ikon, judul, teks }: { ikon: LucideIcon; judul: string; teks: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: W.brandSoft, alignItems: "center", justifyContent: "center" }}>
        <Ikon size={18} color={W.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Teks w={600} s={15} lh={20}>
          {judul}
        </Teks>
        <Teks s={14} c={W.muted} lh={19}>
          {teks}
        </Teks>
      </View>
    </View>
  );
}
