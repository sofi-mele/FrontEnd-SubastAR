import { zodResolver } from '@hookform/resolvers/zod';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { z } from 'zod';

import { Body, Button, Card, Header, Input, Screen, StatusPanel } from '@/components/ui/primitives';
import { colors, spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { authService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { login2faSchema } from '@/features/auth/schemas';

export function LoginTwoFactorScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { challengeId, email, message, returnTo } = useLocalSearchParams<{ challengeId?: string; email?: string; message?: string; returnTo?: string }>();
  const { signIn } = useSession();
  const [currentChallengeId, setCurrentChallengeId] = useState(challengeId ?? '');
  const [currentEmail, setCurrentEmail] = useState(email ?? '');
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState(message ?? '');
  const [isResending, setIsResending] = useState(false);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof login2faSchema>>({
    resolver: zodResolver(login2faSchema),
    defaultValues: { code: '' },
  });
  const submit = handleSubmit(async ({ code }) => {
    if (!currentChallengeId) {
      setApiError('No se encontró el desafío de seguridad. Volvé a iniciar sesión.');
      return;
    }
    try {
      setApiError('');
      const session = await authService.verifyLogin2fa(currentChallengeId, code);
      await signIn(session);
      router.replace((returnTo || '/(tabs)') as Href);
    } catch (error) {
      setApiError(errorToUserMessage(error, 'Código inválido.'));
    }
  });
  async function resend() {
    if (!currentChallengeId) {
      setApiError('No se encontró el desafío de seguridad. Volvé a iniciar sesión.');
      return;
    }
    try {
      setApiError('');
      setIsResending(true);
      const response = await authService.resendLogin2fa(currentChallengeId);
      setCurrentChallengeId(response.challengeId);
      setCurrentEmail(response.email);
      setInfoMessage('Te enviamos un nuevo código. El código anterior ya no es válido.');
    } catch (error) {
      setApiError(errorToUserMessage(error, 'No fue posible reenviar el código.'));
    } finally {
      setIsResending(false);
    }
  }
  return (
    <Screen>
      <Header title="Verificación de acceso" onBack={back} />
      <Card style={styles.formCard}>
        <StatusPanel
          icon="mail-unread-outline"
          title="Revisá tu correo"
          message={`Enviamos un código de seguridad a ${currentEmail || 'tu correo'}. Ingresálo para completar el inicio de sesión.`}
          tone="green"
        />
        <Controller control={control} name="code" render={({ field }) => (
          <Input label="Código de verificación" placeholder="000000" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} error={errors.code?.message} />
        )} />
        {infoMessage ? <Card style={styles.infoCard}><Body>{infoMessage}</Body></Card> : null}
        {apiError ? <ErrorNotice message={apiError} /> : null}
        <Button label={isSubmitting ? 'Verificando...' : 'Verificar código'} disabled={isSubmitting || isResending} onPress={submit} />
        <Button label={isResending ? 'Reenviando...' : 'Reenviar código'} variant="secondary" disabled={isSubmitting || isResending} onPress={resend} />
        <Button label="Volver al login" variant="ghost" onPress={() => router.replace('/login')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  infoCard: { backgroundColor: colors.successSoft, borderColor: colors.success },
});
