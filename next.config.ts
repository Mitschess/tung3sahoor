import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Halaman aplikasi dirender di klien dari data lokal (localStorage), jadi validasi "instant navigation"
  // hanya dijalankan untuk segmen yang secara eksplisit memintanya.
  experimental: {
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
