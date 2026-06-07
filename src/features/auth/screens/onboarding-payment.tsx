import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ActionRow, Button, Card, Header, Screen, SectionLabel, StatusPanel, StepIndicator } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { registrationSteps } from '@/features/auth/schemas';

export function OnboardingPaymentScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  return (
    <Screen>
      <Header title="Seleccioná un medio de pago" subtitle="Paso 4 de 4" onBack={back} />
      <Card style={styles.formCard}>
        <StepIndicator steps={registrationSteps} current={3} />
        <StatusPanel icon="card-outline" title="Medio de pago requerido para pujar" message="Podés explorar subastas, pero para ofertar necesitás al menos un medio aprobado por la empresa." tone="yellow" />
        <SectionLabel>Agregar medio de pago</SectionLabel>
        {[
          { label: 'Cuenta bancaria', type: 'cuenta_bancaria', description: 'Reservá fondos para operar en subastas.' },
          { label: 'Tarjeta de crédito', type: 'tarjeta_credito', description: 'Usá una tarjeta a nombre del titular.' },
          { label: 'Cheque certificado', type: 'cheque_certificado', description: 'Adjuntá el respaldo del cheque para revisión.' },
        ].map((option, index) => (
          <ActionRow key={option.type} icon={index === 0 ? 'business-outline' : index === 1 ? 'card-outline' : 'wallet-outline'} label={option.label} description={option.description} onPress={() => router.push({ pathname: '/profile/payments/add', params: { type: option.type, onboarding: 'true', returnTo } })} />
        ))}
        <Button label="Omitir por ahora" variant="ghost" onPress={() => router.replace((returnTo || '/(tabs)') as Href)} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
});
