import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button, Screen, StatusState } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
export function PaymentSuccessScreen() {
  const router = useRouter();
  const { onboarding, returnTo } = useLocalSearchParams<{ onboarding?: string; returnTo?: string }>();
  return (
    <Screen style={styles.successScreen}>
      <StatusState
        icon="time-outline"
        title="Medio de pago recibido"
        message="La empresa revisará los datos antes de habilitarlo para pujas y pagos."
        tone="yellow"
      />
      <Button
        label="Agregar otro medio de pago"
        onPress={() => router.replace(onboarding === 'true' ? { pathname: '/onboarding-payment', params: { returnTo } } : '/profile/payments')}
      />
      <Button label="Volver" variant="secondary" onPress={() => router.replace((returnTo || '/(tabs)') as Href)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  successScreen: { alignItems: 'center', paddingTop: spacing.huge },
});
