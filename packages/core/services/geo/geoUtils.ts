/* Utils GEO – version robuste et rétro-compatible */
export type BBox = [number, number, number, number]; // [minLng,minLat,maxLng,maxLat]

const isNum = (v: any) => typeof v === 'number' && Number.isFinite(v);
export function validateCoordinates(lat?: number, lng?: number) {
  return isNum(lat) && isNum(lng) && lat! >= -90 && lat! <= 90 && lng! >= -180 && lng! <= 180;
}

/** Parse une BBox depuis une string "minLng,minLat,maxLng,maxLat" **ou** un array */
export function parseBBox(bboxInput: string | number[] | undefined | null): BBox | null {
  if (!bboxInput) return null;

  let parts: number[];
  if (Array.isArray(bboxInput)) {
    parts = bboxInput.map(Number);
  } else if (typeof bboxInput === 'string') {
    parts = bboxInput.split(',').map(Number);
  } else {
    return null;
  }

  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return null;

  const [minLng, minLat, maxLng, maxLat] = parts;
  if (!validateCoordinates(minLat, minLng) || !validateCoordinates(maxLat, maxLng)) return null;

  // normalisation min/max
  const a = Math.min(minLng, maxLng);
  const b = Math.min(minLat, maxLat);
  const c = Math.max(minLng, maxLng);
  const d = Math.max(minLat, maxLat);
  return [a, b, c, d];
}

/** Parse liste 'a,b,c' → string[] safe */
export function parseCSVList(input?: string | null): string[] {
  if (!input) return [];
  return String(input)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/** Parse JSON stocké en string → any[] */
export function parseMaybeJSONList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
  }
  return [];
}
