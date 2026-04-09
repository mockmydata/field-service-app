export const clampHour = (v: string) => { const n = parseInt(v, 10); if (isNaN(n)) return v; if (n > 12) return '12'; return v; };
export const clampMin  = (v: string) => { const n = parseInt(v, 10); if (isNaN(n)) return v; if (n > 59) return '59'; return v; };
export const validHour = (h: string) => /^(1[0-2]|0?[1-9])$/.test(h.trim());
export const validMin  = (m: string) => /^[0-5][0-9]$/.test(m.trim());

export function computeDuration(startNum: string, startP: 'AM'|'PM', endNum: string, endP: 'AM'|'PM'): string {
  const toMins = (num: string, period: 'AM'|'PM') => {
    const match = num.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return h * 60 + m;
  };
  const sm = toMins(startNum, startP);
  const em = toMins(endNum, endP);
  if (sm === null || em === null || em - sm <= 0) return '';
  const diff = em - sm;
  const hrs  = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`;
}

export function calcEndTime(time?: string, duration?: number): string | null {
  if (!time || !duration) return null;
  const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  const totalMins = h * 60 + m + duration;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  const endPeriod = endH < 12 ? 'AM' : 'PM';
  const displayH = endH % 12 === 0 ? 12 : endH % 12;
  return `${displayH}:${String(endM).padStart(2, '0')} ${endPeriod}`;
}

export function formatTimeRange(time?: string, duration?: number): string | null {
  if (!time) return null;
  if (time.includes('–') || time.includes('-')) return time;
  const end = calcEndTime(time, duration);
  return end ? `${time} – ${end}` : time;
}

export function parseCombinedTime(raw?: string) {
  if (!raw) return { start: '', startPeriod: 'AM' as 'AM'|'PM', end: '', endPeriod: 'AM' as 'AM'|'PM' };
  const parts = raw.split(/\s*[–-]\s*/);
  const parse = (t: string) => ({
    num:    t.replace(/\s*(AM|PM)/i, '').trim(),
    period: (/PM/i.test(t) ? 'PM' : 'AM') as 'AM'|'PM',
  });
  const s = parse(parts[0] ?? '');
  const e = parse(parts[1] ?? '');
  return { start: s.num, startPeriod: s.period, end: e.num, endPeriod: e.period };
}

export function parseHM(t: string) {
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  return match ? { h: match[1], m: match[2] } : { h: '', m: '' };
}