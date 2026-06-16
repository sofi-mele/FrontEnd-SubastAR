import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';

import { Button, Card, Header, Input, Screen, StatusPanel, StepIndicator } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { authService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { ApiError } from '@/services/http';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { verifySchema, registrationSteps } from '@/features/auth/schemas';
import { confirmCancelRegistration, messageForAuthError } from '@/features/auth/utils';

export function VerifyScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { registration, setRegistration } = useSession();
  const [apiError, setApiError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema), defaultValues: { code: '' },
  });
  const submit = handleSubmit(async ({ code }) => {
    const rawEmail = registration?.email || emailParam || '';
    const email = Array.isArray(rawEmail) ? rawEmail[0] ?? '' : rawEmail;
    if (!email) {
      setApiError('Volvé a registro para indicar el correo.');
      return;
    }
    try {
      const response = await authService.verify(email, code);
      setRegistration({ ...(registration ?? { email }), verificationToken: response.token_verificacion });
      router.push('/password');
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setApiError('Tu cuenta aún no fue aprobada. Recibirás un email cuando esté lista.');
      } else {
        setApiError(errorToUserMessage(error, 'Código inválido.'));
      }
    }
  });
  return (
    <Screen>
      <Header title="Verifica el código" subtitle="Paso 2 de 4" onBack={back} />
      <Card style={styles.formCard}>
        <StepIndicator steps={registrationSteps} current={1} />
        <StatusPanel icon="mail-outline" title="Código de verificación" message="Ingresá el código enviado por correo para continuar con la creación de tu cuenta." />
        {registration?.email ? <Text style={styles.pendingEmail}>{registration.email}</Text> : null}
        <Controller control={control} name="code" render={({ field }) => <Input label="Código de verificación" placeholder="0000" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} error={errors.code?.message} />} />
        {apiError ? <ErrorNotice message={apiError} /> : null}
        <Button label={isSubmitting ? 'Verificando...' : 'Verificar'} disabled={isSubmitting} onPress={submit} />
        <Button label="Cancelar registro y empezar de nuevo" variant="ghost" onPress={() => confirmCancelRegistration(async () => {
          if (!registration?.email) {
            setRegistration(null);
            router.replace('/register');
            return;
          }
          try {
            setApiError('');
            await authService.cancelPendingRegistration(registration.email);
            setRegistration(null);
            router.replace('/register');
          } catch (error) {
            setApiError(messageForAuthError(error, 'No fue posible cancelar el registro pendiente.'));
          }
        })} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  pendingEmail: { color: colors.primary, fontSize: typography.body, fontFamily: fonts.medium },
});
