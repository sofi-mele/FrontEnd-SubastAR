import { zodResolver } from '@hookform/resolvers/zod';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Body, Button, Card, Header, IconButton, Input, Screen, StatusPanel } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { authService } from '@/services/api';
import { ApiError } from '@/services/http';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { loginSchema } from '@/features/auth/schemas';
import { messageForLoginError } from '@/features/auth/utils';

export function LoginScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { enterAsGuest, signIn, setRegistration } = useSession();
  const [apiError, setApiError] = useState('');
  const [pendingRevisionEmail, setPendingRevisionEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const submit = handleSubmit(async (values) => {
    try {
      setApiError('');
      setPendingRevisionEmail('');
      const session = await authService.login(values.email, values.password);
      await signIn(session);
      router.replace((returnTo || '/(tabs)') as Href);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        if (error.message === 'pendiente_revision') {
          setApiError('Tu cuenta aún está siendo revisada. Te avisaremos por email cuando esté aprobada.');
          setPendingRevisionEmail(values.email);
        } else if (error.message === 'pendiente_codigo') {
          setRegistration({ email: values.email });
          router.push('/registration-pending' as Href);
        } else {
          setApiError(messageForLoginError(error));
        }
      } else {
        setApiError(messageForLoginError(error));
      }
    }
  });
  return (
    <Screen>
      <Header title="Iniciar sesión" onBack={back} />
      <Card style={styles.formCard}>
        <StatusPanel icon="lock-closed-outline" title="Acceso seguro" message="Ingresá para pujar, vender bienes, revisar compras y administrar tus medios de pago." />
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <Input label="Correo electrónico" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <Input
            label="Contraseña"
            secureTextEntry={!showPassword}
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            right={<IconButton icon={showPassword ? 'eye-off-outline' : 'eye-outline'} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setShowPassword((v) => !v)} />}
          />
        )} />
        {apiError ? <ErrorNotice message={apiError} /> : null}
        {pendingRevisionEmail ? <Button label="Ver estado de mi registro" variant="secondary" onPress={() => { setRegistration({ email: pendingRevisionEmail }); router.push('/registration-pending' as Href); }} /> : null}
        <Button label={isSubmitting ? 'Ingresándo...' : 'Iniciar sesión'} disabled={isSubmitting} onPress={submit} />
        <Button label="¿No tienes una cuenta? Regístrate" variant="ghost" onPress={() => router.push({ pathname: '/register', params: { returnTo } })} />
        <Button label="Olvidaste tu contraseña?" variant="ghost" onPress={() => router.push('/forgot-password' as Href)} />
        <View style={styles.centerSeparator}><Body muted>O</Body></View>
        <Button label="Continúa como un invitado" variant="ghost" onPress={() => { enterAsGuest(); router.replace('/(tabs)'); }} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  centerSeparator: { alignItems: 'center' },
});
