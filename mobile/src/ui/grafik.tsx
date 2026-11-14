/** Grafik kenaikan berat badan dan TFU/DJJ, digambar dengan SVG native (padanan recharts di web). */
import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Polygon, Text as SvgText } from "react-native-svg";
import type { Ringkasan } from "@/lib/hooks";
import { imt, kategoriImt, rentangKenaikan, terakhir, ukPada } from "@/lib/tahap";
import { parse } from "@/lib/tanggal";
import { HURUF, W } from "~/tema";
import { TautanBuku, Teks } from "./dasar";

const KIRI = 40;
const KANAN = 12;
const ATAS = 8;
const BAWAH = 22;

/** Batas sumbu yang "bulat" dengan 4–6 garis bantu. */
function sumbu(min: number, max: number): number[] {
  const rentang = Math.max(max - min, 1);
  const langkah = [1, 2, 5, 10, 20, 50].find((s) => rentang / s <= 6) ?? 50;
  const awal = Math.floor(min / langkah) * langkah;
  const out: number[] = [];
  for (let v = awal; v <= max + langkah * 0.001 || out.length < 2; v += langkah) out.push(v);
  return out;
}

function useLebar() {
  const [w, setW] = useState(0);
  return { w, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setW(e.nativeEvent.layout.width) };
}

const garisPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

export function GrafikBB({ r }: { r: Ringkasan }) {
  const { w, onLayout } = useLebar();
  const riw = terakhir(r.cari, "riwayat")?.data;
  const bbAwal = Number(riw?.bb_prahamil_kg) || undefined;
  const nilaiImt = Number(riw?.imt_prahamil) || imt(bbAwal, Number(riw?.tb_cm));
  const kat = kategoriImt(nilaiImt);
  const hpl = r.tahap.hpl;
  if (!bbAwal || !kat || !hpl)
    return (
      <Teks s={14} c={W.muted}>
        Grafik muncul setelah bidan mengisi berat badan sebelum hamil dan tinggi badan.
      </Teks>
    );

  const titik = r
    .cari("anc")
    .filter((a) => a.data.bb_kg)
    .map((a) => ({ m: ukPada(hpl, parse(a.data.tanggal) ?? new Date()) ?? 0, v: Math.round((Number(a.data.bb_kg) - bbAwal) * 10) / 10 }))
    .sort((a, b) => a.m - b.m);
  const pita = Array.from({ length: 41 }, (_, m) => ({ m, r: rentangKenaikan(m, kat.target) }));
  const ys = sumbu(Math.min(0, ...titik.map((t) => t.v)), Math.max(kat.target[1], ...titik.map((t) => t.v)));
  const tinggi = 220;
  const x = (m: number) => KIRI + (m / 40) * (w - KIRI - KANAN);
  const y = (v: number) => ATAS + (1 - (v - ys[0]) / (ys[ys.length - 1] - ys[0])) * (tinggi - ATAS - BAWAH);
  const band = [...pita.map((p) => `${x(p.m)},${y(p.r[1])}`), ...[...pita].reverse().map((p) => `${x(p.m)},${y(p.r[0])}`)].join(" ");

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Teks s={12} c={W.muted} style={{ flexShrink: 1 }}>
          IMT sebelum hamil{" "}
          <Teks w={700} s={12}>
            {String(nilaiImt).replace(".", ",")}
          </Teks>{" "}
          ({kat.label}) · target naik {kat.target[0]}–{kat.target[1]} kg
        </Teks>
        <TautanBuku halaman={108} />
      </View>
      <View onLayout={onLayout} style={{ height: tinggi }}>
        {w > 0 && (
          <Svg width={w} height={tinggi}>
            {ys.map((v) => (
              <Line key={v} x1={KIRI} x2={w - KANAN} y1={y(v)} y2={y(v)} stroke="#edf1f6" strokeWidth={1} />
            ))}
            {ys.map((v) => (
              <SvgText key={`t${v}`} x={KIRI - 6} y={y(v) + 4} fontSize={11} fill={W.muted} textAnchor="end" fontFamily={HURUF[500]}>
                {`${v} kg`}
              </SvgText>
            ))}
            {[0, 8, 16, 24, 32, 40].map((m) => (
              <SvgText key={`x${m}`} x={x(m)} y={tinggi - 6} fontSize={11} fill={W.muted} textAnchor="middle" fontFamily={HURUF[500]}>
                {String(m)}
              </SvgText>
            ))}
            <Polygon points={band} fill={W.brand} fillOpacity={0.12} />
            {titik.length > 1 && <Path d={garisPath(titik.map((t) => [x(t.m), y(t.v)]))} stroke={W.brand} strokeWidth={2.5} fill="none" strokeLinejoin="round" />}
            {titik.map((t) => (
              <Circle key={`${t.m}-${t.v}`} cx={x(t.m)} cy={y(t.v)} r={5} fill={W.brand} stroke="#fff" strokeWidth={2} />
            ))}
          </Svg>
        )}
      </View>
      <Teks s={11} c={W.muted} lh={15} style={{ marginTop: 4 }}>
        Sumbu bawah: minggu kehamilan. Pita biru: perkiraan kenaikan yang dianjurkan, dari rentang total Buku KIA hlm. 108.
      </Teks>
    </View>
  );
}

