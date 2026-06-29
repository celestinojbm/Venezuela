"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { HelpRequest } from "@/lib/types";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => <div className="m-4 h-[70vh] animate-pulse rounded-2xl bg-slate-100" />,
});

export default function MapaPage() {
  return (
    <AuthGate>
      <MapaInner />
    </AuthGate>
  );
}

function MapaInner() {
  const { supabase } = useSupabase();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let activo = true;
    supabase
      .from("requests")
      .select("*")
      .eq("status", "abierta")
      .not("lat", "is", null)
      .limit(500)
      .then(({ data }) => {
        if (!activo) return;
        setRequests((data as HelpRequest[]) ?? []);
        setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [supabase]);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Mapa de solicitudes</h1>
      <p className="mb-3 text-sm text-slate-500">
        Solicitudes abiertas con ubicación. Toca un marcador para ver el detalle.
      </p>
      {cargando ? (
        <div className="h-[70vh] animate-pulse rounded-2xl bg-slate-100" />
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          Todavía no hay solicitudes con ubicación en el mapa.
        </div>
      ) : (
        <RequestsMap requests={requests} height="70vh" />
      )}
    </div>
  );
}
