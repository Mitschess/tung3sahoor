// Aplikasi Ibu memakai ulang logika web (src/lib, src/data) dan ilustrasi Buku KIA (public/kia)
// langsung dari proyek induk, supaya aturan klinis hanya ditulis di satu tempat.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const proyek = __dirname;
const induk = path.resolve(proyek, "..");
const bersama = path.join(induk, "src");
const gambar = path.join(induk, "public", "kia");

const config = getDefaultConfig(proyek);

config.watchFolders = [bersama, gambar];

const resolveAsli = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, nama, platform) => {
  const resolve = resolveAsli ?? context.resolveRequest;
  // "@/lib/…" dan "@/data/…" menunjuk ke src proyek induk (sama seperti alias di web).
  if (nama.startsWith("@/")) return resolve(context, path.join(bersama, nama.slice(2)), platform);
  // "~/…" menunjuk ke src aplikasi ini (komponen native).
  if (nama.startsWith("~/")) return resolve(context, path.join(proyek, "src", nama.slice(2)), platform);
  // Paket yang diimpor dari kode bersama dicari di node_modules aplikasi ini, bukan milik web,
  // supaya hanya ada satu salinan React dan zustand di dalam aplikasi. Gambar di public/kia juga
  // butuh ini: Metro mengubahnya menjadi modul yang mengimpor "react-native/asset-registry".
  const dariLuar = context.originModulePath.startsWith(bersama) || context.originModulePath.startsWith(gambar);
  if (dariLuar &&!nama.startsWith(".") && !path.isAbsolute(nama)) {
    return resolve({ ...context, originModulePath: path.join(proyek, "index.js") }, nama, platform);
  }
  return resolve(context, nama, platform);
};

module.exports = config;
