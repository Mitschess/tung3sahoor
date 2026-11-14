import { AlertOctagon, Baby, CalendarClock, ChevronRight, ClipboardList, HeartPulse, Luggage, Phone, ShieldAlert, Stethoscope, type LucideIcon } from "lucide-react-native";
import { Linking, Pressable, View } from "react-native";
import { useSekarang } from "@/lib/hooks";
import { hitungStatus, type StatusKesehatan } from "@/lib/status-ibu";
import { tugasHariIni, type Tugas } from "@/lib/tugas";
import { namaDepan } from "@/lib/util";
import { useRingkasanSaya } from "~/hooks";
import { W, WARNA_NADA } from "~/tema";
import { JudulBagian, Ketuk, Layar, Lencana, Memuat, Pemisah, Teks, gayaKartu, useBuka } from "~/ui/dasar";
import { Ilustrasi } from "~/ui/ilustrasi";
import { TombolSos } from "~/ui/sos";
import { DaftarJadwal, KartuTahap } from "~/ui/tahap";

/** Ikon tiap jenis tugas, supaya Ibu langsung tahu jenisnya tanpa membaca. */
const IKON_TUGAS: Record<string, LucideIcon> = {
  pantau: ClipboardList,
  "pantau-nifas": HeartPulse,
  "pantau-bayi": Baby,
  kembali: CalendarClock,
  jadwal: Stethoscope,
  persiapan: Luggage,
};

export default function Beranda() {
  const r = useRingkasanSaya();
  const now = useSekarang();
  const buka = useBuka();
  if (!r) return <Memuat />;

  const tugas = tugasHariIni(r, now);
  const merah = [...new Set(r.peringatan.filter((p) => p.level === "merah").map((p) => p.judul))];
  const status = hitungStatus(r);

  return (
    <Layar tab>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Teks w={700} s={20} lh={26} numberOfLines={1}>
            Halo, Bu {namaDepan(r.ibu.profil.nama)}
          </Teks>
          <Teks s={14} c={W.muted} numberOfLines={1}>
            Posyandu {String(r.ibu.profil.wilayah_posyandu)}
          </Teks>
        </View>
        <TombolSos />
      </View>

      {/* Hal mendesak tampil paling atas, sebelum informasi kehamilan. */}
      {merah.length > 0 && <KotakMerah judul={merah} faskes={String(r.ibu.profil.faskes_tk1 ?? "Puskesmas")} />}

      <KartuTahap t={r.tahap} href="/ibu/hasil" />

      <View style={[gayaKartu, { padding: 16 }]}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <Teks w={700} s={17}>
            Hari ini
          </Teks>
          <Teks s={14} c={W.muted}>
            {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </Teks>
        </View>
        {tugas.length === 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12 }}>
            <Ilustrasi nama="tanaman" ukuran={56} />
            <View style={{ flex: 1 }}>
              <Teks w={700} s={15}>
                Tidak ada tugas hari ini
              </Teks>
              <Teks s={14} c={W.muted}>
                Tetap minum tablet tambah darah ya, Bu.
              </Teks>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 4 }}>
            {tugas.map((t, i) => (
              <View key={t.id}>
                {i > 0 && <Pemisah />}
                <BarisTugas t={t} onPress={() => buka(t.href)} />
              </View>
            ))}
          </View>
        )}
      </View>

      {status.length > 0 && (
        <View>
          <JudulBagian>Hasil periksa terakhir</JudulBagian>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {status.map((s) => (
              <KartuStatus key={s.id} s={s} onPress={() => buka(s.href)} />
            ))}
          </View>
        </View>
      )}

      {r.jadwal.length > 0 && (
        <View>
          <JudulBagian
            aksi={
              <Pressable onPress={() => buka("/ibu/hasil")} hitSlop={8}>
                <Teks w={600} s={15} c={W.brand}>
                  Semua
                </Teks>
              </Pressable>
            }
          >
            Jadwal periksa
          </JudulBagian>
          <DaftarJadwal js={r.jadwal} ringkas />
        </View>
      )}

      <Teks s={12} c={W.muted} style={{ textAlign: "center", paddingHorizontal: 8 }}>
        Rangkul tidak menggantikan Buku KIA dan pemeriksaan bidan. Bila ada tanda bahaya, segera ke fasilitas kesehatan terdekat.
      </Teks>
    </Layar>
  );
}

