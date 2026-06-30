"use client";

import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CENTRO_VENEZUELA, ZOOM_INICIAL } from "@/lib/constants";
import { iconoSeleccion } from "@/components/map/icons";

type LatLng = [number, number];

/** Captura clics en el mapa y coloca el punto seleccionado. */
function CapturaClics({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/** Permite mover el mapa programáticamente (al usar geolocalización). */
function Volar({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 14, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function MapPicker({
  value,
  onChange,
  height = 260,
}: {
  value: LatLng | null;
  onChange: (p: LatLng) => void;
  height?: number;
}) {
  const [volarA, setVolarA] = useState<LatLng | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function usarMiUbicacion() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("Tu navegador no permite geolocalización. Toca el mapa para marcar el lugar.");
      return;
    }
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setError("La ubicación solo funciona en sitios seguros (https). Toca el mapa para marcarlo.");
      return;
    }
    setBuscando(true);
    setError(null);

    const ok = (pos: GeolocationPosition) => {
      const p: LatLng = [pos.coords.latitude, pos.coords.longitude];
      onChange(p);
      setVolarA(p);
      setBuscando(false);
    };
    const fallo = (err: GeolocationPositionError) => {
      setBuscando(false);
      if (err?.code === 1) {
        setError(
          "Permiso de ubicación denegado. Actívalo en el navegador (icono de candado) o toca el mapa para marcar el lugar.",
        );
      } else if (err?.code === 3) {
        setError("La ubicación tardó demasiado. Revisa el GPS o toca el mapa para marcarlo.");
      } else {
        setError("No pudimos obtener tu ubicación. Toca el mapa para marcar el lugar.");
      }
    };

    // Primero alta precisión (rápido); si falla o da timeout, reintenta con baja
    // precisión y caché, que es mucho más fiable en interiores y en escritorio.
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

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200" style={{ height }}>
        <MapContainer
          center={value ?? CENTRO_VENEZUELA}
          zoom={value ? 14 : ZOOM_INICIAL}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CapturaClics onPick={onChange} />
          <Volar target={volarA} />
          {value && <Marker position={value} icon={iconoSeleccion()} />}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscando}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60"
        >
          <LocateFixed size={15} /> {buscando ? "Buscando…" : "Usar mi ubicación"}
        </button>
        <span className="text-[11px] text-slate-400">
          {value
            ? `Lat ${value[0].toFixed(4)}, Lng ${value[1].toFixed(4)}`
            : "Toca el mapa para marcar el lugar"}
        </span>
      </div>
      {error && <p className="text-xs text-peligro-600">{error}</p>}
    </div>
  );
}
