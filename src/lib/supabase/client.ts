"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// URL y clave pública (anon / publishable) del proyecto Supabase.
// Configúralas en .env.local (ver .env.example).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Indica si las variables de entorno de Supabase están presentes.
 * La interfaz lo usa para mostrar una pantalla de configuración amigable
 * en lugar de fallar cuando el backend todavía no está conectado.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let cliente: SupabaseClient | null = null;

/**
 * Devuelve un cliente de Supabase para el navegador (singleton).
 * Lanza un error claro si falta la configuración: las llamadas deben
 * protegerse con `isSupabaseConfigured` antes de usarlo.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
    );
  }
  if (!cliente) {
    cliente = createBrowserClient(url as string, anonKey as string);
  }
  return cliente;
}
