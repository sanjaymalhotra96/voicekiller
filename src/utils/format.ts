// 72 -> "1:12" (or "01:12" with padMinutes), 3725 -> "1:02:05"
export function formatDuration(
  totalSeconds: number,
  { padMinutes = false }: { padMinutes?: boolean } = {},
) {
  const total = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${s}`;
  }
  return `${padMinutes ? String(m).padStart(2, '0') : m}:${s}`;
}

// Digits typed into a date field -> "dd/mm/yy" (slashes added as you type).
export function formatDateInput(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 6);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)]
    .filter(Boolean)
    .join('/');
}

// Date -> "09/09/2026" (day/month/year, as in the designs).
export function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// 3250585 -> "3.1MB", 900 -> "900B".
export function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded}${units[unit]}`;
}
