"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import SetupNotice from "@/components/SetupNotice";
import Welcome from "@/components/Welcome";
import Filters, { FILTROS_INICIALES, type FiltrosState } from "@/components/Filters";
import RequestCard from "@/components/RequestCard";
import { URGENCIA_MAP } from "@/lib/constants";
import type { HelpRequestWithAuthor } from "@/lib/types";

export default function HomePage() {
  const { configured, user, loading, supabase } = useSupabase();
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIALES);
  const [requests, setRequests] = useState<HelpRequestWithAuthor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!supabase || !user) return;
    setCargando(true);
    setError(null);

    let query = supabase
      .from("requests")
      .select("*, author:profiles!requests_author_id_fkey(id, full_name)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (filtros.categoria !== "todas") query = query.eq("category", filtros.categoria);
    if (filtros.urgencia !== "todas") query = query.eq("urgency", filtros.urgencia);
    if (filtros.soloAbiertas) query = query.eq("status", "abierta");

    const { data, error } = await query;
    if (error) {
      setError("No se pudieron cargar las solicitudes. Intenta de nuevo.");
      setRequests([]);
    } else {
      setRequests((data as HelpRequestWithAuthor[]) ?? []);
    }
    setCargando(false);
  }, [supabase, user, filtros.categoria, filtros.urgencia, filtros.soloAbiertas]);

  useEffect(() => {
    if (user) void cargar();
  }, [user, cargar]);

  // Búsqueda por texto (cliente) + orden por urgencia y fecha.
  const visibles = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase();
    const filtradas = q
      ? requests.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q) ||
            r.location_text?.toLowerCase().includes(q),
        )
      : requests;
    return [...filtradas].sort((a, b) => {
      const ua = URGENCIA_MAP[a.urgency]?.orden ?? 9;
      const ub = URGENCIA_MAP[b.urgency]?.orden ?? 9;
      if (ua !== ub) return ua - ub;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [requests, filtros.busqueda]);

  if (!configured) return <SetupNotice />;
  if (loading) return <CargandoPantalla />;
  if (!user) return <Welcome />;

  return (
    <div className="space-y-4 px-4 py-4">
      <Filters value={filtros} onChange={setFiltros} />

      {cargando ? (
        <ListaEsqueleto />
      ) : error ? (
        <p className="rounded-xl bg-peligro-50 px-4 py-3 text-sm text-peligro-700">{error}</p>
      ) : visibles.length === 0 ? (
        <EstadoVacio />
      ) : (
        <>
          <p className="text-xs font-medium text-slate-400">
            {visibles.length} {visibles.length === 1 ? "solicitud" : "solicitudes"}
          </p>
          <ul className="space-y-3">
            {visibles.map((req) => (
              <li key={req.id}>
                <RequestCard req={req} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function CargandoPantalla() {
  return (
    <div className="grid place-items-center py-20 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-marca-600" />
    </div>
  );
}

function ListaEsqueleto() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </ul>
  );
}

function EstadoVacio() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center">
      <div className="text-3xl">🔍</div>
      <p className="mt-2 text-sm font-medium text-slate-600">
        No hay solicitudes con estos filtros
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Prueba a cambiar la categoría o la urgencia.
      </p>
    </div>
  );
}
