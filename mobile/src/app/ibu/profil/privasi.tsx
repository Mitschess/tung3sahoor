import { Camera, FileCheck2, Fingerprint, Lock, ShieldCheck, Stethoscope, User, Users, UsersRound, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { tampil } from "@/lib/tanggal";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { Kartu, Kepala, Layar, Memuat, Pemisah, Teks, gayaKartu } from "~/ui/dasar";

/** Privasi data: siapa yang bisa melihat, bagaimana data dijaga, dan persetujuan Ibu. */
export default function Privasi() {
  const r = useRingkasanSaya();
  if (!r) return <Memuat />;
  const posyandu = String(r.ibu.profil.wilayah_posyandu);
  const peran = [
    { ikon: User, siapa: "Ibu sendiri", apa: "Catatan dan jadwal Ibu. Hasil tes sensitif dijelaskan langsung oleh bidan." },
    { ikon: Users, siapa: `Kader Posyandu ${posyandu}`, apa: "Jadwal, hasil periksa umum, dan tanda bahaya. Tidak melihat data sensitif." },
    { ikon: Stethoscope, siapa: "Bidan dan dokter Puskesmas", apa: "Semua catatan, termasuk data sensitif, untuk merawat Ibu.", sensitif: true },
    { ikon: UsersRound, siapa: "Suami / keluarga", apa: "Hanya pesan pengingat jadwal. Tidak melihat isi catatan." },
  ];

  return (
    <Layar jarak={24} kepala={<Kepala judul="Privasi data" kembali="/ibu/profil" />}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 16, backgroundColor: W.brandSoft, padding: 20 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: W.surface, alignItems: "center", justifyContent: "center", boxShadow: "0px 1px 3px rgba(0,0,0,0.08)" }}>
          <ShieldCheck size={28} color={W.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Teks w={700} s={18} c={W.brandInk}>
            Data Ibu dijaga
          </Teks>
          <Teks s={14} lh={19} c="rgba(31,42,55,0.75)" style={{ marginTop: 2 }}>
            Hanya petugas yang melayani Ibu yang bisa melihat catatan Ibu.
          </Teks>
        </View>
      </View>

      <View>
        <Judul>Siapa yang bisa melihat</Judul>
        <View style={[gayaKartu, { overflow: "hidden" }]}>
          {peran.map((p, i) => (
            <View key={p.siapa}>
              {i > 0 && <Pemisah />}
              <View style={{ flexDirection: "row", gap: 14, paddingHorizontal: 16, paddingVertical: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: p.sensitif ? W.unguSoft : W.brandSoft }}>
                  <p.ikon size={20} color={p.sensitif ? W.ungu : W.brand} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Teks w={600} s={15} lh={20}>
                    {p.siapa}
                  </Teks>
                  <Teks s={14} lh={19} c={W.muted}>
                    {p.apa}
                  </Teks>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View>
        <Judul>Cara data Ibu dijaga</Judul>
        <View style={{ gap: 10 }}>
          <Jaga ikon={Lock} judul="Data sensitif dibatasi" teks="Tes HIV, sifilis, hepatitis B, dan skrining kesehatan jiwa hanya untuk bidan dan dokter, dan tidak pernah dikirim ke keluarga." />
          <Jaga ikon={Fingerprint} judul="NIK disamarkan" teks={`Yang tampil hanya 4 digit terakhir: ${r.ibu.nikSamaran}.`} />
          <Jaga ikon={Camera} judul="Foto Buku KIA tidak disimpan" teks="Foto dihapus setelah isinya dicek dan disimpan petugas." />
        </View>
      </View>

      <View>
        <Judul>Persetujuan Ibu</Judul>
        <Kartu style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <FileCheck2 size={24} color={W.hijau} />
            <View style={{ flex: 1 }}>
              <Teks s={15}>
                Ibu menyetujui pada <Teks w={700}>{tampil(r.ibu.persetujuan.tanggal)}</Teks>
              </Teks>
              <Teks s={12} c={W.muted}>
                Teks persetujuan {r.ibu.persetujuan.versi}
              </Teks>
            </View>
          </View>
          <Teks s={14} lh={19} c={W.muted} style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: W.line, paddingTop: 12 }}>
            Ibu boleh berhenti kapan saja tanpa memengaruhi pelayanan. Sampaikan ke bidan atau kader.
          </Teks>
        </Kartu>
      </View>
    </Layar>
  );
}

function Judul({ children }: { children: string }) {
  return (
    <Teks w={600} s={14} c={W.muted} style={{ marginBottom: 10 }}>
      {children}
    </Teks>
  );
}

function Jaga({ ikon: Ikon, judul, teks }: { ikon: LucideIcon; judul: string; teks: string }) {
  return (
    <Kartu style={{ flexDirection: "row", gap: 12, padding: 16 }}>
      <Ikon size={20} color={W.brand} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Teks w={600} s={15} lh={20}>
          {judul}
        </Teks>
        <Teks s={14} lh={19} c={W.muted}>
          {teks}
        </Teks>
      </View>
    </Kartu>
  );
}
