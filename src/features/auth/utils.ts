import { Alert, Platform } from 'react-native';

import { errorToUserMessage, getServerConnectionMessage } from '@/services/errors';
import { ApiError, ApiNetworkError } from '@/services/http';

export function getPasswordChecks(password: string) {
  return [
    { label: 'Mínimo 8 caracteres', valid: password.length >= 8 },
    { label: 'Al menos una letra mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Al menos un número', valid: /[0-9]/.test(password) },
    { label: 'Al menos un carácter especial', valid: /[!@#$%^&*()\-_+=\[\]{}|;':",.<>?/`~\\]/.test(password) },
    { label: 'No puede comenzar con un número', valid: password.length === 0 || !/^[0-9]/.test(password) },
  ];
}

export function messageForAuthError(error: unknown, fallback: string) {
  if (error instanceof ApiNetworkError) return getServerConnectionMessage();
  return errorToUserMessage(error, fallback);
}

export function messageForLoginError(error: unknown) {
  if (error instanceof ApiNetworkError) return getServerConnectionMessage();
  if (error instanceof ApiError && [400, 401, 404].includes(error.status)) return 'Email o contraseña incorrectos.';
  return 'Email o contraseña incorrectos.';
}

export function confirmCancelRegistration(onConfirm: () => void) {
  const message = 'Esto eliminara tu registro pendiente y vas a poder registrarte nuevamente. Queres continuar?';
  if (Platform.OS === 'web') {
    if (globalThis.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('Cancelar registro', message, [
    { text: 'No', style: 'cancel' },
    { text: 'Si, cancelar', style: 'destructive', onPress: onConfirm },
  ]);
}
