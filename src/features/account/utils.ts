import { Ionicons } from '@expo/vector-icons';
import { Linking, Platform } from 'react-native';

export function openExternalUrl(url?: string) {
  if (!url) return;
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url);
}

export function formatAmountWithCurrency(amount: number, currency?: string | null) {
  return `${currency ?? 'ARS'} ${amount.toLocaleString('es-AR')}`;
}

export function formatDateTimeLabel(value?: string) {
  if (!value) return '-';
  const trimmed = value.trim();
  const plainTimestampMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);

  // Backend may return timestamps without timezone. In that case, keep literal clock values
  // to avoid unintended timezone shifts on clients configured in different regions.
  if (plainTimestampMatch && !hasTimezone) {
    const [, year, month, day, hours, minutes] = plainTimestampMatch;
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(',', '');
}

export function chatIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'soporte': return 'chatbubble-ellipses-outline';
    case 'poliza': return 'shield-checkmark-outline';
    default: return 'chatbubble-outline';
  }
}

export function notificationIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'compra': return 'bag-check-outline';
    case 'multa': return 'warning-outline';
    case 'bien': return 'cube-outline';
    case 'poliza': return 'shield-checkmark-outline';
    default: return 'notifications-outline';
  }
}

export function validateBank(value: string) {
  if (!value.trim()) return 'Ingresá el nombre del banco';
  if (value.trim().length < 3) return 'Nombre demasiado corto';
  return '';
}

export function validateCbu(value: string) {
  if (!value.trim()) return 'Ingresá el CBU, IBAN o número de cuenta';
  if (/^\d+$/.test(value) && value.length !== 22) return 'El CBU argentino debe tener 22 dígitos';
  if (value.trim().length < 8) return 'Número de cuenta demasiado corto';
  return '';
}

export function validateAmount(value: string) {
  if (!value.trim()) return 'Ingresá un monto';
  if (isNaN(Number(value)) || Number(value) <= 0) return 'El monto debe ser mayor a 0';
  return '';
}

export function validateChequeNumber(value: string) {
  if (!value.trim()) return 'Ingresá el número de cheque';
  if (!/^\d+$/.test(value)) return 'Solo se permiten números';
  if (value.length < 4) return 'Número demasiado corto';
  return '';
}

export function luhnValid(raw: string) {
  const digits = raw.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateCardNumber(value: string) {
  const digits = value.replace(/\s/g, '');
  if (!digits) return 'Ingresá el número de tarjeta';
  if (!/^\d+$/.test(digits)) return 'Solo se permiten números';
  if (digits.length < 13 || digits.length > 19) return 'El número debe tener entre 13 y 19 dígitos';
  return '';
}

export function validateExpiry(value: string) {
  if (!value) return 'Ingresá el vencimiento';
  if (!/^\d{2}\/\d{2}$/.test(value)) return 'Formato inválido (MM/AA)';
  const [mm, yy] = value.split('/').map(Number);
  if (mm < 1 || mm > 12) return 'Mes inválido';
  const now = new Date();
  const expDate = new Date(2000 + yy, mm, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (expDate <= thisMonth) return 'La tarjeta está vencida';
  return '';
}

export function validateCvv(value: string) {
  if (!value) return 'Ingresá el código de seguridad';
  if (!/^\d{3,4}$/.test(value)) return 'Debe tener 3 o 4 dígitos';
  return '';
}

export function validateHolder(value: string) {
  if (!value.trim()) return 'Ingresá el nombre del titular';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-]+$/.test(value)) return 'Solo se permiten letras';
  if (value.trim().split(/\s+/).length < 2) return 'Ingresá nombre y apellido';
  return '';
}

export function validateDni(value: string) {
  if (!value) return 'Ingresá el DNI del titular';
  if (!/^\d{7,8}$/.test(value)) return 'El DNI debe tener 7 u 8 dígitos';
  return '';
}

export function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(raw: string, prev: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  if (raw.length < prev.length && raw.endsWith('/')) return digits.slice(0, 1);
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
