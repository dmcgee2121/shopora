export function normalizeId(id) {
  if (id === null || id === undefined) {
    return '';
  }

  return String(id).trim();
}

export function idsMatch(a, b) {
  return normalizeId(a) === normalizeId(b);
}
