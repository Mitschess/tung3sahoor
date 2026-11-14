import { ChevronRight, ExternalLink } from "lucide-react-native";
import { View } from "react-native";
import { kamus } from "@/lib/kamus";
import type { SetMenu } from "@/lib/tahap";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { JudulTab, Ketuk, Layar, Memuat, Pemisah, Teks, gayaKartu, useBuka } from "~/ui/dasar";
import { Ilustrasi, type NamaIlustrasi } from "~/ui/ilustrasi";

interface Fitur {
  label: string;
  teks: string;
  href: string;
  gambar: NamaIlustrasi;
  untuk?: SetMenu[];
  luar?: boolean;
}

/** Satu baris = satu tujuan. Catatan dan Profil sudah ada di menu bawah, jadi tidak diulang di sini. */
const FITUR: Fitur[] = [
  { label: "Pantau mingguan", teks: "Ketuk gambar keluhan yang Ibu alami", href: "/ibu/pantau", gambar: "pantau", untuk: ["hamil"] },
  { label: "Pantau nifas", teks: "Kondisi Ibu setiap hari sampai hari ke-42", href: "/ibu/pantau?lembar=nifas", gambar: "pantau-nifas", untuk: ["nifas"] },
  { label: "Pantau bayi", teks: "Kondisi bayi setiap hari sampai 28 hari", href: "/ibu/pantau?lembar=bayi", gambar: "bayi", untuk: ["nifas"] },
  { label: "Jadwal & grafik", teks: "Jadwal periksa dan grafik berat badan", href: "/ibu/hasil", gambar: "jadwal", untuk: ["hamil"] },
  { label: "Jadwal kunjungan", teks: "Kunjungan nifas dan kunjungan bayi", href: "/ibu/hasil", gambar: "jadwal", untuk: ["nifas"] },
  { label: "Persiapan melahirkan", teks: "10 hal yang disiapkan bersama keluarga", href: "/ibu/persiapan", gambar: "persiapan", untuk: ["hamil"] },
  { label: "Keluarga berencana", teks: "Pilih KB sebelum hari ke-42", href: "/ibu/kb", gambar: "kb", untuk: ["nifas"] },
  { label: "Tanda bahaya", teks: "Kenali lewat gambar, lalu segera periksa", href: "/ibu/tanda-bahaya", gambar: "bahaya" },
  { label: "Buku edukasi", teks: "Materi bergambar sesuai tahap Ibu", href: "/ibu/edukasi", gambar: "buku" },
  { label: "Buku KIA 2024", teks: "Buku asli dari Kemenkes (PDF)", href: kamus.url_pdf, gambar: "bukuKia", luar: true },
];

export default function HalamanFitur() {
  const r = useRingkasanSaya();
  const buka = useBuka();
  if (!r) return <Memuat />;
  const daftar = FITUR.filter((f) => !f.untuk || f.untuk.includes(r.tahap.set));

  return (
    <Layar tab jarak={16}>
      <JudulTab judul="Fitur" />
      <View style={[gayaKartu, { overflow: "hidden" }]}>
        {daftar.map((f, i) => (
          <View key={f.label}>
            {i > 0 && <Pemisah />}
            <Ketuk onPress={() => buka(f.href)} skala={1} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Ilustrasi nama={f.gambar} ukuran={56} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Teks w={600} s={16} lh={21}>
                  {f.label}
                </Teks>
                <Teks s={14} c={W.muted}>
                  {f.teks}
                </Teks>
              </View>
              {f.luar ? <ExternalLink size={18} color={W.muted} /> : <ChevronRight size={20} color={W.muted} />}
            </Ketuk>
          </View>
        ))}
      </View>
    </Layar>
  );
}
