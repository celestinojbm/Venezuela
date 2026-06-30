import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import IndicadorOffline from "@/components/IndicadorOffline";
import SOSFlotante from "@/components/SOSFlotante";

// Chrome de la aplicación (contenedor móvil, encabezado, navegación inferior).
// Vive en el grupo (app) para que la landing de marketing quede fuera de él.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col bg-white shadow-sm">
        <IndicadorOffline />
        <Header />
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
      </div>
      <SOSFlotante />
    </SupabaseProvider>
  );
}
