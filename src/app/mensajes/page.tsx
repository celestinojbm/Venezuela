"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { CategoryBadge } from "@/components/Badges";
import { tiempoRelativo } from "@/lib/format";
import type { OfferWithRelations } from "@/lib/types";

export default function MensajesPage() {
  return (
    <AuthGate>
      <MensajesInner />
    </AuthGate>
  );
}

function MensajesInner() {
  const { supabase, user } = useSupabase();
  const [ofertas, setOfertas] = useState<OfferWithRelations[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase || !user) return;
    let activo = true;
    supabase
      .from("offers")
      .select(
        "*, request:requests(id,title,category,urgency,status,author_id), volunteer:profiles!offers_volunteer_id_fkey(id,full_name)",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!activo) return;
        setOfertas((data as OfferWithRelations[]) ?? []);
        setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [supabase, user]);

  if (cargando) {
    return (
      <div className="grid place-items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-marca-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-3 text-xl font-bold text-slate-900">Mensajes</h1>
      {ofertas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center">
          <div className="text-3xl">💬</div>
          <p className="mt-2 text-sm font-medium text-slate-600">No tienes conversaciones aún</p>
          <p className="mt-1 text-xs text-slate-400">
            Cuando ofrezcas ayuda o alguien responda a tu solicitud, aparecerán aquí.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Ver solicitudes
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {ofertas.map((of) => {
            const soyVoluntario = of.volunteer_id === user?.id;
            return (
              <li key={of.id}>
                <Link
                  href={`/solicitudes/${of.request_id}`}
                  className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {soyVoluntario ? "🤝 Estoy ayudando" : "🆘 Mi solicitud"}
                    </span>
                    <span className="text-xs text-slate-400">{tiempoRelativo(of.created_at)}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-900">
                    {of.request?.title ?? "Solicitud"}
                  </h3>
                  <div className="mt-1.5">
                    {of.request && <CategoryBadge value={of.request.category} />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
