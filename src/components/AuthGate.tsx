"use client";

import { useSupabase } from "@/components/providers/SupabaseProvider";
import SetupNotice from "@/components/SetupNotice";

/**
 * La app es pública (sin login). Este componente solo verifica que Supabase
 * esté configurado; si no, muestra la pantalla guiada.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { configured } = useSupabase();
  if (!configured) return <SetupNotice />;
  return <>{children}</>;
}
