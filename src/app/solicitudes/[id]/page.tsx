"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { CategoryBadge, StatusBadge, UrgencyBadge } from "@/components/Badges";
import ContactButtons from "@/components/ContactButtons";
import { tiempoRelativo } from "@/lib/format";
import type { HelpRequest } from "@/lib/types";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />,
});

export default function DetalleSolicitudPage({ params }: { params: { id: string } }) {
  return (
    <AuthGate>
      <Detalle id={params.id} />
    </AuthGate>
  );
}

function Detalle({ id }: { id: string }) {
  const { supabase } = useSupabase();
  const [req, setReq] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [noExiste, setNoExiste] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let activo = true;
    supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!activo) return;
        if (!data) setNoExiste(true);
        else setReq(data as HelpRequest);
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [supabase, id]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-marca-600" />
      </div>
    );
  }

  if (noExiste || !req) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="text-4xl">🤷</div>
        <p className="mt-3 font-semibold text-slate-700">Esta solicitud no existe o fue retirada.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-marca-600">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <Link href="/" className="text-sm font-medium text-slate-400">
        ← Volver
      </Link>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <UrgencyBadge value={req.urgency} />
          <CategoryBadge value={req.category} />
          <StatusBadge value={req.status} />
        </div>
        <h1 className="text-xl font-bold leading-snug text-slate-900">{req.title}</h1>
        <p className="mt-1 text-xs text-slate-400">
          Publicada {tiempoRelativo(req.created_at)}
          {req.author_name ? ` · por ${req.author_name}` : ""}
        </p>
      </div>

      {req.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {req.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {req.location_text && (
          <Dato icon="📍" label="Zona">
            {req.location_text}
          </Dato>
        )}
        {req.people_count != null && (
          <Dato icon="👥" label="Personas">
            {req.people_count}
          </Dato>
        )}
      </div>

      {req.lat != null && req.lng != null && (
        <RequestsMap requests={[req]} height={220} enlazar={false} />
      )}

      {req.contact_phone ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Contacta directamente</p>
          <p className="mb-3 text-xs text-emerald-700">{req.contact_phone}</p>
          <ContactButtons
            phone={req.contact_phone}
            mensaje={`Hola, vi tu solicitud "${req.title}" en Manos Venezuela y quiero ayudarte.`}
          />
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Esta solicitud no incluye un teléfono de contacto.
        </p>
      )}
    </div>
  );
}

function Dato({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <span aria-hidden>{icon}</span> {label}
      </div>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}
