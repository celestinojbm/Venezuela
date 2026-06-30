"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { HelpRequest } from "@/lib/types";
import type { RedPunto } from "@/components/map/RequestsMap";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => <div className="h-[68vh] animate-pulse rounded-2xl bg-slate-100" />,
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
  const [red, setRed] = useState<RedPunto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    // Solicitudes propias geolocalizadas (cuando existan).
    const pReq: Promise<HelpRequest[]> = (async () => {
      if (!supabase) return [];
      const { data } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "abierta")
        .not("lat", "is", null)
        .limit(500);
      return (data as HelpRequest[]) ?? [];
    })();

    // Puntos de la Red: centros de acopio, donación y recursos geolocalizados.
    const pRed: Promise<RedPunto[]> = fetch("/api/red/mapa")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d?.puntos) ? (d.puntos as RedPunto[]) : []))
      .catch(() => []);

    Promise.all([pReq, pRed]).then(([reqs, pts]) => {
      if (!activo) return;
      setRequests(reqs);
      setRed(pts);
      setCargando(false);
    });

    return () => {
      activo = false;
    };
  }, [supabase]);

  const total = requests.length + red.length;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Mapa de ayuda</h1>
      <p className="mb-3 text-sm text-slate-500">
        Centros de acopio, donación y recursos cercanos. Las solicitudes de ayuda aparecerán aquí
        también. Toca un marcador para ver el detalle.
      </p>

      {cargando ? (
        <div className="h-[68vh] animate-pulse rounded-2xl bg-slate-100" />
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          No pudimos cargar puntos en el mapa ahora mismo. Revisa tu conexión e intenta de nuevo.
        </div>
      ) : (
        <>
          <RequestsMap requests={requests} red={red} height="68vh" />
          <Leyenda />
          <p className="mt-2 text-center text-[11px] text-slate-400">
            {requests.length > 0 ? `${requests.length} solicitud(es) · ` : ""}
            {red.length} puntos de la Red Humanitaria de Datos
          </p>
        </>
      )}
    </div>
  );
}

function Leyenda() {
  const items = [
    { c: "#dc2626", t: "Solicitudes" },
    { c: "#d97706", t: "Acopio" },
    { c: "#7c3aed", t: "Donación" },
    { c: "#0d9488", t: "Recursos" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((i) => (
        <span key={i.t} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="inline-block h-3 w-3 rounded-full border border-white shadow"
            style={{ background: i.c }}
          />
          {i.t}
        </span>
      ))}
    </div>
  );
}
