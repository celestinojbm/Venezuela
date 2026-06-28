import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Manos Venezuela — Ayuda directa",
  description:
    "Plataforma solidaria para conectar a personas voluntarias con damnificados por la catástrofe en Venezuela. Publica o encuentra ayuda cerca de ti.",
  manifest: "/manifest.webmanifest",
  applicationName: "Manos Venezuela",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Manos Venezuela",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
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
    <html lang="es">
      <body className="min-h-screen font-sans">
        <SupabaseProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col bg-white shadow-sm">
            <Header />
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </div>
          <ServiceWorkerRegister />
        </SupabaseProvider>
      </body>
    </html>
  );
}
