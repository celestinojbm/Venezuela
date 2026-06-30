import type { Metadata } from "next";
import Link from "next/link";
import {
  HandHeart,
  MapPin,
  ArrowRight,
  Megaphone,
  Map as MapIcon,
  HeartHandshake,
  HandHelping,
  Check,
  ShieldCheck,
  WifiOff,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Manos Venezuela — Ayuda solidaria tras el terremoto de junio de 2026",
  description:
    "Plataforma comunitaria y gratuita que conecta a quienes pueden ayudar con las personas afectadas por el terremoto de junio de 2026 en Venezuela. Publica una necesidad o encuentra cómo ayudar en minutos.",
};

const HERO_IMG =
  "https://framerusercontent.com/images/a29cIJHtI4rrb1wJpvwcAkqo3lA.jpg";
const CONTEXTO_IMG =
  "https://framerusercontent.com/images/u23dzJWWl0U9WkM97L5kk4OKlM.jpg";

const APP_URL = "/";
const URL_AYUDAR = "/red";
const URL_NECESITO = "/publicar";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-[10px] bg-marca-600 px-[22px] py-[14px] text-base font-semibold text-white shadow-sm transition-all hover:bg-marca-700 active:scale-[0.98]";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-[22px] py-[14px] text-base font-semibold text-tinta transition-colors hover:border-slate-300";
const btnGhostDark =
  "inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/40 px-[22px] py-[14px] text-base font-semibold text-white transition-colors hover:bg-white/10";

const eyebrow =
  "text-[13px] font-semibold uppercase tracking-[0.08em] text-marca-600";

const navLinks = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#participa", label: "Participa" },
  { href: "#impacto", label: "Impacto" },
  { href: "#confianza", label: "Confianza" },
];

const pasos: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Megaphone,
    title: "Publica lo que necesitas o lo que ofreces",
    desc: "Cuenta en pocas palabras tu necesidad o tu ayuda. Sin formularios eternos.",
  },
  {
    icon: MapIcon,
    title: "Encuentra cerca de ti",
    desc: "Explora necesidades y ofertas en el mapa de zonas afectadas y filtra por cercanía.",
  },
  {
    icon: HeartHandshake,
    title: "Conecta y coordina",
    desc: "Contáctate directo por WhatsApp y organiza la entrega o el apoyo. Así de simple.",
  },
];

const stats: { num: string; label: string; accent?: boolean }[] = [
  { num: "24", label: "estados de Venezuela cubiertos" },
  { num: "100%", label: "gratuita y comunitaria", accent: true },
  { num: "3 min", label: "para publicar tu solicitud" },
  { num: "24/7", label: "disponible, incluso sin conexión" },
];

