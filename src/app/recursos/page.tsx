import Link from "next/link";

const EXTERNOS = [
  {
    titulo: "Red por Venezuela",
    desc: "Índice con todo en un solo lugar: centros de acopio, dónde donar dinero, fuentes oficiales, servicios (médico, legal, alojamiento) y logística de envíos.",
    url: "https://redporvenezuela.com",
    emoji: "📚",
  },
  {
    titulo: "Red de Emergencia",
    desc: "Buscar personas (desaparecidos, hospitales, a salvo), voluntarios en campo, puntos de ayuda, mascotas y denuncias.",
    url: "https://redayudavenezuela.com",
    emoji: "🆘",
  },
];

export default function RecursosPage() {
  return (
    <div className="space-y-5 px-4 py-4">
      <Link href="/" className="text-sm font-medium text-slate-400">
        ← Volver
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">📚 Recursos y más ayuda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Otras plataformas confiables con información de la emergencia. Se abren en su sitio
          original, siempre actualizado.
        </p>
      </div>

      <div className="space-y-3">
        {EXTERNOS.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">
                <span aria-hidden>{r.emoji}</span> {r.titulo}
              </span>
              <span className="text-xs text-slate-400" aria-hidden>
                sitio externo ↗
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{r.desc}</p>
          </a>
        ))}

        <Link
          href="/guia"
          className="block rounded-2xl border border-peligro-200 bg-peligro-50 p-4"
        >
          <span className="text-base font-bold text-peligro-700">🆘 Emergencias y guía</span>
          <p className="mt-1 text-sm text-peligro-700/80">
            Números nacionales (171, 112, 911, Movilnet 1) y qué hacer ante un sismo o réplica.
          </p>
        </Link>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Manos Venezuela no copia ni almacena los datos de estas plataformas: solo enlaza a sus
        fuentes originales.
      </p>
    </div>
  );
}
