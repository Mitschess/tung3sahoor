/**
 * Mesin peringatan dini Rangkul (spesifikasi bagian 5).
 * Merah  = bidan/nakes diberi tahu hari itu juga, keluarga dihubungi.
 * Kuning = dicek/dikonfirmasi pada kunjungan terdekat.
 * Hijau  = sesuai jadwal (tidak ada peringatan terbuka).
 * Peringatan bukan diagnosis; keputusan tetap pada tenaga kesehatan.
 */
import { KOLOM_SENSITIF, kamus, levelDariPeringatanYa } from "./kamus";
import { jadwal } from "./jadwal";
import { nilaiPreeklamsia } from "./skrining";
import type { Pencari, Tahap } from "./tahap";
import { imt, kategoriImt, rentangKenaikan, terakhir, ukPada } from "./tahap";
import type { Catatan, Ibu, Level, Peringatan, StatusPeringatan } from "./types";
import { iso, parse, selisihHari } from "./tanggal";

type Dorong = (p: Omit<Peringatan, "ibuId" | "tanggal" | "untuk"> & { untuk?: Peringatan["untuk"]; tanggal?: string }) => void;

const n = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const x = Number(v);
  return Number.isNaN(x) ? undefined : x;
};

const tgl = (c?: Catatan) => (c?.data.tanggal ?? c?.data.tanggal_jam ?? c?.meta.dibuat_pada) as string | undefined;

