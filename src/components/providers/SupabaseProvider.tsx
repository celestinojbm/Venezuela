"use client";

import { createContext, useContext, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

// La app es de acceso público: no hay login. El proveedor solo expone el
// cliente de Supabase (rol anónimo) para leer y publicar sin cuenta.
interface SupabaseContextValue {
  configured: boolean;
  supabase: SupabaseClient | null;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured;
  const supabase = useMemo(
    () => (configured ? getSupabaseBrowser() : null),
    [configured],
  );
  return (
    <SupabaseContext.Provider value={{ configured, supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextValue {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase debe usarse dentro de <SupabaseProvider>");
  return ctx;
}
