"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import SetupNotice from "@/components/SetupNotice";
import Filters, { FILTROS_INICIALES, type FiltrosState } from "@/components/Filters";
import RequestCard from "@/components/RequestCard";
import VolunteerCard from "@/components/VolunteerCard";
import RedBuscador from "@/components/RedBuscador";
import AlertaSismica from "@/components/AlertaSismica";
import { Siren, ChevronRight, Globe, Hand, HeartHandshake, ExternalLink } from "lucide-react";
import { cx } from "@/lib/format";
import { telVE } from "@/lib/contacto";
import { URGENCIA_MAP } from "@/lib/constants";
import type { HelpRequest, VolunteerListing } from "@/lib/types";

type Pestana = "necesidades" | "voluntarios" | "red";

// Lógica cruzada (a propósito):
//  - "Necesito" muestra OFERTAS de voluntarios (a quién contactar para recibir ayuda).
//  - "Ayudar"   muestra SOLICITUDES de damnificados (a quién ayudar).

export default function HomePage() {
  const { configured, supabase } = useSupabase();
  const [tab, setTab] = useState<Pestana>("red"); // la Red es lo primero que se ve
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIALES);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [voluntarios, setVoluntarios] = useState<VolunteerListing[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!supabase || tab === "red") return; // la pestaña Red se sirve sola (API en vivo)
    setCargando(true);
    setError(null);

    if (tab === "voluntarios") {
      // "Ayudar" muestra a quién necesita ayuda (solicitudes).
      let q = supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (filtros.categoria !== "todas") q = q.eq("category", filtros.categoria);
      if (filtros.urgencia !== "todas") q = q.eq("urgency", filtros.urgencia);
      if (filtros.soloAbiertas) q = q.eq("status", "abierta");
      const { data, error } = await q;
      if (error) setError("No se pudieron cargar las solicitudes.");
      setRequests((data as HelpRequest[]) ?? []);
    } else {
      // "Necesito" muestra ofertas de voluntarios disponibles.
      let q = supabase
        .from("volunteer_listings")
        .select("*")
        .eq("status", "activo")
        .order("created_at", { ascending: false })
        .limit(300);
      if (filtros.categoria !== "todas") q = q.eq("category", filtros.categoria);
      const { data, error } = await q;
      if (error) setError("No se pudieron cargar las ofertas de ayuda.");
      setVoluntarios((data as VolunteerListing[]) ?? []);
    }
    setCargando(false);
  }, [supabase, tab, filtros.categoria, filtros.urgencia, filtros.soloAbiertas]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const requestsVisibles = useMemo(() => {
    const qq = filtros.busqueda.trim().toLowerCase();
    const f = qq
      ? requests.filter(
          (r) =>
            r.title.toLowerCase().includes(qq) ||
            r.description?.toLowerCase().includes(qq) ||
            r.location_text?.toLowerCase().includes(qq),
        )
      : requests;
    return [...f].sort((a, b) => {
      // Los que tienen WhatsApp disponible van primero.
      const wa = (telVE(a.contact_phone) ? 0 : 1) - (telVE(b.contact_phone) ? 0 : 1);
      if (wa !== 0) return wa;
      const ua = URGENCIA_MAP[a.urgency]?.orden ?? 9;
      const ub = URGENCIA_MAP[b.urgency]?.orden ?? 9;
      if (ua !== ub) return ua - ub;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [requests, filtros.busqueda]);

  const voluntariosVisibles = useMemo(() => {
    const qq = filtros.busqueda.trim().toLowerCase();
    const f = qq
      ? voluntarios.filter(
          (v) =>
            v.title.toLowerCase().includes(qq) ||
            v.description?.toLowerCase().includes(qq) ||
            v.location_text?.toLowerCase().includes(qq),
        )
      : voluntarios;
    return [...f].sort((a, b) => {
      // Los que tienen WhatsApp disponible van primero.
      const wa = (telVE(a.contact_phone) ? 0 : 1) - (telVE(b.contact_phone) ? 0 : 1);
      if (wa !== 0) return wa;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [voluntarios, filtros.busqueda]);

  if (!configured) return <SetupNotice />;

  // En "Necesito" se ven ofertas; en "Ayudar" se ven solicitudes.
  const lista = tab === "necesidades" ? voluntariosVisibles : requestsVisibles;

  return (
    <div className="space-y-4 px-4 py-4">
      <AlertaSismica />

      <Link
        href="/guia"
        className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white shadow-sm shadow-blue-600/25"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <Siren size={18} strokeWidth={2.5} /> Emergencias y guía de seguridad
        </span>
        <ChevronRight size={18} />
      </Link>

      <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <button
          onClick={() => setTab("red")}
          className={cx(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition-colors",
            tab === "red" ? "bg-white text-marca-700 shadow-sm" : "text-slate-500",
          )}
        >
          <Globe size={16} /> Red
        </button>
        <button
          onClick={() => setTab("necesidades")}
          className={cx(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition-colors",
            tab === "necesidades" ? "bg-white text-marca-700 shadow-sm" : "text-slate-500",
          )}
        >
          <Hand size={16} /> Necesito
        </button>
        <button
          onClick={() => setTab("voluntarios")}
          className={cx(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition-colors",
            tab === "voluntarios" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500",
          )}
        >
          <HeartHandshake size={16} /> Ayudar
        </button>
      </div>

      {tab === "red" ? (
        <>
          <p className="text-sm text-slate-500">
            Busca en <strong>22 plataformas</strong> de ayuda a la vez: desaparecidos, localizados,
            hospitalizados, acopio, donación y recursos. Cada resultado enlaza a su fuente.
          </p>
          <RedBuscador />
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {tab === "necesidades"
              ? "Personas y voluntarios que ofrecen ayuda (techo, transporte, comida…). Contáctalos directo, o publica lo que necesitas."
              : "Personas damnificadas que necesitan ayuda. Contáctalas para ayudar, o publica tu ofrecimiento."}
          </p>

          <Filters value={filtros} onChange={setFiltros} ocultarUrgencia={tab === "necesidades"} />

          {tab === "necesidades" ? (
            <>
              <Link
                href="/solicitudes/nueva"
                className="flex items-center justify-between rounded-2xl bg-marca-600 px-4 py-3 text-white"
              >
                <span className="text-sm font-bold">¿No encuentras lo que necesitas? Publica tu solicitud</span>
                <ChevronRight size={18} />
              </Link>

              <a
                href="https://redayudavenezuela.com/ayuda/voluntarios"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
              >
                <span className="text-sm font-medium">Ver más voluntarios en Red de Emergencia</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  externo <ExternalLink size={12} />
                </span>
              </a>
            </>
          ) : (
            <Link
              href="/voluntarios/nuevo"
              className="flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-3 text-white"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <HeartHandshake size={18} /> ¿Puedes ayudar? Ofrécete como voluntario
              </span>
              <ChevronRight size={18} />
            </Link>
          )}

          {cargando ? (
            <ListaEsqueleto />
          ) : error ? (
            <p className="rounded-xl bg-peligro-50 px-4 py-3 text-sm text-peligro-700">{error}</p>
          ) : lista.length === 0 ? (
            <EstadoVacio tab={tab} />
          ) : (
            <>
              <p className="text-xs font-medium text-slate-400">{lista.length} resultados</p>
              <ul className="space-y-3">
                {tab === "necesidades"
                  ? voluntariosVisibles.map((vol) => (
                      <li key={vol.id}>
                        <VolunteerCard vol={vol} />
                      </li>
                    ))
                  : requestsVisibles.map((req) => (
                      <li key={req.id}>
                        <RequestCard req={req} />
                      </li>
                    ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ListaEsqueleto() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </ul>
  );
}

function EstadoVacio({ tab }: { tab: Exclude<Pestana, "red"> }) {
  // "Necesito" lista ofertas; "Ayudar" lista solicitudes.
  const esNecesito = tab === "necesidades";
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">
        {esNecesito
          ? "Todavía no hay ofertas de ayuda con estos filtros."
          : "Todavía no hay solicitudes con estos filtros."}
      </p>
      <Link
        href={esNecesito ? "/solicitudes/nueva" : "/voluntarios/nuevo"}
        className="mt-4 inline-block rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-bold text-white"
      >
        {esNecesito ? "Publicar lo que necesito" : "Ofrecer mi ayuda"}
      </Link>
    </div>
  );
}
