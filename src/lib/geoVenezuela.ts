// Geolocalización aproximada por ciudad/estado para puntos que no traen
// coordenadas (muchos centros de acopio/recursos de la Red solo tienen el
// nombre de la ciudad). No es exacto: ubica el punto cerca del centro de la
// ciudad, con un pequeño desplazamiento determinístico para que no se apilen.

type LatLng = [number, number];

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Ciudades principales (centroides aproximados).
const CIUDADES: Record<string, LatLng> = {
  caracas: [10.4806, -66.9036],
  "la guaira": [10.6, -66.9333],
  maiquetia: [10.6, -66.9833],
  "catia la mar": [10.6, -67.03],
  caraballeda: [10.61, -66.85],
  "los teques": [10.3417, -67.0417],
  guarenas: [10.4717, -66.61],
  guatire: [10.4761, -66.54],
  petare: [10.4761, -66.8075],
  "ocumare del tuy": [10.1131, -66.7806],
  charallave: [10.2417, -66.8589],
  "santa teresa del tuy": [10.2386, -66.665],
  "santa lucia": [10.2467, -66.6661],
  cua: [10.1622, -66.8881],
  maracay: [10.2469, -67.5958],
  turmero: [10.2281, -67.4736],
  cagua: [10.1869, -67.4608],
  "la victoria": [10.2275, -67.3325],
  "el limon": [10.3072, -67.6386],
  valencia: [10.162, -68.0078],
  "puerto cabello": [10.4731, -68.0125],
  guacara: [10.2289, -67.8775],
  "san joaquin": [10.265, -67.8042],
  maracaibo: [10.6545, -71.644],
  cabimas: [10.3833, -71.4333],
  "ciudad ojeda": [10.2017, -71.3119],
  barquisimeto: [10.0647, -69.347],
  cabudare: [10.0356, -69.2625],
  "san cristobal": [7.7669, -72.225],
  merida: [8.5897, -71.1561],
  "san felipe": [10.34, -68.74],
  yaritagua: [10.0817, -69.1283],
  maturin: [9.7457, -63.1832],
  barcelona: [10.134, -64.6833],
  "puerto la cruz": [10.213, -64.6333],
  "el tigre": [8.8833, -64.25],
  cumana: [10.4555, -64.1762],
  carupano: [10.6678, -63.2581],
  "ciudad guayana": [8.3533, -62.6528],
  "puerto ordaz": [8.3533, -62.6528],
  "ciudad bolivar": [8.1222, -63.5497],
  barinas: [8.6226, -70.2075],
  guanare: [9.0417, -69.7419],
  acarigua: [9.5597, -69.2019],
  araure: [9.5667, -69.2167],
  valera: [9.317, -70.6036],
  trujillo: [9.3667, -70.4333],
  coro: [11.4045, -69.6734],
  "punto fijo": [11.6833, -70.2],
  "san juan de los morros": [9.91, -67.3547],
  "san fernando de apure": [7.8939, -67.4736],
  "puerto ayacucho": [5.6639, -67.6236],
  tucupita: [9.0594, -62.0461],
  "la asuncion": [11.0333, -63.8628],
  porlamar: [10.9577, -63.8486],
};

// Entidades federales (centroide aproximado), como respaldo si no hay ciudad.
const ESTADOS: Record<string, LatLng> = {
  "distrito capital": [10.4806, -66.9036],
  caracas: [10.4806, -66.9036],
  miranda: [10.3, -66.7],
  "la guaira": [10.6, -66.93],
  vargas: [10.6, -66.93],
  aragua: [10.2, -67.4],
  carabobo: [10.18, -68.1],
  zulia: [10.4, -72.0],
  lara: [10.0, -69.5],
  bolivar: [7.5, -63.5],
  tachira: [7.8, -72.2],
  anzoategui: [9.5, -64.5],
  monagas: [9.5, -63.0],
  sucre: [10.45, -63.8],
  merida: [8.55, -71.2],
  trujillo: [9.3, -70.5],
  falcon: [11.2, -69.8],
  barinas: [8.5, -70.1],
  portuguesa: [9.2, -69.7],
  yaracuy: [10.3, -68.8],
  guarico: [9.0, -66.5],
  cojedes: [9.4, -68.3],
  apure: [7.5, -68.5],
  "nueva esparta": [11.0, -63.9],
  "delta amacuro": [8.8, -61.4],
  amazonas: [4.0, -66.0],
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Desplazamiento determinístico (~±2 km) para que varios puntos de la misma
// ciudad no queden exactamente encima.
function jitter([lat, lng]: LatLng, seed: string): LatLng {
  const h = hashStr(seed);
  const dl = ((h % 1000) / 1000 - 0.5) * 0.04;
  const dn = (((h >>> 10) % 1000) / 1000 - 0.5) * 0.04;
  return [lat + dl, lng + dn];
}

/**
 * Devuelve coordenadas aproximadas a partir de ciudad y/o estado, o null si no
 * se reconoce. `seed` (p. ej. el id del registro) reparte los puntos cercanos.
 */
export function ubicarVE(
  city: string | null,
  state: string | null,
  seed: string,
): LatLng | null {
  const c = norm(city);
  if (c && CIUDADES[c]) return jitter(CIUDADES[c], seed);
  const e = norm(state);
  if (e && ESTADOS[e]) return jitter(ESTADOS[e], seed);
  return null;
}
