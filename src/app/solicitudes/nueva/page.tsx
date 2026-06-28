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

export default function NuevaSolicitudPage() {
  return (
    <AuthGate>
      <Formulario />
    </AuthGate>
  );
}

function Formulario() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoriaValue>("agua");
  const [urgency, setUrgency] = useState<UrgenciaValue>("media");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [peopleCount, setPeopleCount] = useState<string>("");
  const [punto, setPunto] = useState<[number, number] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    if (title.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres.");
      return;
    }
    setError(null);
    setCargando(true);

    const { data, error } = await supabase
      .from("requests")
      .insert({
        author_id: user.id,
        title: title.trim(),
        category,
        urgency,
        description: description.trim() || null,
        location_text: locationText.trim() || null,
        contact_phone: contactPhone.trim() || null,
        people_count: peopleCount ? Number(peopleCount) : null,
        lat: punto ? punto[0] : null,
        lng: punto ? punto[1] : null,
      })
      .select("id")
      .single();

    setCargando(false);
    if (error) {
      setError("No se pudo publicar. Revisa los datos e intenta de nuevo.");
      return;
    }
    router.push(`/solicitudes/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 px-4 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Publicar solicitud</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cuéntanos qué necesitas. Sé claro/a para que quien pueda ayudarte te encuentre rápido.
        </p>
      </div>

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
          border-color: #f97316;
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
