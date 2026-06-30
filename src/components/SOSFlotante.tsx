"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/components/providers/SupabaseProvider";

// Botón flotante "Tengo una emergencia": se puede arrastrar a cualquier parte
// (su posición se recuerda). Al tocarlo, capta la ubicación, deja pedir ayuda
// (911 / WhatsApp) y PUBLICA una solicitud crítica que aparece en el sitio
// para que voluntarios cercanos puedan encontrar a la persona.

type Pos = { x: number; y: number };
type Geo = { lat: number; lng: number; acc: number | null };

const LS_POS = "sos_pos";
const LS_TEL = "sos_tel";
const LS_NOM = "sos_nombre";
const BTN_W = 224;
const BTN_H = 54;
const UMBRAL = 8; // px para distinguir un toque de un arrastre

function clamp(p: Pos): Pos {
  if (typeof window === "undefined") return p;
  const maxX = Math.max(6, window.innerWidth - BTN_W - 6);
  const maxY = Math.max(6, window.innerHeight - BTN_H - 6);
  return { x: Math.min(Math.max(6, p.x), maxX), y: Math.min(Math.max(6, p.y), maxY) };
}

export default function SOSFlotante() {
  const { supabase } = useSupabase();
  const [montado, setMontado] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [abierto, setAbierto] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  useEffect(() => {
    setMontado(true);
    try {
      const guardado = localStorage.getItem(LS_POS);
      if (guardado) {
        const p = JSON.parse(guardado);
        if (typeof p.x === "number" && typeof p.y === "number") {
          setPos(clamp(p));
          return;
        }
      }
    } catch {
      /* ignore */
    }
    // Por defecto: esquina inferior derecha, sobre la barra de navegación.
    setPos(clamp({ x: window.innerWidth - BTN_W - 14, y: window.innerHeight - BTN_H - 96 }));
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) > UMBRAL) d.moved = true;
    if (d.moved) setPos(clamp({ x: d.ox + dx, y: d.oy + dy }));
  }
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      try {
        localStorage.setItem(LS_POS, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    } else {
      setAbierto(true); // fue un toque, no un arrastre
    }
  }

  if (!montado) return null;

  return (
    <>
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ left: pos.x, top: pos.y, width: BTN_W, height: BTN_H, touchAction: "none" }}
        className="fixed z-50 flex select-none items-center justify-center gap-2 rounded-full bg-peligro-600 text-white shadow-xl ring-4 ring-peligro-600/25 active:scale-95"
        aria-label="Tengo una emergencia"
      >
        <span className="text-xl" aria-hidden>
          🆘
        </span>
        <span className="text-sm font-extrabold text-white">Tengo una emergencia</span>
      </button>

      {abierto && <SOSModal onClose={() => setAbierto(false)} supabase={supabase} />}
    </>
  );
}

