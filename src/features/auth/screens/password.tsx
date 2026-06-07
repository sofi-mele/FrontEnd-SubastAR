import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button, Card, Header, IconButton, Input, Screen, StepIndicator, Body } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { authService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { ApiError } from '@/services/http';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { passwordSchema, passwordRegex, registrationSteps } from '@/features/auth/schemas';
import { getPasswordChecks } from '@/features/auth/utils';

export function PasswordScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { registration, signIn, setRegistration } = useSession();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema), defaultValues: { password: '', confirmation: '' },
  });
  const currentPassword = watch('password');
  const currentConfirmation = watch('confirmation');
  const passwordChecks = getPasswordChecks(currentPassword);
  const isPasswordValid = passwordRegex.test(currentPassword);
  const passwordsMatch = currentPassword === currentConfirmation;
  const submit = handleSubmit(async (values) => {
    if (!registration?.verificationToken) {
      setApiError('Primero verificá el código de correo.');
      return;
    }
    try {
      const session = await authService.completeRegistration(registration.verificationToken, values.password, values.confirmation);
      await signIn(session);
      setRegistration(null);
      router.push({ pathname: '/onboarding-payment', params: { returnTo: registration.returnTo } });
    } catch (error) {
      const message = errorToUserMessage(error, '');
      const normalizedMessage = message.toLowerCase();
      if (
        (error instanceof ApiError && error.status === 400)
        || normalizedMessage.includes('faltan campos obligatorios')
        || normalizedMessage.includes('contraseña')
        || normalizedMessage.includes('password')
        || normalizedMessage.includes('400')
      ) {
        setApiError('La contraseña no cumple los requisitos de seguridad. Revisá la lista de condiciones debajo.');
        return;
      }
      setApiError(message || 'No fue posible completar el registro.');
    }
  });
  return (
    <Screen>
      <Header title="Seguridad" subtitle="Paso 3 de 4" onBack={back} />
      <Card style={styles.formCard}>
        <StepIndicator steps={registrationSteps} current={2} />
        <Body muted>Elegí una contraseña segura para proteger tus pujas, compras y documentación.</Body>
        <Controller control={control} name="password" render={({ field }) => (
          <Input
            label="Contraseña"
            secureTextEntry={!showPassword}
            value={field.value}
            onChangeText={field.onChange}
            error={errors.password?.message}
            right={<IconButton icon={showPassword ? 'eye-off-outline' : 'eye-outline'} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setShowPassword((visible) => !visible)} />}
          />
        )} />
        <Controller control={control} name="confirmation" render={({ field }) => (
          <Input
            label="Confirma tu contraseña"
            secureTextEntry={!showConfirmation}
            value={field.value}
            onChangeText={field.onChange}
            error={errors.confirmation?.message}
            right={<IconButton icon={showConfirmation ? 'eye-off-outline' : 'eye-outline'} accessibilityLabel={showConfirmation ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'} onPress={() => setShowConfirmation((visible) => !visible)} />}
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
        {apiError ? <ErrorNotice message={apiError} /> : null}
        <Button label={isSubmitting ? 'Creando cuenta...' : 'Registrarse'} disabled={!isPasswordValid || !passwordsMatch || isSubmitting} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  passwordRulesCard: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  passwordRulesError: { color: colors.danger, fontFamily: fonts.bold, fontSize: typography.label, marginBottom: spacing.xs },
  passwordRulesTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: typography.label, marginBottom: spacing.xs },
  passwordRuleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  passwordRuleText: { fontSize: typography.label, fontFamily: fonts.regular },
  passwordRuleValid: { color: colors.success },
  passwordRuleInvalid: { color: colors.textMuted },
});
