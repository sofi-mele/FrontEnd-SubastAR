import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button, Screen, StatusState } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import type { PaymentMethodKind } from '@/types/domain';

export function PaymentSuccessScreen() {
  const router = useRouter();
  const { onboarding, returnTo, type } = useLocalSearchParams<{ onboarding?: string; returnTo?: string; type?: PaymentMethodKind }>();
  const chequePending = type === 'cheque_certificado';
  return (
    <Screen style={styles.successScreen}>
      <StatusState
        icon={chequePending ? 'time-outline' : 'checkmark-circle-outline'}
        title={chequePending ? 'Cheque enviado a revisión' : '¡Se agregó el medio de pago exitosamente!'}
        message={chequePending ? 'Validaremos la documentación. El cheque se habilitará para pujas cuando sea aprobado.' : 'Ya podés utilizarlo para participar en las subastas disponibles.'}
        tone={chequePending ? 'yellow' : 'green'}
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
