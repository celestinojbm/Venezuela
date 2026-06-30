import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dirección visual "Manos Venezuela": azul confianza + acentos de bandera.
        // `marca` es el azul institucional (antes naranja); se usa en toda la app.
        marca: {
          50: "#EFF4FE",
          100: "#E7EEFB",
          200: "#C9DBF8",
          500: "#2563EB",
          600: "#1A56DB", // azul de acción (botones, enlaces)
          700: "#0B3D91", // azul profundo de marca
        },
        // Rojo reservado para emergencias.
        peligro: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Acentos de la bandera de Venezuela (uso puntual).
        bandera: {
          amarillo: "#FFCE00",
          azul: "#0B3D91",
          rojo: "#D11E2A",
        },
        // Azul muy profundo para secciones oscuras / pie.
        profundo: "#071A3F",
        // Tinta azulada para texto principal.
        tinta: "#0C1B33",
      },
      fontFamily: {
        // Cuerpo/UI: Public Sans · Titulares: Source Serif 4 (cargadas con next/font).
        sans: [
          "var(--font-public-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: ["var(--font-source-serif)", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
