import { AlertOctagon, ChevronRight, Lock } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import type { Tema } from "@/data/edukasi";
import { bolehLihatKolom } from "@/lib/akses";
import { BAB_TABEL, halamanCetakTabel, judulTabelIbu, keteranganCatatan, tanggalCatatan } from "@/lib/bab";
import { namaPengguna } from "@/lib/hooks";
import { kamus } from "@/lib/kamus";
import { tandaiNilai, tandaUtama, type Tanda } from "@/lib/nilai-catatan";
import { usePengguna } from "@/lib/store";
import type { SetMenu } from "@/lib/tahap";
import { tampilWaktu } from "@/lib/tanggal";
import type { Catatan as TCatatan, Level, Peringatan } from "@/lib/types";
import { useRingkasanSaya } from "~/hooks";
import { W, WARNA_NADA, WARNA_TEMA } from "~/tema";
import { Catatan as KotakCatatan, JudulTab, Ketuk, Kosong, Layar, LembarBawah, Memuat, Pemisah, Tab, TautanBuku, Teks, gayaKartu } from "~/ui/dasar";
import { TampilCatatan, judulCatatan } from "~/ui/catatan";
import { Ilustrasi } from "~/ui/ilustrasi";

/** Bab yang sedang dijalani ibu tampil paling atas. */
const URUTAN_BAB: Record<SetMenu, Tema[]> = {
  hamil: ["rose", "brand", "ungu", "teal"],
  nifas: ["ungu", "teal", "brand", "rose"],
  tumbuh: ["teal", "ungu", "brand", "rose"],
  belum: ["rose", "brand", "ungu", "teal"],
};

/** Label tab yang pendek supaya semua tab muat satu baris di layar HP. */
const LABEL_TAB: Record<Tema, string> = { rose: "Hamil", brand: "Lahir", ungu: "Nifas", teal: "Bayi", hijau: "Menyusui" };

const ASAL: Record<string, string | null> = { "foto (OCR)": "dari foto Buku KIA", impor: "dari data lama", "Ketik manual": null };

