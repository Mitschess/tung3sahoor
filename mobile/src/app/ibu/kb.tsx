import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { kamus } from "@/lib/kamus";
import { useStore } from "@/lib/store";
import { terakhir } from "@/lib/tahap";
import { iso, parse, tampil } from "@/lib/tanggal";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { Kartu, Kepala, Ketuk, Layar, Memuat, TautanBuku, Teks, Tombol, gayaKartu, kabar } from "~/ui/dasar";
import { GambarKia } from "~/ui/gambar";

/** Keterangan singkat tiap metode supaya Ibu tidak perlu menebak singkatannya. */
const KET: Record<string, string> = {
  MOW: "Steril wanita",
  MOP: "Steril pria",
  AKDR: "Spiral / IUD",
  implan: "Susuk di lengan",
  suntik: "Suntik KB",
  pil: "Pil KB",
  kondom: "Kondom",
  MAL: "Menyusui eksklusif",
  lainnya: "Metode lain",
};

export default function KB() {
  const r = useRingkasanSaya();
  const simpan = useStore((s) => s.simpan);
  const rec = r ? terakhir(r.cari, "kb") : undefined;
  const [metode, setMetode] = useState<string | undefined>(() => (rec?.data.metode_dipilih as string | undefined) ?? undefined);
  const [mulai, setMulai] = useState<string | undefined>(() => (rec?.data.tanggal_mulai as string | undefined) ?? undefined);
  const [pilihIos, setPilihIos] = useState(false);
  if (!r) return <Memuat />;
  const pilihan = kamus.tabel.kb.kolom.metode_dipilih.pilihan ?? [];

  const bukaTanggal = () => {
    const nilai = parse(mulai) ?? new Date();
    if (Platform.OS === "android") DateTimePickerAndroid.open({ value: nilai, mode: "date", onChange: (e, d) => e.type === "set" && d && setMulai(iso(d)) });
    else setPilihIos(true);
  };

  const kirim = () => {
    if (!metode) return kabar("Pilih metode KB dulu, Bu.", true);
    try {
      simpan("kb", r.ibu.id, { metode_dipilih: metode, tanggal_mulai: mulai }, rec ? { catatanId: rec.id } : {});
      kabar("Pilihan KB tersimpan");
    } catch (e) {
      kabar((e as Error).message, true);
    }
  };

  return (
    <Layar jarak={16} kepala={<Kepala judul="Keluarga berencana" sub="Diisi oleh ibu" kembali="/ibu" />}>
      <View style={[gayaKartu, { overflow: "hidden" }]}>
        <View style={{ backgroundColor: "#efebf8", alignItems: "center" }}>
          <GambarKia nama="kb" alt="Ibu dan suami membicarakan pilihan alat kontrasepsi" style={{ height: 176, width: undefined }} fit="contain" />
        </View>
        <View style={{ padding: 16, gap: 8 }}>
          <Teks w={700} s={15}>
            Mulai KB paling lambat hari ke-42
          </Teks>
          <Teks s={14} c={W.muted}>
            Pilih metode yang tidak mengganggu ASI dan bicarakan bersama suami dan bidan. Jarak kehamilan yang sehat paling sedikit 2 tahun.
          </Teks>
          <TautanBuku halaman={33} label="KB di Buku KIA hlm. 33" />
        </View>
      </View>

      <Kartu style={{ padding: 20, gap: 16 }}>
        <View>
          <Teks w={600} s={14}>
            Metode yang dipilih <Teks c={W.merah}>*</Teks>
          </Teks>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {pilihan.map((o) => {
              const aktif = metode === o;
              return (
                <Ketuk
                  key={o}
                  onPress={() => setMetode(aktif ? undefined : o)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: aktif }}
                  style={{ flexBasis: "47%", flexGrow: 1, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, borderColor: aktif ? W.brand : W.line, backgroundColor: aktif ? W.brandSoft : W.surface }}
                >
                  <Teks w={700} s={14} c={aktif ? W.brandInk : W.ink}>
                    {o === "lainnya" ? "Lainnya" : o}
                  </Teks>
                  <Teks s={12} c={W.muted}>
                    {KET[o] ?? ""}
                  </Teks>
                </Ketuk>
              );
            })}
          </View>
        </View>
        <View>
          <Teks w={600} s={14}>
            Tanggal mulai
          </Teks>
          <Pressable onPress={bukaTanggal} style={{ marginTop: 8, height: 48, borderRadius: 12, borderWidth: 1, borderColor: W.line, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <CalendarDays size={18} color={W.muted} />
            <Teks s={15} c={mulai ? W.ink : W.pudar} style={{ flex: 1 }}>
              {mulai ? tampil(mulai) : "Pilih tanggal"}
            </Teks>
          </Pressable>
          <Teks s={12} c={W.muted} style={{ marginTop: 6 }}>
            Belum ber-KB pada hari ke-42 akan diingatkan kader.
          </Teks>
          {pilihIos && <DateTimePicker value={parse(mulai) ?? new Date()} mode="date" display="inline" onChange={(_, d) => (setPilihIos(false), d && setMulai(iso(d)))} />}
        </View>
        <Tombol onPress={kirim}>Simpan pilihan KB</Tombol>
      </Kartu>
    </Layar>
  );
}
