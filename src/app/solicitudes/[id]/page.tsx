"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { CategoryBadge, StatusBadge, UrgencyBadge } from "@/components/Badges";
import ChatThread from "@/components/ChatThread";
import { ESTADOS, type EstadoValue } from "@/lib/constants";
import { cx, enlaceWhatsApp, tiempoRelativo } from "@/lib/format";
import type { HelpRequestWithAuthor, Offer, OfferWithRelations } from "@/lib/types";

const RequestsMap = dynamic(() => import("@/components/map/RequestsMap"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />,
});

export default function DetalleSolicitudPage({ params }: { params: { id: string } }) {
  return (
    <AuthGate>
      <Detalle id={params.id} />
    </AuthGate>
  );
}

function Detalle({ id }: { id: string }) {
  const { supabase, user } = useSupabase();
  const [req, setReq] = useState<HelpRequestWithAuthor | null>(null);
  const [ofertas, setOfertas] = useState<OfferWithRelations[]>([]);
  const [miOferta, setMiOferta] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [noExiste, setNoExiste] = useState(false);

  const esAutor = !!req && !!user && req.author_id === user.id;

  const cargar = useCallback(async () => {
    if (!supabase || !user) return;
    setLoading(true);

    const { data: r } = await supabase
      .from("requests")
      .select("*, author:profiles!requests_author_id_fkey(id, full_name)")
      .eq("id", id)
      .maybeSingle();

    if (!r) {
      setNoExiste(true);
      setLoading(false);
      return;
    }
    const request = r as HelpRequestWithAuthor;
    setReq(request);

    if (request.author_id === user.id) {
      const { data: ofs } = await supabase
        .from("offers")
        .select("*, volunteer:profiles!offers_volunteer_id_fkey(id, full_name)")
        .eq("request_id", id)
        .order("created_at", { ascending: true });
      setOfertas((ofs as OfferWithRelations[]) ?? []);
    } else {
      const { data: mine } = await supabase
        .from("offers")
        .select("*")
        .eq("request_id", id)
        .eq("volunteer_id", user.id)
        .maybeSingle();
      setMiOferta((mine as Offer) ?? null);
    }
    setLoading(false);
  }, [supabase, user, id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

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

      {/* Encabezado */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <UrgencyBadge value={req.urgency} />
          <CategoryBadge value={req.category} />
          <StatusBadge value={req.status} />
        </div>
        <h1 className="text-xl font-bold leading-snug text-slate-900">{req.title}</h1>
        <p className="mt-1 text-xs text-slate-400">
          Publicada {tiempoRelativo(req.created_at)}
          {req.author?.full_name ? ` · por ${req.author.full_name}` : ""}
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

      {/* Mapa */}
      {req.lat != null && req.lng != null && (
        <RequestsMap requests={[req]} height={220} enlazar={false} />
      )}

      {/* Contacto directo (solo si no eres el autor) */}
      {!esAutor && req.contact_phone && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Contacto directo</p>
          <p className="text-xs text-emerald-700">{req.contact_phone}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={enlaceWhatsApp(req.contact_phone, `Hola, vi tu solicitud "${req.title}" en Manos Venezuela y quiero ayudarte.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-bold text-white"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${req.contact_phone.replace(/[^\d+]/g, "")}`}
              className="flex-1 rounded-xl border border-emerald-300 bg-white py-2.5 text-center text-sm font-bold text-emerald-700"
            >
              Llamar
            </a>
          </div>
        </div>
      )}

      {/* Vista del autor */}
      {esAutor ? (
        <VistaAutor
          req={req}
          ofertas={ofertas}
          onCambioEstado={cargar}
          onRespuesta={cargar}
        />
      ) : (
        <VistaVoluntario req={req} miOferta={miOferta} onCambio={cargar} />
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

// ---------------------------------------------------------------------------
// Vista del autor (damnificado): gestiona estado y ofertas recibidas.
// ---------------------------------------------------------------------------
function VistaAutor({
  req,
  ofertas,
  onCambioEstado,
  onRespuesta,
}: {
  req: HelpRequestWithAuthor;
  ofertas: OfferWithRelations[];
  onCambioEstado: () => void;
  onRespuesta: () => void;
}) {
  const { supabase } = useSupabase();
  const [guardando, setGuardando] = useState(false);

  async function cambiarEstado(status: EstadoValue) {
    if (!supabase) return;
    setGuardando(true);
    await supabase.from("requests").update({ status }).eq("id", req.id);
    setGuardando(false);
    onCambioEstado();
  }

  async function responder(offerId: string, status: "aceptada" | "rechazada") {
    if (!supabase) return;
    await supabase.from("offers").update({ status }).eq("id", offerId);
    if (status === "aceptada" && req.status === "abierta") {
      await supabase.from("requests").update({ status: "en_proceso" }).eq("id", req.id);
    }
    onRespuesta();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">Estado de tu solicitud</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              disabled={guardando}
              onClick={() => cambiarEstado(e.value)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-50",
                req.status === e.value
                  ? "border-marca-600 bg-marca-600 text-white"
                  : "border-slate-200 bg-white text-slate-600",
              )}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold text-slate-800">
          Ofertas de ayuda ({ofertas.length})
        </h2>
        {ofertas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
            Aún nadie ha ofrecido ayuda. Te avisaremos cuando alguien responda.
          </p>
        ) : (
          <ul className="space-y-3">
            {ofertas.map((of) => (
              <li key={of.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {of.volunteer?.full_name?.trim() || "Voluntario/a"}
                    </p>
                    <EstadoOferta status={of.status} />
                  </div>
                  {of.status === "pendiente" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => responder(of.id, "aceptada")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => responder(of.id, "rechazada")}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>

                {of.message && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    “{of.message}”
                  </p>
                )}

                {of.status !== "rechazada" && (
                  <div className="mt-3">
                    <ChatThread offerId={of.id} otroNombre={of.volunteer?.full_name} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista del voluntario: ofrecer ayuda y chatear.
// ---------------------------------------------------------------------------
function VistaVoluntario({
  req,
  miOferta,
  onCambio,
}: {
  req: HelpRequestWithAuthor;
  miOferta: Offer | null;
  onCambio: () => void;
}) {
  const { supabase, user } = useSupabase();
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ofrecer() {
    if (!supabase || !user) return;
    setEnviando(true);
    setError(null);
    const { error } = await supabase.from("offers").insert({
      request_id: req.id,
      volunteer_id: user.id,
      message: mensaje.trim() || null,
    });
    setEnviando(false);
    if (error) {
      setError("No se pudo enviar tu oferta. Intenta de nuevo.");
      return;
    }
    onCambio();
  }

  if (miOferta) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-800">Ya ofreciste tu ayuda</p>
          <EstadoOferta status={miOferta.status} />
          <p className="mt-1 text-xs text-slate-500">
            Coordina los detalles por el chat. La persona recibirá tus mensajes.
          </p>
        </div>
        <ChatThread offerId={miOferta.id} otroNombre={req.author?.full_name} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-marca-200 bg-marca-50 p-4">
      <p className="text-sm font-bold text-slate-800">¿Puedes ayudar con esto?</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Envía una oferta y abre un chat para coordinar.
      </p>
      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Mensaje (opcional): cómo puedes ayudar, cuándo, etc."
        className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-marca-500"
      />
      {error && <p className="mt-2 text-xs text-peligro-600">{error}</p>}
      <button
        onClick={ofrecer}
        disabled={enviando}
        className="mt-3 w-full rounded-xl bg-marca-600 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "🤝 Ofrecer ayuda"}
      </button>
    </div>
  );
}

function EstadoOferta({ status }: { status: Offer["status"] }) {
  const map: Record<Offer["status"], { label: string; className: string }> = {
    pendiente: { label: "Pendiente", className: "text-amber-600" },
    aceptada: { label: "Aceptada ✓", className: "text-emerald-600" },
    rechazada: { label: "Rechazada", className: "text-slate-400" },
    completada: { label: "Completada", className: "text-slate-500" },
  };
  const e = map[status];
  return <span className={cx("text-xs font-semibold", e.className)}>{e.label}</span>;
}
