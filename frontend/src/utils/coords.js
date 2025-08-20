export const coordsRegex = /^\s*-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?\s*$/;

export function isCoordString(str) {
  return coordsRegex.test(str);
}

export function parseCoordString(str) {
  if (!isCoordString(str)) return null;
  const [latStr, lngStr] = str.split(',').map((s) => s.trim());
  return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
}
