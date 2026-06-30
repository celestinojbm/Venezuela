// Utilidades de contacto: normaliza teléfonos (formatos venezolanos comunes) a
// dígitos en formato internacional y arma enlaces de WhatsApp (wa.me) y llamada.

/**
 * Devuelve los dígitos del teléfono en formato internacional (ej. 584141234567)
 * o null si no parece un número usable. Soporta formatos típicos de Venezuela:
 * 0414xxxxxxx, +58 414 xxxxxxx, 58414xxxxxxx, etc. Si vienen varios números,
 * toma el primero.
 */
export function telVE(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const patrones = [
    /\+?58\s?4\d{2}\s?\d{7}/, // +58 4xx xxxxxxx (móvil internacional)
    /\+?58\s?\d{3}\s?\d{7}/, // +58 xxx xxxxxxx (internacional)
    /0\d{3}[\s.-]?\d{7}/, // 0xxx xxxxxxx (local)
    /\+?\d{10,13}/, // genérico internacional
  ];
  let encontrado: string | null = null;
  for (const p of patrones) {
    const m = raw.match(p);
    if (m) {
      encontrado = m[0];
      break;
    }
  }
  if (!encontrado) return null;

  let d = encontrado.replace(/\D/g, "");
  if (d.startsWith("58")) {
    // ya está en internacional
  } else if (d.startsWith("0")) {
    d = "58" + d.slice(1); // quita el 0 inicial y antepone 58
  } else if (d.length === 10) {
    d = "58" + d; // móvil sin 0 ni código de país
  }
  if (d.length < 11 || d.length > 15) return null;
  return d;
}

/** Enlace de WhatsApp con mensaje opcional, o null si el teléfono no sirve. */
export function waHref(raw: string | null | undefined, mensaje?: string): string | null {
  const d = telVE(raw);
  if (!d) return null;
  const cola = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${d}${cola}`;
}

/** Enlace de llamada, o null si el teléfono no sirve. */
export function telHref(raw: string | null | undefined): string | null {
  const d = telVE(raw);
  return d ? `tel:+${d}` : null;
}
