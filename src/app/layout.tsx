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
  // Sai da promessa em `content/promise.ts`, que é a fonte única. Estava com
  // o texto antigo (14 dias, "barriga leve") e é isto que o Google e o
  // WhatsApp mostram — desencontro aqui é desencontro na cara de quem recebe
  // o link.
  description:
    "Coma para desinflamar, não para contar caloria. Em 21 dias você monta uma rotina que não te incha — e junto vêm energia, sono e pele.",
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
  themeColor: "#F2ECE3",
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