export function GrafikTfuDjj({ r }: { r: Ringkasan }) {
  const { w, onLayout } = useLebar();
  const hpl = r.tahap.hpl;
  const data = r
    .cari("anc")
    .filter((a) => a.data.tfu_cm || a.data.djj)
    .map((a) => ({ m: ukPada(hpl, parse(a.data.tanggal) ?? new Date()) ?? 0, tfu: Number(a.data.tfu_cm) || undefined, djj: Number(a.data.djj) || undefined }))
    .sort((a, b) => a.m - b.m);
  if (!data.length)
    return (
      <Teks s={14} c={W.muted}>
        Belum ada data tinggi rahim dan denyut jantung bayi.
      </Teks>
    );

  const tinggi = 200;
  const kananDjj = 34;
  const tfu = data.filter((d) => d.tfu !== undefined) as { m: number; tfu: number }[];
  const djj = data.filter((d) => d.djj !== undefined) as { m: number; djj: number }[];
  const ys = sumbu(Math.min(10, ...tfu.map((d) => d.tfu)), Math.max(40, ...tfu.map((d) => d.tfu)));
  const x = (m: number) => KIRI + ((m - 12) / 28) * (w - KIRI - kananDjj);
  const y = (v: number) => ATAS + (1 - (v - ys[0]) / (ys[ys.length - 1] - ys[0])) * (tinggi - ATAS - BAWAH);
  const yd = (v: number) => ATAS + (1 - (v - 100) / 80) * (tinggi - ATAS - BAWAH);

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <Kunci warna={W.brand} label="Tinggi rahim (cm)" />
        <Kunci warna={W.rose} label="Denyut jantung bayi" putus />
        <TautanBuku halaman={106} style={{ marginLeft: "auto" }} />
      </View>
      <View onLayout={onLayout} style={{ height: tinggi }}>
        {w > 0 && (
          <Svg width={w} height={tinggi}>
            {ys.map((v) => (
              <Line key={v} x1={KIRI} x2={w - kananDjj} y1={y(v)} y2={y(v)} stroke="#edf1f6" strokeWidth={1} />
            ))}
            <Polygon points={`${x(12)},${yd(160)} ${x(40)},${yd(160)} ${x(40)},${yd(120)} ${x(12)},${yd(120)}`} fill={W.rose} fillOpacity={0.08} />
            {ys.map((v) => (
              <SvgText key={`t${v}`} x={KIRI - 6} y={y(v) + 4} fontSize={11} fill={W.muted} textAnchor="end" fontFamily={HURUF[500]}>
                {`${v} cm`}
              </SvgText>
            ))}
            {[100, 120, 140, 160, 180].map((v) => (
              <SvgText key={`d${v}`} x={w - kananDjj + 6} y={yd(v) + 4} fontSize={11} fill={W.rose} fontFamily={HURUF[500]}>
                {String(v)}
              </SvgText>
            ))}
            {[12, 16, 20, 24, 28, 32, 36, 40].map((m) => (
              <SvgText key={`x${m}`} x={x(m)} y={tinggi - 6} fontSize={11} fill={W.muted} textAnchor="middle" fontFamily={HURUF[500]}>
                {String(m)}
              </SvgText>
            ))}
            {tfu.length > 1 && <Path d={garisPath(tfu.map((d) => [x(d.m), y(d.tfu)]))} stroke={W.brand} strokeWidth={2.5} fill="none" />}
            {djj.length > 1 && <Path d={garisPath(djj.map((d) => [x(d.m), yd(d.djj)]))} stroke={W.rose} strokeWidth={2} strokeDasharray="4 3" fill="none" />}
            {tfu.map((d) => (
              <Circle key={`f${d.m}`} cx={x(d.m)} cy={y(d.tfu)} r={4} fill={W.brand} stroke="#fff" strokeWidth={1.5} />
            ))}
            {djj.map((d) => (
              <Circle key={`j${d.m}`} cx={x(d.m)} cy={yd(d.djj)} r={4} fill={W.rose} stroke="#fff" strokeWidth={1.5} />
            ))}
          </Svg>
        )}
      </View>
      <Teks s={11} c={W.muted} lh={15} style={{ marginTop: 4 }}>
        Pita merah muda: denyut jantung bayi normal 120–160 kali per menit.
      </Teks>
    </View>
  );
}

function Kunci({ warna, label, putus }: { warna: string; label: string; putus?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 14, height: 0, borderTopWidth: 2.5, borderColor: warna, borderStyle: putus ? "dashed" : "solid" }} />
      <Teks s={12} c={W.muted}>
        {label}
      </Teks>
    </View>
  );
}