/** Catatan: semua riwayat Ibu dari seluruh tahap, dikelompokkan per bab Buku KIA. */
export default function Catatan() {
  const u = usePengguna();
  const r = useRingkasanSaya();
  const [bab, setBab] = useState<Tema | "semua">("semua");
  const [buka, setBuka] = useState<TCatatan | null>(null);
  if (!r) return <Memuat />;

  const urutan = URUTAN_BAB[r.tahap.set];
  const terbaru = (cs: TCatatan[]) => cs.reduce((a, c) => (tanggalCatatan(c) > a ? tanggalCatatan(c) : a), "");
  const grup = BAB_TABEL.map((b) => ({
    ...b,
    isi: b.tabel
      .filter((t) => kamus.tabel[t])
      .map((t) => ({ tabel: t, catatan: r.cari(t) }))
      .filter((x) => x.catatan.length)
      .sort((a, b) => terbaru(b.catatan).localeCompare(terbaru(a.catatan))),
  }))
    .filter((b) => b.isi.length)
    .sort((a, b) => urutan.indexOf(a.tema) - urutan.indexOf(b.tema));
  const total = grup.reduce((a, b) => a + b.isi.reduce((x, y) => x + y.catatan.length, 0), 0);
  const tampilkan = bab === "semua" ? grup : grup.filter((g) => g.tema === bab);

  const pengisi = (c: TCatatan) => (c.meta.dibuat_oleh === u?.id ? "Ibu sendiri" : namaPengguna(c.meta.dibuat_oleh));
  const tandaDari = (c: TCatatan) => tandaiNilai(c.tabel, c.data, (k) => bolehLihatKolom(u, k));
  const peringatanDari = (c: TCatatan) => r.peringatan.filter((p) => p.catatanId === c.id);

  return (
    <Layar tab>
      <JudulTab judul="Catatan" sub={total ? `${total} catatan dari Buku KIA Ibu` : "Buku KIA digital milik Ibu"} />

      {grup.length === 0 ? (
        <Kosong ikon={<Ilustrasi nama="catatan" ukuran={80} />} judul="Belum ada catatan" teks="Catatan muncul setelah kader atau bidan mengisi hasil periksa Ibu." />
      ) : (
        <>
          {grup.length > 1 && <Tab nilai={bab} setNilai={setBab} pilihan={[{ nilai: "semua" as const, label: "Semua" }, ...grup.map((g) => ({ nilai: g.tema, label: LABEL_TAB[g.tema] }))]} />}
          {tampilkan.map((g) => (
            <View key={g.tema} style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 6, height: 16, borderRadius: 3, backgroundColor: WARNA_TEMA[g.tema].pita }} />
                <Teks w={700} s={15}>
                  {g.judul}
                </Teks>
              </View>
              {g.isi.map(({ tabel, catatan }) => {
                const hlm = halamanCetakTabel(tabel);
                const urut = [...catatan].sort((a, b) => tanggalCatatan(b).localeCompare(tanggalCatatan(a)));
                return (
                  <View key={tabel} style={[gayaKartu, { overflow: "hidden" }]}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                      <Teks w={700} s={15} lh={20} style={{ flex: 1 }}>
                        {judulTabelIbu(tabel)}
                      </Teks>
                      {hlm ? <TautanBuku halaman={hlm} label={`hlm. ${hlm}`} style={{ marginTop: 2 }} /> : null}
                    </View>
                    {urut.map((c, i) => {
                      const judul = judulCatatan(c);
                      const tanda = tandaUtama(tandaDari(c));
                      const p = tanda ? undefined : peringatanDari(c)[0];
                      const asal = ASAL[c.meta.sumber];
                      return (
                        <View key={c.id}>
                          {i > 0 && <Pemisah />}
                          <Ketuk onPress={() => setBuka(c)} skala={1} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Teks w={600} s={15} numberOfLines={1}>
                                {judul}
                              </Teks>
                              <Teks s={12} c={W.muted} numberOfLines={1}>
                                {keteranganCatatan(c, judul, pengisi(c))}
                                {asal ? ` · ${asal}` : ""}
                              </Teks>
                              {(tanda || p) && <PilTanda level={(tanda ?? p)!.level} teks={tanda ? tanda.judul + (tanda.lain ? ` +${tanda.lain} lainnya` : "") : p!.judul} />}
                            </View>
                            <ChevronRight size={20} color={W.muted} />
                          </Ketuk>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          ))}
        </>
      )}

      {grup.length > 0 && (
        <KotakCatatan ikon={<Lock size={16} color={W.muted} />}>
          Hasil tripel eliminasi dan skrining kesehatan jiwa tidak ditampilkan di aplikasi untuk menjaga privasi Ibu. Bidan akan menjelaskannya langsung.
        </KotakCatatan>
      )}

      <LembarBawah buka={!!buka} tutup={() => setBuka(null)} judul={buka ? judulTabelIbu(buka.tabel) : ""} deskripsi={buka ? judulCatatan(buka) : undefined}>
        {buka && <DetailCatatan c={buka} tanda={tandaDari(buka)} peringatan={peringatanDari(buka)} pengisi={pengisi(buka)} />}
      </LembarBawah>
    </Layar>
  );
}

function PilTanda({ level, teks }: { level: Level; teks: string }) {
  const n = WARNA_NADA[level];
  return (
    <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, maxWidth: "100%", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: n.latar }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: n.teks }} />
      <Teks w={600} s={11.5} c={n.teks} lh={16} numberOfLines={1} style={{ flexShrink: 1 }}>
        {teks}
      </Teks>
    </View>
  );
}

/** Isi catatan: ringkasan hal yang perlu perhatian di atas, lalu semua isian dengan nilai bertanda. */
function DetailCatatan({ c, tanda, peringatan, pengisi }: { c: TCatatan; tanda: Record<string, Tanda>; peringatan: Peringatan[]; pengisi: string }) {
  const daftar = Object.values(tanda);
  const butir = daftar.length ? daftar.map((t) => t.judul) : peringatan.map((p) => p.judul);
  const merah = daftar.some((t) => t.level === "merah") || (!daftar.length && peringatan.some((p) => p.level === "merah"));
  const n = WARNA_NADA[merah ? "merah" : "kuning"];
  const asal = ASAL[c.meta.sumber];
  return (
    <View>
      {butir.length > 0 && (
        <View style={{ flexDirection: "row", gap: 12, borderRadius: 16, padding: 14, marginBottom: 12, backgroundColor: n.latar }}>
          <AlertOctagon size={20} color={n.teks} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Teks w={700} s={14} c={n.teks}>
              Perlu perhatian
            </Teks>
            {[...new Set(butir)].map((b) => (
              <Teks key={b} s={14} c="rgba(31,42,55,0.8)">
                • {b}
              </Teks>
            ))}
            <Teks w={600} s={12} c={n.teks} style={{ marginTop: 8 }}>
              {merah ? "Bila belum ditangani, segera hubungi bidan atau ke Puskesmas." : "Tanyakan ke bidan saat periksa berikutnya."}
            </Teks>
          </View>
        </View>
      )}
      <TampilCatatan tabel={c.tabel} data={c.data} tandai={tanda} />
      <Teks s={12} c={W.muted} style={{ marginTop: 12 }}>
        Diisi {pengisi}
        {asal ? ` ${asal}` : ""}
        {c.meta.dikonfirmasi_oleh ? `, dicek ${namaPengguna(c.meta.dikonfirmasi_oleh)} ${tampilWaktu(c.meta.dikonfirmasi_pada)}` : ""}
      </Teks>
    </View>
  );
}
