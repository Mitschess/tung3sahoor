"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import type { Ringkasan } from "@/lib/hooks";
import { imt, kategoriImt, rentangKenaikan, terakhir, ukPada } from "@/lib/tahap";
import { parse } from "@/lib/tanggal";
import { TautanBuku } from "./ui";

/** Grafik kenaikan BB digambar aplikasi dari angka yang sudah diinput (tidak perlu difoto). */
export function GrafikBB({ r }: { r: Ringkasan }) {
  const riw = terakhir(r.cari, "riwayat")?.data;
  const bbAwal = Number(riw?.bb_prahamil_kg) || undefined;
  const nilaiImt = Number(riw?.imt_prahamil) || imt(bbAwal, Number(riw?.tb_cm));
  const kat = kategoriImt(nilaiImt);
  const hpl = r.tahap.hpl;
  if (!bbAwal || !kat || !hpl) {
    return <p className="text-sm text-muted">Isi BB pra-hamil dan tinggi badan di data kehamilan untuk menampilkan grafik.</p>;
  }
  const titik = r
    .cari("anc")
    .filter((a) => a.data.bb_kg)
    .map((a) => ({ minggu: ukPada(hpl, parse(a.data.tanggal) ?? new Date()) ?? 0, naik: Math.round((Number(a.data.bb_kg) - bbAwal) * 10) / 10 }));
  const pita = Array.from({ length: 41 }, (_, m) => {
    const [lo, hi] = rentangKenaikan(m, kat.target);
    return { minggu: m, rentang: [Math.round(lo * 10) / 10, Math.round(hi * 10) / 10] as [number, number] };
  });
  const data = pita.map((p) => ({ ...p, naik: titik.find((t) => t.minggu === p.minggu)?.naik }));
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          IMT pra-hamil <b className="text-ink">{String(nilaiImt).replace(".", ",")}</b> ({kat.label}) · target total {kat.target[0]}–{kat.target[1]} kg
        </span>
        <TautanBuku halaman={108} />
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#edf1f6" vertical={false} />
            <XAxis dataKey="minggu" type="number" domain={[0, 40]} ticks={[0, 8, 12, 16, 20, 24, 28, 32, 36, 40]} tick={{ fontSize: 11, fill: "#6b7686" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7686" }} tickLine={false} axisLine={false} unit=" kg" width={52} />
            <Tooltip
              formatter={(v, n) => (n === "rentang" && Array.isArray(v) ? [`${v[0]}–${v[1]} kg`, "Rentang anjuran"] : [`${v} kg`, "Kenaikan"])}
              labelFormatter={(l) => `Minggu ke-${l}`}
              contentStyle={{ borderRadius: 12, border: "1px solid #e6ebf2", fontSize: 12 }}
            />
            <Area dataKey="rentang" stroke="none" fill="#2f8af5" fillOpacity={0.12} isAnimationActive={false} />
            <Line dataKey="naik" stroke="#2f8af5" strokeWidth={2.5} connectNulls dot={{ r: 4, fill: "#2f8af5", stroke: "#fff", strokeWidth: 2 }} isAnimationActive={false} />
            <Scatter dataKey="naik" fill="#2f8af5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] text-muted">Pita ungu: perkiraan rentang kenaikan per minggu, digambar dari rentang total Buku KIA hlm. 108.</p>
    </div>
  );
}

export function GrafikTfuDjj({ r }: { r: Ringkasan }) {
  const hpl = r.tahap.hpl;
  const data = r
    .cari("anc")
    .filter((a) => a.data.tfu_cm || a.data.djj)
    .map((a) => ({ minggu: ukPada(hpl, parse(a.data.tanggal) ?? new Date()) ?? 0, tfu: a.data.tfu_cm as number | undefined, djj: a.data.djj as number | undefined }));
  if (!data.length) return <p className="text-sm text-muted">Belum ada data TFU/DJJ.</p>;
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <TautanBuku halaman={106} />
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="#edf1f6" vertical={false} />
            <XAxis dataKey="minggu" type="number" domain={[12, 40]} tick={{ fontSize: 11, fill: "#6b7686" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="tfu" tick={{ fontSize: 11, fill: "#6b7686" }} tickLine={false} axisLine={false} unit=" cm" width={52} />
            <YAxis yAxisId="djj" orientation="right" domain={[100, 180]} tick={{ fontSize: 11, fill: "#e84d8a" }} tickLine={false} axisLine={false} width={36} />
            <Tooltip labelFormatter={(l) => `Minggu ke-${l}`} contentStyle={{ borderRadius: 12, border: "1px solid #e6ebf2", fontSize: 12 }} />
            <Area yAxisId="djj" dataKey={() => [120, 160]} name="DJJ normal" stroke="none" fill="#e84d8a" fillOpacity={0.08} isAnimationActive={false} />
            <Line yAxisId="tfu" dataKey="tfu" name="TFU (cm)" stroke="#2f8af5" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} connectNulls />
            <Line yAxisId="djj" dataKey="djj" name="DJJ (×/menit)" stroke="#e84d8a" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
