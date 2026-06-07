import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Body, Button, Card, Header, IconButton, Input, Screen, StatusPanel } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { authService } from '@/services/api';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { resetPasswordSchema, passwordRegex } from '@/features/auth/schemas';
import { getPasswordChecks, messageForAuthError } from '@/features/auth/utils';

export function ResetPasswordScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendInfo, setResendInfo] = useState('');
  const [resendError, setResendError] = useState('');
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmation: '' },
  });
  const currentPassword = watch('password');
  const currentConfirmation = watch('confirmation');
  const passwordChecks = getPasswordChecks(currentPassword);
  const isPasswordValid = passwordRegex.test(currentPassword);
  const passwordsMatch = currentPassword === currentConfirmation;
  async function resend() {
    if (!email) return;
    try {
      setResendInfo('');
      setResendError('');
      setIsResending(true);
      await authService.requestPasswordReset(Array.isArray(email) ? email[0] : email);
      setResendInfo('Te reenviamos el token por email.');
    } catch (error) {
      setResendError(messageForAuthError(error, 'No fue posible reenviar el token.'));
    } finally {
      setIsResending(false);
    }
  }
  const submit = handleSubmit(async ({ code, password, confirmation }) => {
    if (!email) {
      setApiError('Primero indica el correo de la cuenta.');
      return;
    }
    try {
      setApiError('');
      await authService.confirmPasswordReset(email, code, password, confirmation);
      setInfoMessage('Contrasena actualizada. Ya podes iniciar sesion.');
      setTimeout(() => router.replace('/login'), 900);
    } catch (error) {
      setApiError(messageForAuthError(error, 'No fue posible actualizar la contraseña.'));
    }
  });
  return (
    <Screen>
      <Header title="Nueva contraseña" onBack={back} />
      <Card style={styles.formCard}>
        <StatusPanel icon="shield-checkmark-outline" title="Completa la recuperacion" message={email ? `Código enviado a ${email}` : 'Ingresá el código recibido y tu nueva contraseña.'} />
        <Controller control={control} name="code" render={({ field }) => (
          <Input label="Token de recuperación" placeholder="Pegá el token que recibiste por email" value={field.value} onChangeText={field.onChange} error={errors.code?.message} />
        )} />
        {resendInfo ? <Card style={styles.infoCard}><Body>{resendInfo}</Body></Card> : null}
        {resendError ? <ErrorNotice message={resendError} /> : null}
        <Button label={isResending ? 'Enviando...' : 'No recibí el token'} variant="secondary" disabled={isResending} onPress={resend} />
        <Controller control={control} name="password" render={({ field }) => (
          <Input
            label="Nueva contraseña"
            secureTextEntry={!showPassword}
            value={field.value}
            onChangeText={field.onChange}
            error={errors.password?.message}
            right={<IconButton icon={showPassword ? 'eye-off-outline' : 'eye-outline'} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setShowPassword((visible) => !visible)} />}
          />
        )} />
        <Controller control={control} name="confirmation" render={({ field }) => (
          <Input
            label="Confirmar contraseña"
            secureTextEntry={!showConfirmation}
            value={field.value}
            onChangeText={field.onChange}
            error={errors.confirmation?.message}
            right={<IconButton icon={showConfirmation ? 'eye-off-outline' : 'eye-outline'} accessibilityLabel={showConfirmation ? 'Ocultar confirmacion' : 'Mostrar confirmacion'} onPress={() => setShowConfirmation((visible) => !visible)} />}
          />
        )} />
        <View style={styles.passwordRulesCard}>
          {currentPassword && !isPasswordValid ? <Text style={styles.passwordRulesError}>La contraseña no cumple los requisitos de seguridad.</Text> : null}
          <Text style={styles.passwordRulesTitle}>Tu contraseña debe cumplir:</Text>
          {passwordChecks.map((rule) => (
            <View key={rule.label} style={styles.passwordRuleRow}>
              <Ionicons name={rule.valid ? 'checkmark-circle-outline' : 'close-circle-outline'} size={17} color={rule.valid ? colors.success : colors.textMuted} />
              <Text style={[styles.passwordRuleText, rule.valid ? styles.passwordRuleValid : styles.passwordRuleInvalid]}>{rule.label}</Text>
            </View>
          ))}
        </View>
        {infoMessage ? <Card style={styles.infoCard}><Body>{infoMessage}</Body></Card> : null}
        {apiError ? <ErrorNotice message={apiError} /> : null}
        <Button label={isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'} disabled={!isPasswordValid || !passwordsMatch || isSubmitting} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  infoCard: { backgroundColor: colors.successSoft, borderColor: colors.success },
  passwordRulesCard: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  passwordRulesError: { color: colors.danger, fontFamily: fonts.bold, fontSize: typography.label, marginBottom: spacing.xs },
  passwordRulesTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: typography.label, marginBottom: spacing.xs },
  passwordRuleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  passwordRuleText: { fontSize: typography.label, fontFamily: fonts.regular },
  passwordRuleValid: { color: colors.success },
  passwordRuleInvalid: { color: colors.textMuted },
});
