"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { CENTRO_VENEZUELA, ZOOM_INICIAL } from "@/lib/constants";
import { iconoSolicitud } from "@/components/map/icons";
import { CATEGORIA_MAP, URGENCIA_MAP } from "@/lib/constants";
import type { HelpRequest } from "@/lib/types";

export default function RequestsMap({
  requests,
  height = 420,
  enlazar = true,
}: {
  requests: HelpRequest[];
  height?: number | string;
  enlazar?: boolean;
}) {
  const conCoords = useMemo(
    () => requests.filter((r) => r.lat != null && r.lng != null),
    [requests],
  );

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (conCoords.length === 0) return null;
    return conCoords.map((r) => [r.lat as number, r.lng as number]) as LatLngBoundsExpression;
  }, [conCoords]);

  // Si hay varios puntos, ajustamos a sus límites (bounds); si hay uno, lo
  // centramos; si no hay ninguno, mostramos todo el país. react-leaflet usa
  // center+zoom O bounds, no ambos a la vez.
  const posicion =
    conCoords.length > 1 && bounds
      ? { bounds }
      : {
          center:
            conCoords.length === 1
              ? ([conCoords[0].lat as number, conCoords[0].lng as number] as [number, number])
              : CENTRO_VENEZUELA,
          zoom: conCoords.length === 1 ? 14 : ZOOM_INICIAL,
        };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height }}>
      <MapContainer
        {...posicion}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {conCoords.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat as number, r.lng as number]}
            icon={iconoSolicitud(r.category, r.urgency)}
          >
            <Popup>
              <div className="min-w-[10rem]">
                <div className="text-[11px] font-semibold uppercase text-slate-400">
                  {URGENCIA_MAP[r.urgency]?.label} · {CATEGORIA_MAP[r.category]?.label}
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-800">{r.title}</div>
                {r.location_text && (
                  <div className="mt-0.5 text-xs text-slate-500">📍 {r.location_text}</div>
                )}
                {enlazar && (
                  <Link
                    href={`/solicitudes/${r.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-marca-600"
                  >
                    Ver solicitud →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
