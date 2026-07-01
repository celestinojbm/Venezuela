import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Public_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Cuerpo / interfaz.
const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

// Titulares (serif institucional).
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const SITE_URL = "https://manosvenezuela.com";
const DESCRIPCION =
  "Plataforma solidaria para conectar a personas voluntarias con damnificados por el terremoto de junio de 2026 en Venezuela. Publica o encuentra ayuda cerca de ti.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Manos Venezuela — Ayuda directa",
  description: DESCRIPCION,
  manifest: "/manifest.webmanifest",
  applicationName: "Manos Venezuela",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Manos Venezuela",
  },
  // Los íconos los sirven las convenciones de archivo src/app/icon.svg y
  // src/app/apple-icon.tsx. Next las publica con una URL con hash de contenido,
  // así el navegador no se queda con el ícono viejo en caché al cambiarlo.
  // (No declaramos `icons` aquí: metadata.icons anularía esas convenciones.)
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: "Manos Venezuela",
    title: "Manos Venezuela — Ayuda directa entre vecinos",
    description: DESCRIPCION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Manos Venezuela — Ayuda directa entre vecinos",
    description: DESCRIPCION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B3D91",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${publicSans.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
