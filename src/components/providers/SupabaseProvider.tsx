"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface SupabaseContextValue {
  configured: boolean;
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured;
  // El cliente sólo existe si hay configuración; se memoiza para mantener el singleton.
  const supabase = useMemo(
    () => (configured ? getSupabaseBrowser() : null),
    [configured],
  );

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileFor = useRef<string | null>(null);

  async function cargarPerfil(client: SupabaseClient, userId: string) {
    const { data } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
    profileFor.current = userId;
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let activo = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return;
      setSession(data.session);
      if (data.session?.user) {
        await cargarPerfil(supabase, data.session.user.id);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      const uid = nextSession?.user?.id ?? null;
      if (uid && uid !== profileFor.current) {
        void cargarPerfil(supabase, uid);
      }
      if (!uid) {
        setProfile(null);
        profileFor.current = null;
      }
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const value: SupabaseContextValue = {
    configured,
    supabase,
    session,
    user: session?.user ?? null,
    profile,
    loading,
    async refreshProfile() {
      if (supabase && session?.user) await cargarPerfil(supabase, session.user.id);
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut();
    },
  };

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase(): SupabaseContextValue {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase debe usarse dentro de <SupabaseProvider>");
  return ctx;
}
