// Plugin konfigurasi Expo: semua modul Android memakai CMake 3.31 dari Android SDK.
// CMake 3.22 bawaan membawa Ninja 1.10 yang tidak mendukung jalur panjang di Windows, padahal
// kode C++ hasil codegen New Architecture (mis. react-native-gesture-handler) menghasilkan jalur
// berkas objek di atas 260 karakter. Ninja di CMake 3.31 mendukungnya (Windows perlu
// LongPathsEnabled=1). Gradle mengunduh versi ini sendiri bila belum terpasang.
const { withProjectBuildGradle } = require("expo/config-plugins");

const VERSI = "3.31.6";
const PENANDA = "// [cmake-baru]";

const blok = `${PENANDA} lihat mobile/plugins/cmake-baru.js
subprojects { proyek ->
  ["com.android.application", "com.android.library"].each { id ->
    proyek.plugins.withId(id) {
      proyek.android.externalNativeBuild.cmake.version = "${VERSI}"
    }
  }
}

`;

module.exports = function cmakeBaru(config) {
  return withProjectBuildGradle(config, (cfg) => {
    const isi = cfg.modResults.contents;
    if (isi.includes(PENANDA)) return cfg;
    // Harus sebelum plugin root React Native, yang langsung mengevaluasi proyek :app.
    const jangkar = 'apply plugin: "expo-root-project"';
    cfg.modResults.contents = isi.includes(jangkar)
      ? isi.replace(jangkar, blok + jangkar)
      : isi + "\n" + blok;
    return cfg;
  });
};
