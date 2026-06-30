// Mapa 3D de daños estructurales tras los sismos (escena de ArcGIS).
// Se carga solo; con loading="lazy" el navegador difiere la descarga hasta que
// la sección está cerca de la pantalla, para no penalizar la carga inicial.

import { Building2, ExternalLink } from "lucide-react";

const URL_DANOS =
  "https://www.arcgis.com/home/webscene/viewer.html?webscene=c01ef4b6b74b4d25a39f7a1e4865be58";

export default function MapaDanos() {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Building2 size={20} className="text-slate-500" /> Mapa de daños (3D)
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Vista 3D de los daños estructurales tras los sismos (ArcGIS). Puede tardar en cargar y
        consume datos.
      </p>

      <div
        className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
        style={{ height: "70vh" }}
      >
        <iframe
          src={URL_DANOS}
          title="Mapa de daños 3D"
          className="h-full w-full"
          loading="lazy"
          allow="fullscreen; geolocation"
          allowFullScreen
        />
      </div>

      <a
        href={URL_DANOS}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1 text-center text-xs font-semibold text-marca-600"
      >
        Abrir en ArcGIS (pantalla completa) <ExternalLink size={12} />
      </a>
    </section>
  );
}
