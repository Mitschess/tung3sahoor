// Membuat APK rilis Rangkul di komputer ini (tanpa EAS): `npm run build:apk`.
// Butuh Android SDK (ANDROID_HOME) dan JDK 17+ (JAVA_HOME). Bila JAVA_HOME kosong di Windows,
// JDK bawaan Android Studio dipakai. Hasil: dist/rangkul.apk.
// Catatan: APK ditandatangani dengan kunci debug, cukup untuk demo dan dipasang langsung, bukan untuk Play Store.
import { execSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const akar = path.resolve(import.meta.dirname, "..");
const induk = path.resolve(akar, "..");
const windows = process.platform === "win32";
const env = { ...process.env };

if (!env.ANDROID_HOME) {
  const sdk = windows
    ? path.join(env.LOCALAPPDATA ?? "", "Android", "Sdk")
    : path.join(env.HOME ?? "", "Android", "Sdk");
  if (existsSync(sdk)) env.ANDROID_HOME = sdk;
}
if (!env.JAVA_HOME && windows) {
  const jbr = path.join(
    env.ProgramFiles ?? "C:/Program Files",
    "Android",
    "Android Studio",
    "jbr",
  );
  if (existsSync(jbr)) env.JAVA_HOME = jbr;
}
if (!env.ANDROID_HOME)
  throw new Error("ANDROID_HOME belum diatur dan Android SDK tidak ditemukan.");
if (!env.JAVA_HOME)
  throw new Error("JAVA_HOME belum diatur (butuh JDK 17 atau lebih baru).");

const jalankan = (cmd, cwd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, env, stdio: "inherit" });
};

// Windows membatasi jalur berkas 260 karakter. CMake menyalin jalur sumber lengkap ke dalam folder
// .cxx, sehingga proyek di folder yang dalam (mis. Downloads\...) gagal dikompilasi. Bila begitu,
// bagian yang dibutuhkan disalin ke folder pendek (C:\mi, bisa diganti lewat FOLDER_BUILD) dan
// dibangun di sana. Robocopy hanya menyalin yang berubah, jadi build berikutnya tetap cepat.
let kerja = akar;
if (windows && akar.length > 20) {
  const pendek = env.FOLDER_BUILD ?? path.join(env.SystemDrive ?? "C:", "\\mi");
  const salin = (dari, ke, kecuali = []) => {
    const args = [dari, ke, "/MIR", "/NFL", "/NDL", "/NJH", "/NP", "/R:1", "/W:1"];
    if (kecuali.length) args.push("/XD", ...kecuali);
    console.log(`\n> robocopy ${dari} ${ke}`);
    const r = spawnSync("robocopy", args, { stdio: "inherit" });
    // Kode keluar robocopy 0–7 berarti berhasil; 8 ke atas berarti ada berkas yang gagal disalin.
    if (r.status === null || r.status >= 8)
      throw new Error(`robocopy gagal (kode ${r.status}).`);
  };
  salin(path.join(induk, "src"), path.join(pendek, "src"));
  salin(path.join(induk, "public", "kia"), path.join(pendek, "public", "kia"));
  kerja = path.join(pendek, "mobile");
  // /XD dengan nama saja berlaku di semua kedalaman (node_modules juga punya android/ dan dist/),
  // jadi folder tingkat atas ditulis dengan jalur lengkap, di sumber maupun tujuan. android/ dan
  // .cxx di tujuan dibiarkan supaya hasil kompilasi native dipakai ulang.
  const lewati = ["android", "dist", ".expo"].flatMap((d) => [
    path.join(akar, d),
    path.join(kerja, d),
  ]);
  salin(akar, kerja, [...lewati, ".cxx"]);
}

// Folder android/ dibuat ulang dari app.json (Continuous Native Generation); jangan disunting tangan.
jalankan("npx expo prebuild --platform android --no-install", kerja);
// Kode native hanya dikompilasi untuk arm64 (hampir semua ponsel Android sekarang) supaya build
// lebih cepat dan hemat disk. Untuk emulator x86_64: ARSITEKTUR=arm64-v8a,x86_64 npm run build:apk
const arsitektur = env.ARSITEKTUR ?? "arm64-v8a";
// Jalur lengkap: sebagian shell Windows tidak mencari program di folder kerja.
const android = path.join(kerja, "android");
jalankan(
  `"${path.join(android, windows ? "gradlew.bat" : "gradlew")}" assembleRelease -PreactNativeArchitectures=${arsitektur}`,
  android,
);

const apk = path.join(
  android,
  "app",
  "build",
  "outputs",
  "apk",
  "release",
  "app-release.apk",
);
mkdirSync(path.join(akar, "dist"), { recursive: true });
const tujuan = path.join(akar, "dist", "rangkul.apk");
copyFileSync(apk, tujuan);
console.log(`\nAPK siap: ${tujuan}`);
