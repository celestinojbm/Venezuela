import Link from "next/link";

const EMERGENCIAS = [
  { label: "Emergencias (Movistar)", numero: "911", desc: "Línea general de emergencias" },
  { label: "Cantv (desde teléfono fijo)", numero: "171", desc: "Emergencias línea fija" },
  { label: "Digitel", numero: "112", desc: "Emergencias desde Digitel" },
  { label: "Movilnet", numero: "1", desc: "Emergencias desde Movilnet" },
];

const CONSEJOS = [
  { icon: "🎒", texto: "Ten a mano agua, linterna, medicinas y tus documentos." },
  { icon: "📍", texto: "Acuerda un punto de encuentro con tu familia por si se separan." },
  { icon: "🧯", texto: "Aléjate de ventanas, vidrios y objetos que puedan caer." },
  { icon: "📢", texto: "No difundas rumores: verifica la información antes de compartir." },
  { icon: "🧓", texto: "Ayuda a vecinos vulnerables: adultos mayores, niños y personas con discapacidad." },
  { icon: "🔌", texto: "Cierra el gas y desconecta la electricidad si notas daños o fugas." },
];

export default function GuiaPage() {
  return (
    <div className="space-y-6 px-4 py-4">
      <Link href="/" className="text-sm font-medium text-slate-400">
        ← Volver
      </Link>

      <section>
        <h1 className="text-xl font-bold text-slate-900">🆘 Emergencias</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ante una emergencia médica, incendio o rescate, llama siempre a los organismos
          oficiales. Toca un número para llamar.
        </p>
        <div className="mt-3 space-y-2">
          {EMERGENCIAS.map((e) => (
            <a
              key={e.label}
              href={`tel:${e.numero}`}
              className="flex items-center justify-between rounded-2xl border border-peligro-200 bg-peligro-50 px-4 py-3"
            >
              <div>
                <div className="text-sm font-semibold text-peligro-700">{e.label}</div>
                <div className="text-xs text-slate-500">{e.desc}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-peligro-700">{e.numero}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-peligro-600 text-white" aria-hidden>
                  📞
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Guía rápida de seguridad</h2>
        <ul className="mt-3 space-y-2">
          {CONSEJOS.map((c) => (
            <li
              key={c.texto}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 text-sm text-slate-700"
            >
              <span className="text-lg" aria-hidden>{c.icon}</span>
              <span>{c.texto}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-[11px] text-slate-400">
        Información de referencia. Sigue siempre las indicaciones de Protección Civil y los
        organismos oficiales.
      </p>
    </div>
  );
}