const garantias: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: HandCoins,
    title: "Gratuita",
    desc: "Sin costos ni comisiones, para quien pide y para quien ofrece ayuda.",
  },
  {
    icon: HeartHandshake,
    title: "Sin fines de lucro",
    desc: "Una iniciativa comunitaria y abierta, no un negocio.",
  },
  {
    icon: ShieldCheck,
    title: "Datos protegidos",
    desc: "Solo compartes lo necesario para coordinar la ayuda de forma segura.",
  },
  {
    icon: WifiOff,
    title: "Funciona sin conexión",
    desc: "Diseñada para zonas con internet inestable tras el sismo.",
  },
];

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it) => (
        <li key={it} className="flex items-center gap-3">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-marca-100">
            <Check size={13} strokeWidth={3} className="text-marca-600" />
          </span>
          <span className="text-[15px] font-medium text-tinta">{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white font-sans text-tinta">
      {/* ===== Encabezado ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5 md:px-8">
          <Link href={APP_URL} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-marca-700 text-white">
              <HandHeart size={19} strokeWidth={2.25} />
            </span>
            <span className="text-[19px] font-bold tracking-tight">
              Manos <span className="text-marca-700">Venezuela</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[15px] font-medium text-slate-600 transition-colors hover:text-marca-700"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <Link
            href={APP_URL}
            className="inline-flex items-center gap-2 rounded-[10px] bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-700"
          >
            Abrir la app <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="bg-gradient-to-b from-[#F4F7FC] to-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-marca-100 px-3.5 py-1.5 text-[13px] font-semibold text-marca-700">
              <MapPin size={14} strokeWidth={2.25} /> Venezuela · Terremoto de
              junio de 2026
            </span>
            <h1 className="mt-6 font-serif text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-tinta sm:text-5xl md:text-[3.8rem]">
              Conectamos a quien quiere ayudar con quien más lo necesita
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Manos Venezuela es una plataforma abierta y gratuita para coordinar
              la ayuda tras el terremoto de junio de 2026. Publica una necesidad o
              encuentra cómo ayudar en pocos minutos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href={URL_AYUDAR} className={btnPrimary}>
                Quiero ayudar <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <Link href={URL_NECESITO} className={btnSecondary}>
                Necesito ayuda
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-500">
              Gratuita · Sin fines de lucro · Funciona sin conexión
            </p>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMG}
              alt="Personas voluntarias organizando cajas con ayuda para la comunidad"
              className="aspect-square w-full rounded-[18px] object-cover shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/[0.06]"
            />
          </div>
        </div>
      </section>

      {/* ===== Contexto ===== */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
          <div className="order-2 md:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CONTEXTO_IMG}
              alt="Personas voluntarias clasificando donaciones de alimentos para la comunidad"
              className="aspect-square w-full rounded-[18px] object-cover shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.06]"
            />
          </div>
          <div className="order-1 flex flex-col gap-5 md:order-2">
            <span className={eyebrow}>Por qué existe Manos Venezuela</span>
            <h2 className="max-w-md font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-tinta md:text-[2.6rem]">
              Tras el terremoto, la ayuda existe. Falta coordinarla.
            </h2>
            <p className="text-[17px] leading-relaxed text-slate-600">
              El terremoto de junio de 2026 dejó a miles de familias sin hogar,
              agua o alimentos. Al mismo tiempo, miles de personas quieren ayudar
              y no saben cómo, dónde ni a quién.
            </p>
            <p className="text-[17px] leading-relaxed text-slate-600">
              Manos Venezuela reúne ambas necesidades en un solo lugar: un puente
              directo, transparente y comunitario entre quien ofrece ayuda y quien
              la necesita.
            </p>
            <div className="mt-1">
              <Checklist
                items={[
                  "Necesidades publicadas por la propia comunidad",
                  "Contacto directo por WhatsApp, sin intermediarios",
                  "Mapa de zonas afectadas para priorizar la ayuda",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section id="como-funciona" className="scroll-mt-20 bg-[#F4F7FC]">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className={eyebrow}>Cómo funciona</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-tinta md:text-[2.6rem]">
              Ayudar o pedir ayuda toma menos de tres minutos
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              Sin trámites ni registros largos. Tres pasos simples para que la
              ayuda llegue a tiempo.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pasos.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-marca-100">
                  <Icon size={23} strokeWidth={2} className="text-marca-700" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-tinta">
                  {title}
                </h3>
                <p className="text-base leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Participa ===== */}
      <section id="participa" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className={eyebrow}>Participa</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-tinta md:text-[2.6rem]">
              Dos formas de sumarte hoy
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              Pidas o brindes ayuda, el camino es directo y sin intermediarios.
              Elige por dónde empezar.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Necesito ayuda */}
            <div className="flex flex-col gap-5 rounded-[18px] border border-slate-200 bg-white p-8">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-[13px] bg-marca-700 text-white">
                <HandHeart size={25} strokeWidth={2} />
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-tinta">
                Necesito ayuda
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
                Publica qué necesitas —agua, alimentos, refugio, traslado o
                medicinas— y deja que la comunidad responda.
              </p>
              <Checklist
                items={[
                  "Publicación en minutos, sin trámites",
                  "Totalmente gratis",
                  "La comunidad te contacta directo",
                ]}
              />
              <div className="mt-auto pt-2">
                <Link href={URL_NECESITO} className={btnPrimary}>
                  Publicar una necesidad{" "}
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            {/* Quiero ayudar */}
            <div className="flex flex-col gap-5 rounded-[18px] border border-slate-200 bg-[#F4F7FC] p-8">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-[13px] bg-marca-600 text-white">
                <HandHelping size={25} strokeWidth={2} />
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-tinta">
                Quiero ayudar
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
                Explora necesidades reales cerca de ti y ofrece lo que puedas:
                tiempo, recursos o traslado.
              </p>
              <Checklist
                items={[
                  "Necesidades reales y cercanas",
                  "Filtra por zona y tipo de ayuda",
                  "Coordina directo por WhatsApp",
                ]}
              />
              <div className="mt-auto pt-2">
                <Link href={URL_AYUDAR} className={btnSecondary}>
                  Ver cómo ayudar <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Impacto ===== */}
      <section id="impacto" className="scroll-mt-20 bg-profundo">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-bandera-amarillo">
              Impacto
            </span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-[2.6rem]">
              La fuerza está en coordinarnos
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              Una plataforma pensada para que la ayuda llegue rápido, a todo el
              país y sin barreras.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className={`text-5xl font-bold tracking-tight tabular-nums ${
                    s.accent ? "text-bandera-amarillo" : "text-white"
                  }`}
                >
                  {s.num}
                </div>
                <div className="mt-2 text-[15px] leading-snug text-slate-300">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Confianza ===== */}
      <section id="confianza" className="scroll-mt-20 bg-[#F4F7FC]">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className={eyebrow}>Confianza</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-tinta md:text-[2.6rem]">
              Pensada para confiar en momentos difíciles
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              Cuatro principios que sostienen la plataforma desde el primer día.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {garantias.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-marca-100">
                  <Icon size={22} strokeWidth={2} className="text-marca-700" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-tinta">
                  {title}
                </h3>
                <p className="text-[15px] leading-relaxed text-slate-600">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cierre ===== */}
      <section className="bg-gradient-to-br from-marca-700 to-profundo">
        <div className="mx-auto flex max-w-[820px] flex-col items-center px-6 py-24 text-center md:px-8 md:py-28">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-bandera-amarillo">
            Manos Venezuela
          </span>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
            Cada gesto cuenta. Súmate hoy.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200">
            Pide o brinda ayuda en minutos. La reconstrucción la hacemos entre
            todos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link href={URL_AYUDAR} className={btnSecondary}>
              Quiero ayudar <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link href={URL_NECESITO} className={btnGhostDark}>
              Necesito ayuda
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Pie ===== */}
      <footer className="border-t border-white/10 bg-profundo">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-8">
          <div className="flex flex-col justify-between gap-12 md:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-marca-600 text-white">
                  <HandHeart size={19} strokeWidth={2.25} />
                </span>
                <span className="text-[19px] font-bold tracking-tight text-white">
                  Manos Venezuela
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
                Plataforma comunitaria y gratuita que conecta ayuda con quienes la
                necesitan tras el terremoto de junio de 2026 en Venezuela.
              </p>
            </div>

            <div className="flex gap-16">
              <div className="flex flex-col gap-3.5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  Plataforma
                </span>
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-[15px] text-slate-400 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-3.5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  Acciones
                </span>
                <Link
                  href={URL_AYUDAR}
                  className="text-[15px] text-slate-400 transition-colors hover:text-white"
                >
                  Quiero ayudar
                </Link>
                <Link
                  href={URL_NECESITO}
                  className="text-[15px] text-slate-400 transition-colors hover:text-white"
                >
                  Necesito ayuda
                </Link>
                <Link
                  href={APP_URL}
                  className="text-[15px] text-slate-400 transition-colors hover:text-white"
                >
                  Abrir la app
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              © 2026 Manos Venezuela · Iniciativa comunitaria sin fines de lucro
            </p>
            <p className="text-sm text-slate-500">
              Hecho con solidaridad para Venezuela
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
