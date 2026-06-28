"use client";

import { useEffect, useState } from "react";
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
    if (!("geolocation" in navigator)) {
      setError("Tu dispositivo no permite geolocalización.");
      return;
    }
    setBuscando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: LatLng = [pos.coords.latitude, pos.coords.longitude];
        onChange(p);
        setVolarA(p);
        setBuscando(false);
      },
      () => {
        setError("No pudimos obtener tu ubicación. Tócala en el mapa.");
        setBuscando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
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
          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
        >
          {buscando ? "Buscando…" : "📍 Usar mi ubicación"}
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
