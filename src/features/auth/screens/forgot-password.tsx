import { zodResolver } from '@hookform/resolvers/zod';
import { type Href, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { z } from 'zod';

import { Button, Card, Header, Input, Screen, StatusPanel } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { authService } from '@/services/api';
import { forgotPasswordSchema } from '@/features/auth/schemas';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const submit = handleSubmit(async ({ email }) => {
    try {
      await authService.requestPasswordReset(email);
    } catch {
      // ignorar errores del servidor — siempre mostrar mensaje genérico
    }
    setSubmittedEmail(email);
  });

  if (submittedEmail) {
    return (
      <Screen>
        <Header title="Recuperar contraseña" onBack={back} />
        <Card style={styles.formCard}>
          <StatusPanel icon="mail-outline" title="Revisá tu correo" message="Si el email existe, recibirás un código para restablecer tu contraseña." />
          <Button label="Continuar" onPress={() => router.push(`/reset-password?email=${encodeURIComponent(submittedEmail)}` as Href)} />
          <Button label="Volver al login" variant="ghost" onPress={() => router.replace('/login')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Recuperar contraseña" onBack={back} />
      <Card style={styles.formCard}>
        <StatusPanel icon="mail-outline" title="Código de recuperacion" message="Ingresá tu correo y te enviaremos un código para crear una nueva contraseña." />
        <Controller control={control} name="email" render={({ field }) => (
          <Input label="Correo electronico" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
        )} />
        <Button label={isSubmitting ? 'Enviando...' : 'Enviar código'} disabled={isSubmitting} onPress={submit} />
        <Button label="Volver al login" variant="ghost" onPress={() => router.replace('/login')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
});