function SOSModal({
  onClose,
  supabase,
}: {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
}) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [geoEstado, setGeoEstado] = useState<"buscando" | "ok" | "error">("buscando");
  const [tel, setTel] = useState("");
  const [nombre, setNombre] = useState("");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ id: string | null } | null>(null);

  useEffect(() => {
    try {
      setTel(localStorage.getItem(LS_TEL) ?? "");
      setNombre(localStorage.getItem(LS_NOM) ?? "");
    } catch {
      /* ignore */
    }
    capturar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capturar() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoEstado("error");
      return;
    }
    setGeoEstado("buscando");
    const ok = (p: GeolocationPosition) => {
      setGeo({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy ?? null });
      setGeoEstado("ok");
    };
    // Alta precisión primero; si falla, reintento con baja precisión (más fiable).
    navigator.geolocation.getCurrentPosition(
      ok,
      () =>
        navigator.geolocation.getCurrentPosition(ok, () => setGeoEstado("error"), {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }

  const mapsUrl = geo ? `https://maps.google.com/?q=${geo.lat},${geo.lng}` : "";
  const waText =
    `🆘 Necesito ayuda urgente.` +
    (nombre.trim() ? ` Soy ${nombre.trim()}.` : "") +
    (nota.trim() ? ` ${nota.trim()}.` : "") +
    (geo ? ` Mi ubicación: ${mapsUrl}` : "");

  async function enviar() {
    if (!tel.trim()) {
      setError("Pon un teléfono para que puedan contactarte.");
      return;
    }
    setError(null);
    try {
      localStorage.setItem(LS_TEL, tel.trim());
      localStorage.setItem(LS_NOM, nombre.trim());
    } catch {
      /* ignore */
    }
    if (!supabase) {
      setError("Sin conexión con el servidor. Usa WhatsApp o llama al 911.");
      return;
    }
    setEnviando(true);
    const titulo = (nota.trim() ? `🚨 ${nota.trim()}` : "🚨 Tengo una emergencia").slice(0, 140);
    const descripcion =
      "Emergencia publicada desde el botón de ayuda rápida." +
      (geo ? ` Ubicación: ${mapsUrl}` : "");
    const { data, error: errFn } = await supabase.functions.invoke("publicar", {
      body: {
        tipo: "solicitud",
        honeypot: "",
        payload: {
          author_name: nombre.trim() || null,
          title: titulo,
          category: "rescate",
          urgency: "critica",
          description: descripcion,
          location_text: geo ? "Ubicación GPS compartida" : null,
          contact_phone: tel.trim(),
          lat: geo?.lat ?? null,
          lng: geo?.lng ?? null,
        },
      },
    });
    setEnviando(false);
    if (errFn || !data?.ok) {
      setError("No se pudo publicar. Intenta de nuevo o llama al 911.");
      return;
    }
    setExito({ id: data.id ?? null });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-extrabold text-peligro-700">🆘 Tengo una emergencia</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-slate-400">
            ×
          </button>
        </div>

        {exito ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              ✅ <strong>Tu emergencia se publicó.</strong> Ya aparece en la app con tu ubicación y
              contacto para que puedan encontrarte y ayudarte.
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold text-white"
            >
              💬 Compartir por WhatsApp
            </a>
            <a
              href="tel:911"
              className="block rounded-xl bg-peligro-600 py-3.5 text-center text-sm font-bold text-white"
            >
              📞 Llamar al 911
            </a>
            {exito.id && (
              <Link
                href={`/solicitudes/${exito.id}`}
                onClick={onClose}
                className="block rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-bold text-slate-700"
              >
                Ver mi solicitud
              </Link>
            )}
            <button onClick={onClose} className="block w-full pt-1 text-center text-xs font-medium text-slate-400">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Comparte tu ubicación y un contacto. Tu pedido se publica al instante para que la
              ayuda llegue rápido.
            </p>

            {/* Llamar 911: lo más rápido en una emergencia real */}
            <a
              href="tel:911"
              className="mt-3 block rounded-xl bg-peligro-600 py-3 text-center text-sm font-extrabold text-white"
            >
              📞 Llamar al 911 ahora
            </a>

            {/* Estado de la ubicación */}
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
              {geoEstado === "buscando" && <span className="text-slate-500">📍 Obteniendo tu ubicación…</span>}
              {geoEstado === "ok" && geo && (
                <span className="font-semibold text-emerald-700">
                  📍 Ubicación lista{geo.acc != null ? ` · ~${Math.round(geo.acc)} m` : ""}
                </span>
              )}
              {geoEstado === "error" && (
                <button onClick={capturar} className="font-semibold text-peligro-700 underline">
                  No se pudo obtener la ubicación. Tocar para reintentar.
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Teléfono / WhatsApp <span className="text-peligro-600">*</span>
                </span>
                <input
                  type="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  maxLength={40}
                  placeholder="Ej. +58 412 1234567"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-peligro-500 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Tu nombre (opcional)</span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={120}
                  placeholder="Ej. María"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-peligro-500 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">¿Qué necesitas? (opcional)</span>
                <input
                  type="text"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  maxLength={140}
                  placeholder="Ej. Atrapados 3 personas, necesitamos rescate"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-peligro-500 focus:bg-white"
                />
              </label>
            </div>

            {error && <p className="mt-2 text-sm font-medium text-peligro-700">{error}</p>}

            <button
              onClick={enviar}
              disabled={enviando}
              className="mt-3 w-full rounded-xl bg-peligro-600 py-3.5 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar y pedir ayuda"}
            </button>

            {geo && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-center text-sm font-bold text-emerald-700"
              >
                💬 O comparte por WhatsApp ahora
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
