import { ImageResponse } from "next/og";

// Imagen de previsualización (Open Graph / Twitter) que se ve al compartir el
// enlace en WhatsApp, Telegram, X, etc. Se genera como PNG en el build, así que
// no necesita dependencias de imagen ni archivos binarios en el repo.
export const alt =
  "Manos Venezuela — Ayuda directa tras el terremoto de junio de 2026 en Venezuela";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "white",
          backgroundColor: "#0B3D91",
          backgroundImage: "linear-gradient(135deg, #0B3D91 0%, #071A3F 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 22,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 46,
                height: 46,
                borderRadius: 999,
                border: "7px solid #0B3D91",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  backgroundColor: "#0B3D91",
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
            Manos Venezuela
          </div>
        </div>

        {/* Mensaje */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#FFCE00",
            }}
          >
            TERREMOTO DE JUNIO 2026 · VENEZUELA
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 960,
            }}
          >
            Conectamos a quienes ayudan con quienes lo necesitan
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.82)", maxWidth: 900 }}>
            Publica o encuentra ayuda cerca de ti — directo entre vecinos.
          </div>
        </div>

        {/* Pie: bandera + dominio */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", width: 72, height: 14, borderRadius: 99, backgroundColor: "#FFCE00" }} />
            <div style={{ display: "flex", width: 72, height: 14, borderRadius: 99, backgroundColor: "#1A56DB" }} />
            <div style={{ display: "flex", width: 72, height: 14, borderRadius: 99, backgroundColor: "#D11E2A" }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            manosvenezuela.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
