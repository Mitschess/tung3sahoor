import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Aplikasi Android Ibu (Expo) punya lint sendiri: cd mobile && npx expo lint
    "mobile/**",
    // Video demo (Remotion) punya konfigurasi sendiri di video/.
    "video/**",
  ]),
]);

export default eslintConfig;
