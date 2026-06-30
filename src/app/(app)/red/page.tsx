import Link from "next/link";
import { Globe, ArrowLeft } from "lucide-react";
import RedBuscador from "@/components/RedBuscador";

// Página dedicada de la sección "Red". El buscador en sí vive en RedBuscador
// (reutilizado también en la pestaña "Red" del inicio).

export default function RedPage() {
  return (
    <div className="space-y-4 px-4 py-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400">
        <ArrowLeft size={16} /> Volver
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Globe size={22} className="text-marca-600" /> Buscar en la Red
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Un solo buscador sobre <strong>22 plataformas</strong> de ayuda: personas desaparecidas,
          localizadas, hospitalizadas, centros de acopio, donación y recursos. Los datos son de la{" "}
          <strong>Red Humanitaria de Datos</strong>; cada resultado enlaza a su fuente original.
        </p>
      </div>

      <RedBuscador />
    </div>
  );
}
