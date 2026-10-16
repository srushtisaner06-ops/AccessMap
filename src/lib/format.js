const DAY = 86400000;

export function ageDays(ts, now = Date.now()) {
  return Math.max(0, (now - ts) / DAY);
}

export function relTime(ts, now = Date.now()) {
  if (!Number.isFinite(ts)) return 'unknown time';
  const mins = (now - ts) / 60000;
  if (mins < 1) return 'just now';
  if (mins < 60) return `${Math.floor(mins)} min ago`;
  const hrs = mins / 60;
  if (hrs < 24) return `${Math.floor(hrs)} hr ago`;
  const d = Math.floor(hrs / 24);
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  if (d < 60) return `${Math.floor(d / 7)} weeks ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} yr ago`;
}

export function absDate(ts) {
  if (!Number.isFinite(ts)) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function toLocalInputValue(ts = Date.now()) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
