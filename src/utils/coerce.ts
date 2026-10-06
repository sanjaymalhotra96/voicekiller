// Plain values out of untyped rows and API JSON.

export const asText = (value: unknown) =>
  typeof value === 'string' ? value : value == null ? '' : String(value);

// Finite number, or 0.
export const asNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// "https://x/conversion/conversion_3f5c.mp3?v=1" -> "conversion_3f5c": the
// file name of a URL, without folders, query or extension.
const withoutExtension = (name: string) => name.replace(/\.[^.]+$/, '');

export const fileNameFromUrl = (url: string) => {
  const last = url.split(/[?#]/)[0].split('/').pop() ?? '';
  try {
    return withoutExtension(decodeURIComponent(last));
  } catch {
    // Malformed %-escapes: keep the raw name.
    return withoutExtension(last);
  }
};