/** Peringatan merah: apa yang ditemukan, ke mana harus pergi, dan jalan pintas bila darurat. */
function KotakMerah({ judul, faskes }: { judul: string[]; faskes: string }) {
  const buka = useBuka();
  return (
    <View style={[gayaKartu, { overflow: "hidden", borderWidth: 1, borderColor: "rgba(217,45,58,0.25)" }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: W.merah, paddingHorizontal: 16, paddingVertical: 12 }}>
        <AlertOctagon size={24} color="#fff" />
        <View style={{ flex: 1 }}>
          <Teks w={700} s={15} c="#fff">
            Segera periksa ke bidan hari ini
          </Teks>
          <Teks s={12} c="rgba(255,255,255,0.85)">
            Ditemukan dari catatan Buku KIA Ibu
          </Teks>
        </View>
      </View>
      <View style={{ padding: 16, paddingTop: 12 }}>
        <View style={{ gap: 6 }}>
          {judul.map((j) => (
            <View key={j} style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: W.merah, marginTop: 8 }} />
              <Teks w={600} s={15} style={{ flex: 1 }}>
                {j}
              </Teks>
            </View>
          ))}
        </View>
        <Teks s={14} c="rgba(31,42,55,0.75)" style={{ marginTop: 10 }}>
          Datang ke {faskes} atau hubungi bidan. Bila ada perdarahan, kejang, atau sesak napas, langsung telepon 119.
        </Teks>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Ketuk onPress={() => Linking.openURL("tel:119")} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: W.merah, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Phone size={16} color="#fff" />
            <Teks w={600} s={15} c="#fff">
              Telepon 119
            </Teks>
          </Ketuk>
          <Ketuk onPress={() => buka("/ibu/tanda-bahaya")} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: W.merahSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <ShieldAlert size={16} color={W.merah} />
            <Teks w={600} s={15} c={W.merah}>
              Tanda bahaya
            </Teks>
          </Ketuk>
        </View>
      </View>
    </View>
  );
}

function BarisTugas({ t, onPress }: { t: Tugas; onPress: () => void }) {
  const Ikon = IKON_TUGAS[t.id] ?? ClipboardList;
  const kuning = t.nada === "kuning";
  return (
    <Ketuk onPress={onPress} skala={0.99} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: kuning ? W.kuningSoft : W.brandSoft }}>
        <Ikon size={20} color={kuning ? W.kuning : W.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Teks w={600} s={15} lh={20}>
          {t.judul}
        </Teks>
        <Teks s={14} c={W.muted}>
          {t.teks}
        </Teks>
      </View>
      <ChevronRight size={20} color={W.muted} />
    </Ketuk>
  );
}

function KartuStatus({ s, onPress }: { s: StatusKesehatan; onPress: () => void }) {
  const n = WARNA_NADA[s.nada];
  return (
    <Ketuk onPress={onPress} skala={0.99} style={[gayaKartu, { flexBasis: "47%", flexGrow: 1, padding: 16 }]}>
      <Teks w={600} s={14} c={W.muted}>
        {s.judul}
      </Teks>
      <Teks w={800} s={24} lh={30} style={{ marginTop: 6 }}>
        {s.nilai}{" "}
        <Teks w={600} s={14} c={W.muted}>
          {s.satuan}
        </Teks>
      </Teks>
      <Lencana latar={n.latar} warna={n.teks} style={{ marginTop: 8 }}>
        {s.label}
      </Lencana>
      <Teks s={12} c={W.muted} lh={16} style={{ marginTop: 4 }}>
        {s.ket}
      </Teks>
    </Ketuk>
  );
}
