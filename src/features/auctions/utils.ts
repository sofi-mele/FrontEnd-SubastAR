import { useLocalSearchParams } from 'expo-router';

export function useId() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return id ?? '';
}

export function formatAuctionMoney(value: number, currency?: string) {
  return `${currency ?? 'ARS'} ${new Intl.NumberFormat('es-AR').format(value)}`;
}

export function formatAuctionDate(value?: string): string {
  if (!value) return 'A confirmar';
  const trimmed = value.trim();
  const plainMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);

  if (plainMatch && !hasTimezone) {
    const [, y, m, d, hh, mm] = plainMatch;
    const monthName = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(
      new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0)
    );
    return `${Number(d)} de ${monthName} de ${y} · ${hh}:${mm} hs`;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('day')} de ${get('month')} de ${get('year')} · ${get('hour')}:${get('minute')} hs`;
}
