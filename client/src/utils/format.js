export function formatDate(value, options = { dateStyle: 'medium' }) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(undefined, options).format(date);
}

// 3725 -> "1:02:05", 95 -> "1:35"
export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// 95 -> "2 min" (rounded up), for listings
export function formatMinutes(totalSeconds, fallbackMinutes) {
  const minutes = totalSeconds ? Math.max(1, Math.ceil(totalSeconds / 60)) : fallbackMinutes;
  return minutes ? `${minutes} min` : '';
}
