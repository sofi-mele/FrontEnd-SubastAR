import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Body, Button, Card, Screen, StatusPanel } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';
import { authService } from '@/services/api';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { confirmCancelRegistration, messageForAuthError } from '@/features/auth/utils';

export function RegistrationPendingScreen() {
  const router = useRouter();
  const { registration, setRegistration } = useSession();
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isCancelling, setCancelling] = useState(false);
  const [isResending, setResending] = useState(false);
  async function resendCode() {
    if (!registration?.email) return;
    try {
      setApiError('');
      setInfoMessage('');
      setResending(true);
      await authService.resendRegistrationCode(registration.email);
      setInfoMessage('Te enviamos un nuevo código. Revisá tu correo.');
    } catch (error) {
      setApiError(messageForAuthError(error, 'No fue posible reenviar el código.'));
    } finally {
      setResending(false);
    }
  }
  async function cancelRegistration() {
    if (!registration?.email) {
      setRegistration(null);
      router.replace('/register');
      return;
    }
    try {
      setApiError('');
      setCancelling(true);
      await authService.cancelPendingRegistration(registration.email);
      setRegistration(null);
      router.replace('/register');
    } catch (error) {
      setApiError(messageForAuthError(error, 'No fue posible cancelar el registro pendiente.'));
    } finally {
      setCancelling(false);
    }
  }
  return (
    <Screen style={styles.pending}>
      <Card style={styles.formCard}>
        <StatusPanel icon="mail-unread-outline" title="Solicitud enviada" message="Recibimos tus datos y las imágenes del DNI. Cuando tu cuenta sea aprobada, recibirás el código por correo." tone="green" />
        {registration?.email ? <Text style={styles.pendingEmail}>{registration.email}</Text> : null}
        {infoMessage ? <Card style={styles.infoCard}><Body>{infoMessage}</Body></Card> : null}
        {apiError ? <ErrorNotice message={apiError} /> : null}
        <Button label="Ya recibí mi código" onPress={() => router.push({ pathname: '/verify', params: { email: registration?.email ?? '' } })} />
        <Button label={isResending ? 'Enviando...' : 'No recibí el código'} variant="secondary" disabled={isResending} onPress={resendCode} />
        <Button label={isCancelling ? 'Cancelando...' : 'Cancelar registro y empezar de nuevo'} variant="secondary" disabled={isCancelling} onPress={() => confirmCancelRegistration(cancelRegistration)} />
        <Button label="Volver al acceso" variant="ghost" onPress={() => router.replace('/welcome')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pending: { justifyContent: 'center' },
  formCard: { gap: spacing.md },
  infoCard: { backgroundColor: colors.successSoft, borderColor: colors.success },
  pendingEmail: { color: colors.primary, fontSize: typography.body, fontFamily: fonts.medium },
});
