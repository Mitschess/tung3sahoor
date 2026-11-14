// Menjalankan `next dev` aplikasi Rangkul dalam mode demo (data fiktif, tanpa Supabase/Gemini)
// untuk mengambil tangkapan layar video. Jalankan dari folder akar proyek:
//   node video/scripts/server-demo.cjs        (port 3300, atau PORT=xxxx)
for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "GEMINI_API_KEY"]) process.env[k] = "";
process.argv = [process.argv[0], "next", "dev", "-p", process.env.PORT || "3300"];
require(require("path").resolve("node_modules/next/dist/bin/next"));
