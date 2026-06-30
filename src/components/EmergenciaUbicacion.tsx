"use client";

import { useState } from "react";

type Pos = { lat: number; lng: number; acc: number | null };

/**
 * Captura la ubicación de la persona en emergencia y le da acciones rápidas:
 * compartirla por WhatsApp, abrirla en el mapa y llamar a emergencias.
 */
export default function EmergenciaUbicacion() {
  const [pos, setPos] = useState<Pos | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function capturar() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("Tu dispositivo no permite ubicación.");
      return;
    }
    setBuscando(true);
    setError(null);
    const ok = (p: GeolocationPosition) => {
      setPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy ?? null });
      setBuscando(false);
    };
    const fallo = () => {
      setError("No pudimos obtener tu ubicación. Activa el GPS y permite el acceso a la ubicación.");
      setBuscando(false);
    };
    // Alta precisión primero; si falla, reintento con baja precisión (más fiable).
    navigator.geolocation.getCurrentPosition(
      ok,
      () =>
        navigator.geolocation.getCurrentPosition(ok, fallo, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }

  const mapsUrl = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lng}` : "";
  const waText = pos ? `🆘 Necesito ayuda urgente. Esta es mi ubicación: ${mapsUrl}` : "";

  return (
    <section className="rounded-2xl border-2 border-peligro-300 bg-peligro-50 p-4">
      <h2 className="text-lg font-extrabold text-peligro-700">🆘 Comparte tu ubicación</h2>
      <p className="mt-1 text-sm text-peligro-700/80">
        Si estás en peligro o atrapado/a, capta tu ubicación y compártela con quien pueda
        ayudarte, o llama a emergencias.
      </p>

      {!pos ? (
        <button
          onClick={capturar}
          disabled={buscando}
          className="mt-3 w-full rounded-xl bg-peligro-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {buscando ? "Obteniendo tu ubicación…" : "📍 Captar mi ubicación"}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-white px-3 py-2 text-sm">
            <div className="font-semibold text-slate-800">📍 Tu ubicación</div>
            <div className="text-xs text-slate-500">
              Lat {pos.lat.toFixed(5)}, Lng {pos.lng.toFixed(5)}
              {pos.acc != null ? ` · precisión ~${Math.round(pos.acc)} m` : ""}
            </div>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white"
          >
            💬 Compartir mi ubicación por WhatsApp
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-bold text-slate-700"
          >
            🗺️ Abrir en Google Maps
          </a>
          <a
            href="tel:911"
            className="block rounded-xl bg-peligro-600 py-3 text-center text-sm font-bold text-white"
          >
            📞 Llamar al 911
          </a>
          <button
            onClick={capturar}
            disabled={buscando}
            className="block w-full pt-1 text-center text-xs font-medium text-peligro-700 underline"
          >
            {buscando ? "Actualizando…" : "Actualizar mi ubicación"}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-medium text-peligro-700">{error}</p>}
    </section>
  );
}
