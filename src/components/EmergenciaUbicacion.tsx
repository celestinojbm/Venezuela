"use client";

import { useState } from "react";
import { Siren, LocateFixed, MapPin, Phone, Map as MapIcon } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

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
    <section className="rounded-2xl border-2 border-peligro-200 bg-peligro-50 p-4">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-peligro-700">
        <Siren size={20} strokeWidth={2.5} /> Comparte tu ubicación
      </h2>
      <p className="mt-1 text-sm text-peligro-700/80">
        Si estás en peligro o atrapado/a, capta tu ubicación y compártela con quien pueda
        ayudarte, o llama a emergencias.
      </p>

      {!pos ? (
        <button
          onClick={capturar}
          disabled={buscando}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-peligro-600 py-3.5 text-sm font-bold text-white shadow-sm shadow-peligro-600/25 active:scale-[0.99] disabled:opacity-60"
        >
          <LocateFixed size={18} /> {buscando ? "Obteniendo tu ubicación…" : "Captar mi ubicación"}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-white px-3 py-2 text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <MapPin size={15} /> Tu ubicación
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Lat {pos.lat.toFixed(5)}, Lng {pos.lng.toFixed(5)}
              {pos.acc != null ? ` · precisión ~${Math.round(pos.acc)} m` : ""}
            </div>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 active:scale-[0.99]"
          >
            <WhatsAppIcon size={18} /> Compartir mi ubicación por WhatsApp
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 active:scale-[0.99]"
          >
            <MapIcon size={17} /> Abrir en Google Maps
          </a>
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 rounded-xl bg-peligro-600 py-3 text-sm font-bold text-white active:scale-[0.99]"
          >
            <Phone size={17} /> Llamar al 911
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