export function evaluasi(ibu: Ibu, cari: Pencari, t: Tahap, now: Date): Peringatan[] {
  const out: Peringatan[] = [];
  const push: Dorong = (p) =>
    out.push({ untuk: "ibu", tanggal: iso(now), ...p, ibuId: ibu.id } as Peringatan);

  // ── Pemeriksaan kehamilan (K1–K6), nilai terbaru ──────────────────────────────
  const anc = cari("anc");
  const ancTd = [...anc].reverse().find((a) => n(a.data.td_sistolik) || n(a.data.td_diastolik));
  if (ancTd) {
    const s = n(ancTd.data.td_sistolik) ?? 0;
    const d = n(ancTd.data.td_diastolik) ?? 0;
    if (s >= 140 || d >= 90) {
      const pu = String(ancTd.data.protein_urine ?? "");
      const proteinPositif = pu.startsWith("+");
      push({
        id: `td-tinggi:${ancTd.id}`,
        level: "merah",
        judul: proteinPositif ? "Tekanan darah tinggi + protein urine positif" : "Tekanan darah tinggi",
        detail: `TD ${s}/${d} mmHg pada ${ancTd.data.tanggal}${proteinPositif ? `, protein urine ${pu}` : ""}. Batas: ≥ 140/90 mmHg.`,
        sumber: "Buku KIA hlm. 96",
        halamanCetak: 96,
        tabel: "anc",
        catatanId: ancTd.id,
        tanggal: tgl(ancTd),
      });
    }
  }

  const lila = [...anc].reverse().find((a) => n(a.data.lila_cm)) ?? terakhir(cari, "dokter_t1");
  if (lila && n(lila.data.lila_cm) !== undefined && n(lila.data.lila_cm)! < 23.5) {
    push({
      id: `lila:${lila.id}`,
      level: "kuning",
      judul: "Risiko kurang energi kronis (KEK)",
      detail: `LiLA ${lila.data.lila_cm} cm (< 23,5 cm).`,
      sumber: "Buku KIA hlm. 96",
      halamanCetak: 96,
      tabel: lila.tabel,
      catatanId: lila.id,
      tanggal: tgl(lila),
    });
  }

  // Hemoglobin: ambang per trimester (usulan bagian 5b, WHO 2024)
  const sumberHb: Catatan[] = [
    ...anc.filter((a) => n(a.data.hb) !== undefined),
    ...cari("lab_t1").filter((a) => n(a.data.hb) !== undefined),
    ...cari("dokter_t3").filter((a) => n(a.data.lab_hb) !== undefined),
  ].sort((a, b) => String(tgl(a)).localeCompare(String(tgl(b))));
  const hbRec = sumberHb[sumberHb.length - 1];
  if (hbRec && t.set === "hamil") {
    const hb = n(hbRec.data.hb ?? hbRec.data.lab_hb)!;
    const uk = ukPada(t.hpl, parse(tgl(hbRec)) ?? now) ?? 0;
    const tm = uk <= 12 ? 1 : uk <= 24 ? 2 : 3;
    const batas = tm === 2 ? 10.5 : 11;
    if (hb < 7) {
      push({ id: `hb-berat:${hbRec.id}`, level: "merah", judul: "Anemia berat", detail: `Hb ${hb} g/dL (< 7).`, sumber: "Usulan tim, WHO 2024 (bagian 5b)", tabel: hbRec.tabel, catatanId: hbRec.id, tanggal: tgl(hbRec) });
    } else if (hb < batas) {
      push({ id: `hb:${hbRec.id}`, level: "kuning", judul: "Anemia pada kehamilan", detail: `Hb ${hb} g/dL (< ${String(batas).replace(".", ",")} di trimester ${tm}).`, sumber: "Usulan tim, WHO 2024 (bagian 5b)", tabel: hbRec.tabel, catatanId: hbRec.id, tanggal: tgl(hbRec) });
    }
  }

  const djjRec = [...anc, ...cari("dokter_t3")].filter((a) => n(a.data.djj) !== undefined).sort((a, b) => String(tgl(a)).localeCompare(String(tgl(b)))).pop();
  if (djjRec && t.set === "hamil") {
    const djj = n(djjRec.data.djj)!;
    if (djj < 120 || djj > 160) {
      push({ id: `djj:${djjRec.id}`, level: "merah", judul: "Denyut jantung bayi tidak normal", detail: `DJJ ${djj}×/menit (normal 120–160).`, sumber: "Usulan tim, SOP DJJ (bagian 5b)", tabel: djjRec.tabel, catatanId: djjRec.id, tanggal: tgl(djjRec) });
    }
  }

  // Tripel eliminasi: data sensitif, hanya nakes
  for (const rec of [...anc, ...cari("lab_t1")]) {
    for (const [k, nama] of [["tripel_hiv", "HIV"], ["tripel_sifilis", "sifilis"], ["tripel_hepb", "hepatitis B"]] as const) {
      if (rec.data[k] === "Reaktif") {
        push({
          id: `${k}:${rec.id}`,
          level: "merah",
          judul: `Tripel eliminasi: ${nama} reaktif`,
          detail: k === "tripel_hepb" ? "Rujuk; bayi wajib HB0 < 24 jam." : "Tindak lanjut dan rujukan oleh nakes.",
          sumber: "Permenkes 52/2017; kamus data",
          tabel: rec.tabel,
          catatanId: rec.id,
          sensitif: true,
          tanggal: tgl(rec),
        });
      }
    }
  }

  // Kenaikan berat badan vs IMT pra-hamil (hlm. 108)
  const r = terakhir(cari, "riwayat")?.data;
  const bbAwal = n(r?.bb_prahamil_kg);
  const nilaiImt = n(r?.imt_prahamil) ?? imt(bbAwal, n(r?.tb_cm));
  const kat = kategoriImt(nilaiImt);
  const bbRec = [...anc].reverse().find((a) => n(a.data.bb_kg) !== undefined);
  if (t.set === "hamil" && kat && bbAwal && bbRec) {
    const uk = ukPada(t.hpl, parse(tgl(bbRec)) ?? now) ?? 0;
    if (uk >= 14) {
      const naik = Math.round((n(bbRec.data.bb_kg)! - bbAwal) * 10) / 10;
      const [lo, hi] = rentangKenaikan(uk, kat.target);
      if (naik < lo - 0.5 || naik > hi + 0.5) {
        push({
          id: `bb:${bbRec.id}`,
          level: "kuning",
          judul: naik < lo ? "Kenaikan berat badan kurang" : "Kenaikan berat badan berlebih",
          detail: `Naik ${naik} kg pada ${uk} minggu; perkiraan rentang ${lo.toFixed(1)}–${hi.toFixed(1)} kg (IMT ${kat.label}, target total ${kat.target[0]}–${kat.target[1]} kg).`,
          sumber: "Buku KIA hlm. 108",
          halamanCetak: 108,
          tabel: "anc",
          catatanId: bbRec.id,
          tanggal: tgl(bbRec),
        });
      }
    }
  }

  // Skrining preeklamsia (hlm. 102)
  const pe = terakhir(cari, "preeklamsia");
  if (pe) {
    const h = nilaiPreeklamsia(pe.data);
    if (h.rujuk) {
      push({
        id: `preeklamsia:${pe.id}`,
        level: "merah",
        judul: "Risiko preeklamsia: rujukan terencana",
        detail: [h.tinggi.length ? `Risiko tinggi: ${h.tinggi.join(", ")}` : "", h.sedang.length ? `Risiko sedang: ${h.sedang.join(", ")}` : ""].filter(Boolean).join(". "),
        sumber: "Buku KIA hlm. 102",
        halamanCetak: 102,
        tabel: "preeklamsia",
        catatanId: pe.id,
        tanggal: tgl(pe),
      });
    }
  }

  // Diabetes gestasional (usulan 5b, WHO 2013)
  const dm = terakhir(cari, "dm");
  if (dm) {
    const gdp = n(dm.data.gdp);
    const g2 = n(dm.data.gd2pp);
    if ((gdp ?? 0) >= 126 || (g2 ?? 0) >= 200) {
      push({ id: `dm-berat:${dm.id}`, level: "merah", judul: "Gula darah sangat tinggi", detail: `GDP ${gdp ?? "–"} / 2 jam PP ${g2 ?? "–"} mg/dL.`, sumber: "Usulan tim, WHO 2013 (bagian 5b)", halamanCetak: 102, tabel: "dm", catatanId: dm.id, tanggal: tgl(dm) });
    } else if ((gdp ?? 0) >= 92 || (g2 ?? 0) >= 153) {
      push({ id: `dm:${dm.id}`, level: "kuning", judul: "Curiga diabetes gestasional", detail: `GDP ${gdp ?? "–"} mg/dL (≥ 92) atau 2 jam PP ${g2 ?? "–"} mg/dL (≥ 153).`, sumber: "Usulan tim, WHO 2013 (bagian 5b)", halamanCetak: 102, tabel: "dm", catatanId: dm.id, tanggal: tgl(dm) });
    }
  }
  const lab = terakhir(cari, "lab_t1");
  if (lab && (n(lab.data.gds) ?? 0) >= 200) {
    push({ id: `gds:${lab.id}`, level: "merah", judul: "Gula darah sewaktu ≥ 200 mg/dL", detail: `GDS ${lab.data.gds} mg/dL, rujuk.`, sumber: "Kamus data (lab_t1)", halamanCetak: 100, tabel: "lab_t1", catatanId: lab.id, tanggal: tgl(lab) });
  }

  // Kesehatan jiwa (hlm. 100, 104, 116): sensitif
  if (lab?.data.skrining_jiwa_hasil === true) {
    const rujuk = lab.data.skrining_jiwa_rujuk === true;
    push({ id: `jiwa-t1:${lab.id}`, level: rujuk ? "merah" : "kuning", judul: rujuk ? "Skrining jiwa: perlu rujukan" : "Skrining jiwa positif", detail: `Tindak lanjut: ${lab.data.skrining_jiwa_tindak_lanjut ?? "–"}.`, sumber: "Buku KIA hlm. 100", halamanCetak: 100, tabel: "lab_t1", catatanId: lab.id, sensitif: true, tanggal: tgl(lab) });
  }

  // Dokter T1 & T3
  const dt1 = terakhir(cari, "dokter_t1");
  if (dt1?.data.kesimpulan === "kehamilan bermasalah") {
    push({ id: `dt1:${dt1.id}`, level: "merah", judul: "Dokter T1: kehamilan bermasalah", detail: `Rekomendasi: ${dt1.data.rekomendasi ?? "–"}.`, sumber: "Buku KIA hlm. 99", halamanCetak: 99, tabel: "dokter_t1", catatanId: dt1.id, tanggal: tgl(dt1) });
  }
  const dt3 = terakhir(cari, "dokter_t3");
  if (dt3) {
    if (dt3.data.keadaan_bayi === "meninggal") {
      push({ id: `dt3-bayi:${dt3.id}`, level: "merah", judul: "Dokter T3: keadaan bayi meninggal", detail: "Segera tindak lanjut oleh dokter.", sumber: "Buku KIA hlm. 104", halamanCetak: 104, tabel: "dokter_t3", catatanId: dt3.id, untuk: "bayi", tanggal: tgl(dt3) });
    }
    const a = n(dt3.data.uk_biometri);
    const b = n(dt3.data.uk_hpht) ?? n(dt3.data.uk_usg_t1);
    if (a !== undefined && b !== undefined && Math.abs(a - b) >= 3) {
      push({ id: `dt3-uk:${dt3.id}`, level: "kuning", judul: "Selisih usia kehamilan ≥ 3 minggu", detail: `Biometri ${a} mgg vs ${b} mgg.`, sumber: "Kamus data (dokter_t3)", halamanCetak: 104, tabel: "dokter_t3", catatanId: dt3.id, untuk: "bayi", tanggal: tgl(dt3) });
    }
  }

  // ── Lembar pemantauan diisi ibu: aturan diturunkan dari kamus ("Ya → Merah/Kuning")
  const cekLembar = (namaTabel: string, kunciHari: "minggu_kehamilan" | "hari_ke", batasTerbaru: number, untuk: "ibu" | "bayi", hlm: number) => {
    const daftar = cari(namaTabel);
    if (!daftar.length) return;
    const maks = Math.max(...daftar.map((c) => n(c.data[kunciHari]) ?? 0));
    const kolom = kamus.tabel[namaTabel].kolom;
    for (const c of daftar) {
      const ke = n(c.data[kunciHari]) ?? 0;
      if (ke < maks - batasTerbaru) continue;
      const merah: string[] = [];
      const kuning: string[] = [];
      const jiwa: string[] = [];
      for (const [k, def] of Object.entries(kolom)) {
        if (c.data[k] !== true) continue;
        let lv = levelDariPeringatanYa(def);
        if (!lv) continue;
        if (k === "gerak_bayi_kurang" && ke < 24) lv = "kuning";
        if (k === "pusing_berat" && ancTd && ((n(ancTd.data.td_sistolik) ?? 0) >= 140 || (n(ancTd.data.td_diastolik) ?? 0) >= 90)) lv = "merah";
        // Butir kesehatan jiwa dipisah agar tidak terlihat kader/keluarga (kode etik bagian 6).
        if (KOLOM_SENSITIF.has(k)) {
          jiwa.push(def.label);
          continue;
        }
        (lv === "merah" ? merah : kuning).push(def.label);
      }
      const satuan = kunciHari === "minggu_kehamilan" ? `minggu ke-${ke}` : `hari ke-${ke}`;
      if (jiwa.length) {
        push({ id: `${namaTabel}-jiwa:${c.id}`, level: "kuning", judul: `Masalah kesehatan jiwa dilaporkan (${satuan})`, detail: "Arahkan ke skrining kesehatan jiwa oleh nakes.", sumber: `Buku KIA hlm. ${hlm}`, halamanCetak: hlm, tabel: namaTabel, catatanId: c.id, sensitif: true, untuk, tanggal: tgl(c) });
      }
      if (!merah.length && !kuning.length) continue;
      const level: Level = merah.length ? "merah" : "kuning";
      push({
        id: `${namaTabel}:${c.id}`,
        level,
        judul: untuk === "bayi" ? `Tanda bahaya bayi (${satuan})` : `Gejala dari pemantauan ibu (${satuan})`,
        detail: [...merah, ...kuning].join("; "),
        sumber: `Buku KIA hlm. ${hlm}`,
        halamanCetak: hlm,
        tabel: namaTabel,
        catatanId: c.id,
        untuk,
        tanggal: tgl(c),
      });
    }
  };
  if (t.set === "hamil") cekLembar("pemantauan_hamil", "minggu_kehamilan", 1, "ibu", 10);
  if (t.set === "nifas") {
    cekLembar("pemantauan_nifas", "hari_ke", 1, "ibu", 28);
    cekLembar("pemantauan_bayi", "hari_ke", 1, "bayi", 42);
  }

  // Persiapan melahirkan pada minggu ke-36 (hlm. 18)
  if (t.set === "hamil" && (t.ukMinggu ?? 0) >= 36) {
    const p = terakhir(cari, "persiapan")?.data ?? {};
    const belum = (["penolong_dipilih", "donor_darah_siap", "kendaraan_siap"] as const).filter((k) => p[k] !== true);
    if (belum.length) {
      push({ id: `persiapan-36:${ibu.id}`, level: "kuning", judul: "Persiapan melahirkan belum lengkap", detail: `Belum: ${belum.map((k) => kamus.tabel.persiapan.kolom[k].label.toLowerCase()).join("; ")}.`, sumber: "Buku KIA hlm. 18", halamanCetak: 18, tabel: "persiapan" });
    }
  }

  // ── Persalinan, bayi baru lahir, nifas ──────────────────────────────────────
  const pers = terakhir(cari, "persalinan");
  if (pers) {
    if (String(pers.data.keadaan_ibu ?? "").startsWith("sakit")) {
      push({ id: `pers-ibu:${pers.id}`, level: "merah", judul: "Keadaan ibu setelah melahirkan: sakit", detail: String(pers.data.keterangan ?? ""), sumber: "Buku KIA hlm. 110", halamanCetak: 110, tabel: "persalinan", catatanId: pers.id, tanggal: tgl(pers) });
    }
    const uk = n(pers.data.usia_kehamilan_minggu);
    if (uk !== undefined && uk < 37 && t.set === "nifas") {
      push({ id: `prematur:${pers.id}`, level: "kuning", judul: "Bayi lahir prematur", detail: `Lahir pada ${uk} minggu (< 37). Gunakan Buku KIA bayi kecil; perawatan metode kanguru.`, sumber: "Buku KIA hlm. 47, 110", halamanCetak: 47, tabel: "persalinan", catatanId: pers.id, untuk: "bayi", tanggal: tgl(pers) });
    }
  }
  const bayi = terakhir(cari, "bayi_lahir");
  if (bayi && t.set === "nifas") {
    const bl = n(bayi.data.berat_lahir_g);
    if (bl !== undefined && bl < 2500) {
      push({ id: `bblr:${bayi.id}`, level: "merah", judul: "Berat lahir rendah (BBLR)", detail: `Berat lahir ${bl} g (< 2500 g).`, sumber: "Kamus data; definisi WHO", halamanCetak: 111, tabel: "bayi_lahir", catatanId: bayi.id, untuk: "bayi", tanggal: tgl(bayi) });
    }
    const kondisi = (bayi.data.kondisi_lahir as string[] | undefined) ?? [];
    const bahaya = kondisi.filter((k) => ["tidak menangis", "anggota gerak kebiruan", "seluruh tubuh biru", "kelainan bawaan", "meninggal"].includes(k));
    if (bahaya.length) {
      push({ id: `kondisi-lahir:${bayi.id}`, level: "merah", judul: "Kondisi bayi saat lahir perlu perhatian", detail: bahaya.join(", "), sumber: "Buku KIA hlm. 111", halamanCetak: 111, tabel: "bayi_lahir", catatanId: bayi.id, untuk: "bayi", tanggal: tgl(bayi) });
    }
    if (bayi.data.vit_k1 === false) {
      push({ id: `vitk:${bayi.id}`, level: "kuning", judul: "Vitamin K1 belum diberikan", detail: "Suntikan vitamin K1 belum tercatat.", sumber: "Buku KIA hlm. 111", halamanCetak: 111, tabel: "bayi_lahir", catatanId: bayi.id, untuk: "bayi", tanggal: tgl(bayi) });
    }
    const hb0Imun = cari("imunisasi").some((i) => i.data.vaksin === "HB0");
    if (bayi.data.hb0 !== true && !hb0Imun && (t.jamSejakLahir ?? 0) > 24) {
      push({ id: `hb0:${bayi.id}`, level: "merah", judul: "Imunisasi HB0 belum dalam 24 jam", detail: "HB0 seharusnya diberikan sebelum 24 jam setelah lahir.", sumber: "Buku KIA hlm. 41, 124", halamanCetak: 124, tabel: "bayi_lahir", catatanId: bayi.id, untuk: "bayi", tanggal: tgl(bayi) });
    }
  }

  const kf = terakhir(cari, "kf");
  if (kf && t.set === "nifas") {
    const s = n(kf.data.td_sistolik) ?? 0;
    const d = n(kf.data.td_diastolik) ?? 0;
    if (s >= 140 || d >= 90) push({ id: `kf-td:${kf.id}`, level: "merah", judul: "Hipertensi pada nifas", detail: `TD ${s}/${d} mmHg.`, sumber: "Usulan tim (bagian 5b), disamakan hlm. 96", halamanCetak: 116, tabel: "kf", catatanId: kf.id, tanggal: tgl(kf) });
    if ((n(kf.data.suhu_c) ?? 0) > 38) push({ id: `kf-suhu:${kf.id}`, level: "merah", judul: "Demam pada nifas", detail: `Suhu ${kf.data.suhu_c} °C (> 38).`, sumber: "Buku KIA hlm. 28", halamanCetak: 116, tabel: "kf", catatanId: kf.id, tanggal: tgl(kf) });
    if (kf.data.lokhia_perdarahan === "tidak normal") push({ id: `kf-lokhia:${kf.id}`, level: "merah", judul: "Lokhia/perdarahan tidak normal", detail: "Periksa ulang oleh nakes.", sumber: "Buku KIA hlm. 116–117", halamanCetak: 116, tabel: "kf", catatanId: kf.id, tanggal: tgl(kf) });
    if (kf.data.jalan_lahir === "tidak normal") push({ id: `kf-jalan:${kf.id}`, level: "kuning", judul: "Jalan lahir/tanda infeksi tidak normal", detail: "Kontrol pada kunjungan terdekat.", sumber: "Buku KIA hlm. 116", halamanCetak: 116, tabel: "kf", catatanId: kf.id, tanggal: tgl(kf) });
    if (kf.data.skrining_jiwa === true) push({ id: `kf-jiwa:${kf.id}`, level: "kuning", judul: "Skrining jiwa nifas positif", detail: "Konseling dan pemantauan baby blues/depresi.", sumber: "Buku KIA hlm. 32, 116", halamanCetak: 116, tabel: "kf", catatanId: kf.id, sensitif: true, tanggal: tgl(kf) });
  }

  const kn = terakhir(cari, "kn");
  if (kn && t.set === "nifas") {
    const bb = n(kn.data.bb_g);
    if (bb !== undefined && bb < 2500) push({ id: `kn-bb:${kn.id}`, level: "merah", judul: "Berat bayi < 2500 g", detail: `BB ${bb} g saat ${kn.data.kn_ke}.`, sumber: "Kamus data (kn)", halamanCetak: 122, tabel: "kn", catatanId: kn.id, untuk: "bayi", tanggal: tgl(kn) });
    if (kn.data.menyusu === false) push({ id: `kn-susu:${kn.id}`, level: "merah", judul: "Bayi tidak mau menyusu", detail: `Tercatat saat ${kn.data.kn_ke}.`, sumber: "Buku KIA hlm. 40–41, 122", halamanCetak: 122, tabel: "kn", catatanId: kn.id, untuk: "bayi", tanggal: tgl(kn) });
    if (kn.data.tanda_bahaya === true) push({ id: `kn-bahaya:${kn.id}`, level: "merah", judul: "Tanda bahaya bayi muda (MTBS)", detail: String(kn.data.catatan ?? "Lihat catatan nakes."), sumber: "Buku KIA hlm. 122", halamanCetak: 122, tabel: "kn", catatanId: kn.id, untuk: "bayi", tanggal: tgl(kn) });
    if (kn.data.kuning === true) push({ id: `kn-kuning:${kn.id}`, level: "kuning", judul: "Bayi tampak kuning", detail: kn.data.kuning_area ? `Area ${kn.data.kuning_area}.` : "Pantau warna kulit dan tinja.", sumber: "Buku KIA hlm. 122", halamanCetak: 122, tabel: "kn", catatanId: kn.id, untuk: "bayi", tanggal: tgl(kn) });
  }
  if (t.set === "nifas" && (t.hariNifas ?? 0) >= 14 && !cari("kn").some((k) => k.data.shk === true)) {
    push({ id: `shk:${ibu.id}`, level: "kuning", judul: "Skrining hipotiroid kongenital belum tercatat", detail: "SHK dilakukan setelah 24 jam, paling lambat 14 hari.", sumber: "Buku KIA hlm. 41, 122", halamanCetak: 122, tabel: "kn", untuk: "bayi" });
  }

  for (const c of cari("tinja")) {
    const w = n(c.data.nomor_warna);
    if (w !== undefined && w <= 3) push({ id: `tinja:${c.id}`, level: "merah", judul: "Tinja bayi pucat", detail: `Nomor warna ${w}: curiga atresia bilier, segera ke dokter.`, sumber: "Buku KIA hlm. 46", halamanCetak: 46, tabel: "tinja", catatanId: c.id, untuk: "bayi", tanggal: tgl(c) });
  }

  // Rujukan tanpa rujukan balik > 7 hari
  for (const rj of cari("rujukan")) {
    const tr = parse(rj.data.tanggal_rujuk);
    if (tr && !rj.data.tanggal_balik && selisihHari(now, tr) > 7) {
      push({ id: `rujukbalik:${rj.id}`, level: "kuning", judul: "Belum ada rujukan balik", detail: `Dirujuk ke ${rj.data.tujuan ?? "FKRTL"} ${selisihHari(now, tr)} hari lalu. Kader menanyakan kabar ibu.`, sumber: "Buku KIA hlm. 118", halamanCetak: 118, tabel: "rujukan", catatanId: rj.id, tanggal: tgl(rj) });
    }
  }

  // Kunjungan terlambat (bagian 3 dan 5a)
  for (const k of jadwal(t, cari, now)) {
    if (k.status !== "terlambat") continue;
    push({
      id: `telat:${k.kode}:${ibu.id}`,
      level: "kuning",
      judul: `${k.kode} terlambat`,
      detail: `${k.nama}: jendela sampai ${k.selesai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} terlewat.`,
      sumber: `Buku KIA hlm. ${k.halamanCetak}`,
      halamanCetak: k.halamanCetak,
      tabel: k.tabel,
      untuk: k.untuk,
    });
  }

  return out.sort((a, b) => (a.level === b.level ? 0 : a.level === "merah" ? -1 : 1));
}

export function terbuka(ps: Peringatan[], status: Record<string, StatusPeringatan>): Peringatan[] {
  return ps.filter((p) => !status[p.id]);
}

export type Warna = "merah" | "kuning" | "hijau";

export function warnaIbu(ps: Peringatan[]): Warna {
  if (ps.some((p) => p.level === "merah")) return "merah";
  if (ps.some((p) => p.level === "kuning")) return "kuning";
  return "hijau";
}
