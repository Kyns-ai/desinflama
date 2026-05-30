import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { StoreHydrator } from "@/components/StoreHydrator";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Fraunces: serifa óptica, quente e feminina — usada nos momentos emocionais.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  applicationName: "Desinflama",
  title: {
    default: "Desinflama — seu intestino, sem inchaço",
    template: "%s · Desinflama",
  },
  description:
    "O programa de 14 dias que descobre o que te incha e devolve sua barriga leve, sua energia e sua pele — sem dieta de calorias.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Desinflama",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.webp", type: "image/webp", sizes: "192x192" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} antialiased`}
    >
      <body>
        <StoreHydrator />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
