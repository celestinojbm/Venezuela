"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { CENTRO_VENEZUELA, ZOOM_INICIAL } from "@/lib/constants";
import { Phone, MapPin } from "lucide-react";
import { iconoSolicitud, iconoRed } from "@/components/map/icons";
import { CATEGORIA_MAP, URGENCIA_MAP } from "@/lib/constants";
import { waHref, telHref } from "@/lib/contacto";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import type { HelpRequest } from "@/lib/types";

export type RedPunto = {
  id: string | null;
  tipo: string | null;
  titulo: string | null;
  resumen: string | null;
  lugar: string | null;
  contacto?: string | null;
  lat: number | null;
  lng: number | null;
  aprox?: boolean;
  fuente: string | null;
  url: string | null;
};

const RED_ETIQUETA: Record<string, string> = {
  refugio: "Refugio",
  centro_acopio: "Centro de acopio",
  centro_donacion: "Centro de donación",
  recurso: "Recurso",
};

export default function RequestsMap({
  requests,
  red = [],
  height = 420,
  enlazar = true,
}: {
  requests: HelpRequest[];
  red?: RedPunto[];
  height?: number | string;
  enlazar?: boolean;
}) {
  const conCoords = useMemo(
    () => requests.filter((r) => r.lat != null && r.lng != null),
    [requests],
  );

  const redCoords = useMemo(
    () => red.filter((p) => p.lat != null && p.lng != null),
    [red],
  );

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const pts = [
      ...conCoords.map((r) => [r.lat as number, r.lng as number]),
      ...redCoords.map((p) => [p.lat as number, p.lng as number]),
    ];
    if (pts.length === 0) return null;
    return pts as LatLngBoundsExpression;
  }, [conCoords, redCoords]);

  const totalPuntos = conCoords.length + redCoords.length;

  // Si hay varios puntos, ajustamos a sus límites (bounds); si hay uno, lo
  // centramos; si no hay ninguno, mostramos todo el país. react-leaflet usa
  // center+zoom O bounds, no ambos a la vez.
  const unico =
    totalPuntos === 1
      ? conCoords[0]
        ? ([conCoords[0].lat as number, conCoords[0].lng as number] as [number, number])
        : ([redCoords[0].lat as number, redCoords[0].lng as number] as [number, number])
      : null;

  const posicion =
    totalPuntos > 1 && bounds
      ? { bounds }
      : {
          center: unico ?? CENTRO_VENEZUELA,
          zoom: unico ? 14 : ZOOM_INICIAL,
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
        {conCoords.map((r) => {
          const wa = waHref(r.contact_phone, `Hola, vi tu solicitud "${r.title}" en Manos Venezuela y quiero ayudarte.`);
          const tel = telHref(r.contact_phone);
          return (
            <Marker
              key={r.id}
              position={[r.lat as number, r.lng as number]}
              icon={iconoSolicitud(r.category, r.urgency)}
            >
              <Popup>
                <div className="min-w-[11rem]">
                  <div className="text-[11px] font-semibold uppercase text-slate-400">
                    {URGENCIA_MAP[r.urgency]?.label} · {CATEGORIA_MAP[r.category]?.label}
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-800">{r.title}</div>
                  {r.location_text && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} className="shrink-0" /> {r.location_text}
                    </div>
                  )}
                  {(wa || tel) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white"
                        >
                          <WhatsAppIcon size={13} /> WhatsApp
                        </a>
                      )}
                      {tel && (
                        <a
                          href={tel}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700"
                        >
                          <Phone size={12} /> Llamar
                        </a>
                      )}
                    </div>
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
          );
        })}

        {redCoords.map((p, i) => {
          const etiqueta = RED_ETIQUETA[p.tipo ?? ""] ?? "Recurso";
          const wa = waHref(p.contacto, `Hola, los contacto desde Manos Venezuela por "${p.titulo ?? "ayuda"}".`);
          const tel = telHref(p.contacto);
          return (
            <Marker
              key={`red-${p.id ?? i}`}
              position={[p.lat as number, p.lng as number]}
              icon={iconoRed(p.tipo ?? "recurso")}
            >
              <Popup>
                <div className="min-w-[11rem]">
                  <div className="text-[11px] font-semibold uppercase text-slate-400">{etiqueta}</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-800">{p.titulo}</div>
                  {p.lugar && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} className="shrink-0" />
                      <span>
                        {p.lugar}
                        {p.aprox ? " (ubicación aproximada)" : ""}
                      </span>
                    </div>
                  )}
                  {(wa || tel) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white"
                        >
                          <WhatsAppIcon size={13} /> WhatsApp
                        </a>
                      )}
                      {tel && (
                        <a
                          href={tel}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700"
                        >
                          <Phone size={12} /> Llamar
                        </a>
                      )}
                    </div>
                  )}
                  {p.fuente && (
                    <div className="mt-1 text-[11px] text-slate-400">Fuente: {p.fuente}</div>
                  )}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block text-xs font-semibold text-blue-600"
                    >
                      Ver en la fuente ↗
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
