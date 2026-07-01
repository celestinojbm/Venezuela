import { ImageResponse } from "next/og";

// Ícono para "Añadir a pantalla de inicio" en iOS/Safari (apple-touch-icon).
// Se genera como PNG con URL con hash de contenido, igual que el favicon, para
// evitar que quede cacheado el ícono naranja anterior.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B3D91",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 94,
            height: 94,
            borderRadius: 999,
            border: "12px solid #ffffff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", width: 46, height: 46, borderRadius: 999, backgroundColor: "#ffffff" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
