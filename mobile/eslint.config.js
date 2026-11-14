// Aturan lint aplikasi Ibu. Konfigurasi web di ../eslint.config.mjs sengaja mengabaikan folder ini.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "android/*", "ios/*", ".expo/*", "src/ui/sumber-gambar.ts"],
  },
]);
