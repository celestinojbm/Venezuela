"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import {
  CATEGORIAS,
  URGENCIAS,
  type CategoriaValue,
  type UrgenciaValue,
} from "@/lib/constants";
import { cx } from "@/lib/format";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-xl bg-slate-100" />,
});

function mensajeError(code?: string): string {
  switch (code) {
    case "limite":
      return "Publicaste varias veces seguidas. Espera unos minutos e intenta de nuevo.";
    case "enlaces":
      return "Quita los enlaces del texto e intenta de nuevo.";
    case "titulo":
      return "El título debe tener entre 3 y 140 caracteres.";
    case "telefono":
      return "Pon un teléfono de contacto.";
    default:
      return "No se pudo publicar. Revisa los datos e intenta de nuevo.";
  }
}

export default function NuevaSolicitudPage() {
  return (
    <AuthGate>
      <Formulario />
    </AuthGate>
  );
}

function Formulario() {
  const { supabase } = useSupabase();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoriaValue>("agua");
  const [urgency, setUrgency] = useState<UrgenciaValue>("media");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [peopleCount, setPeopleCount] = useState<string>("");
  const [punto, setPunto] = useState<[number, number] | null>(null);
  const [honeypot, setHoneypot] = useState(""); // anti-spam (oculto)
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (title.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres.");
      return;
    }
    if (!contactPhone.trim()) {
      setError("Pon un teléfono de contacto para que puedan ayudarte.");
      return;
    }
    setError(null);
    setCargando(true);

    const { data, error } = await supabase.functions.invoke("publicar", {
      body: {
        tipo: "solicitud",
        honeypot,
        payload: {
          author_name: nombre.trim() || null,
          title: title.trim(),
          category,
          urgency,
          description: description.trim() || null,
          location_text: locationText.trim() || null,
          contact_phone: contactPhone.trim(),
          people_count: peopleCount || null,
          lat: punto ? punto[0] : null,
          lng: punto ? punto[1] : null,
        },
      },
    });

    setCargando(false);
    if (error || !data?.ok) {
      setError(mensajeError(data?.error));
      return;
    }
    router.push(data.id ? `/solicitudes/${data.id}` : "/");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 px-4 py-4">
      {/* Campo trampa (honeypot) anti-spam: invisible para humanos. */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
        className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
      />

      <div>
        <h1 className="text-xl font-bold text-slate-900">Publicar solicitud</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cuéntanos qué necesitas. Sé claro/a para que quien pueda ayudarte te encuentre rápido.
          No necesitas cuenta.
        </p>
      </div>

      <Campo label="Tu nombre (opcional)">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={120}
          placeholder="Ej. María"
          className="entrada"
        />
      </Campo>

      <Campo label="¿Qué necesitas?" requerido>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          placeholder="Ej. Agua potable para 4 personas"
          className="entrada"
          required
        />
      </Campo>

      <div>
        <Etiqueta>Categoría</Etiqueta>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                category === c.value
                  ? "border-marca-600 bg-marca-600 text-white"
                  : "border-slate-200 bg-white text-slate-600",
              )}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Etiqueta>Urgencia</Etiqueta>
        <div className="flex flex-wrap gap-2">
          {URGENCIAS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setUrgency(u.value)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                urgency === u.value
                  ? "border-peligro-600 bg-peligro-600 text-white"
                  : "border-slate-200 bg-white text-slate-600",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <Campo label="Detalles (opcional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Describe la situación, qué cantidad necesitas, referencias del lugar…"
          className="entrada resize-none"
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Zona / dirección">
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            maxLength={200}
            placeholder="Ej. El Valle, Caracas"
            className="entrada"
          />
        </Campo>
        <Campo label="N.º de personas">
          <input
            type="number"
            min={1}
            value={peopleCount}
            onChange={(e) => setPeopleCount(e.target.value)}
            placeholder="Ej. 4"
            className="entrada"
          />
        </Campo>
      </div>

      <Campo label="Teléfono / WhatsApp de contacto">
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          maxLength={40}
          placeholder="Ej. +58 412 1234567"
          className="entrada"
        />
      </Campo>

      <div>
        <Etiqueta>Ubicación en el mapa (opcional)</Etiqueta>
        <MapPicker value={punto} onChange={setPunto} />
      </div>

      {error && (
        <p className="rounded-lg bg-peligro-50 px-3 py-2 text-sm text-peligro-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl bg-marca-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {cargando ? "Publicando…" : "Publicar solicitud"}
      </button>

      <style jsx global>{`
        .entrada {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .entrada:focus {
          border-color: #1a56db;
          background: #fff;
        }
      `}</style>
    </form>
  );
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium text-slate-700">{children}</span>;
}

function Campo({
  label,
  requerido,
  children,
}: {
  label: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {requerido && <span className="text-peligro-600">*</span>}
      </span>
      {children}
    </label>
  );
}
