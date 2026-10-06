// Plain values out of untyped rows and API JSON.

export const asText = (value: unknown) =>
  typeof value === 'string' ? value : value == null ? '' : String(value);

// Finite number, or 0.
export const asNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
