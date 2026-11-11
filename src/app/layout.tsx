import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOMCARE · Buku KIA yang tidak berhenti di kertas",
  description:
    "MOMCARE membantu kader, bidan, dan dokter memastikan tidak ada ibu hamil dan bayi baru lahir yang terlewat. Isi medis mengikuti Buku KIA Kemenkes 2024.",
};

export const viewport: Viewport = {
  themeColor: "#2f8af5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
