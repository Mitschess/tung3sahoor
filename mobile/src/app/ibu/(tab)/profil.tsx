import { useRouter } from "expo-router";
import { ChevronRight, CreditCard, HeartHandshake, Info, LogOut, Phone, ShieldCheck, Users, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useStore } from "@/lib/store";
import { inisial } from "@/lib/util";
import { useRingkasanSaya } from "~/hooks";
import { W } from "~/tema";
import { JudulTab, Ketuk, Layar, Memuat, Pemisah, Teks, gayaKartu } from "~/ui/dasar";

export default function Profil() {
  const r = useRingkasanSaya();
  const keluar = useStore((s) => s.keluar);
  const router = useRouter();
  if (!r) return <Memuat />;
  const p = r.ibu.profil;
  const k = r.ibu.keluarga;
  const pendamping = k.nama_pendamping ? `${String(k.nama_pendamping)} (${String(k.hubungan ?? "pendamping")})` : "Belum diisi";

  return (
    <Layar tab jarak={24}>
      <JudulTab judul="Profil" />

      <View style={[gayaKartu, { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 }]}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: W.brandSoft, alignItems: "center", justifyContent: "center" }}>
          <Teks w={700} s={18} c={W.brandInk}>
            {inisial(p.nama)}
          </Teks>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Teks w={700} s={17} numberOfLines={1}>
            {String(p.nama)}
          </Teks>
          <Teks s={14} c={W.muted}>
            {r.tahap.label}
          </Teks>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Phone size={14} color={W.muted} />
            <Teks s={14} c={W.muted}>
              {String(p.telepon ?? "–")}
            </Teks>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <CreditCard size={14} color={W.muted} />
            <Teks s={14} c={W.muted}>
              NIK {r.ibu.nikSamaran}
            </Teks>
          </View>
        </View>
      </View>

      <Grup judul="Data Ibu">
        <Baris2 ikon={Users} label="Suami / Keluarga" sub={pendamping} onPress={() => router.push("/ibu/profil/keluarga")} />
        <Pemisah />
        <Baris2 ikon={HeartHandshake} label={`Posyandu ${String(p.wilayah_posyandu)}`} sub={String(p.puskesmas_domisili ?? p.faskes_tk1 ?? "")} />
        <Pemisah />
        <Baris2 ikon={ShieldCheck} label="Privasi data" sub="Siapa saja yang bisa melihat data Ibu" onPress={() => router.push("/ibu/profil/privasi")} />
      </Grup>

      <Grup judul="Lainnya">
        <Baris2 ikon={Info} label="Tentang MOMCARE" sub="Kegunaan, sumber isi, dan batasan" onPress={() => router.push("/ibu/profil/tentang")} />
        <Pemisah />
        <Baris2
          ikon={LogOut}
          label="Keluar"
          onPress={() => {
            keluar();
            router.replace("/masuk");
          }}
        />
      </Grup>
    </Layar>
  );
}

function Grup({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <View>
      <Teks w={600} s={14} c={W.muted} style={{ marginBottom: 10 }}>
        {judul}
      </Teks>
      <View style={[gayaKartu, { overflow: "hidden" }]}>{children}</View>
    </View>
  );
}

function Baris2({ ikon: Ikon, label, sub, onPress }: { ikon: LucideIcon; label: string; sub?: string; onPress?: () => void }) {
  return (
    <Ketuk onPress={onPress} disabled={!onPress} skala={1} style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 16, paddingVertical: 16 }}>
      <Ikon size={24} color={W.brand} strokeWidth={1.8} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Teks s={15}>{label}</Teks>
        {sub ? (
          <Teks s={12} c={W.muted} numberOfLines={1}>
            {sub}
          </Teks>
        ) : null}
      </View>
      {onPress && <ChevronRight size={20} color={W.muted} />}
    </Ketuk>
  );
}

