import { useQuery } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { PaymentMethodCard } from '@/components/domain/cards';
import { ActionRow, Button, Card, Divider, Header, Screen, SectionLabel, SectionHeader, StatusPanel, StepIndicator, LoadingState } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { paymentService } from '@/services/api';
import { registrationSteps } from '@/features/auth/schemas';

export function OnboardingPaymentScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['payments'],
    queryFn: paymentService.list,
    refetchOnMount: 'always',
  });
  const hasPending = isLoading || isFetching;
  const hasPayment = (data?.length ?? 0) >= 1;
  return (
    <Screen>
      <Header title="Seleccioná un medio de pago" subtitle="Paso 4 de 4" onBack={back} />
      <Card style={styles.formCard}>
        <StepIndicator steps={registrationSteps} current={3} />
        <StatusPanel
          icon="card-outline"
          title="Medio de pago requerido para pujar"
          message="Podés explorar subastas, pero para ofertar necesitás al menos un medio aprobado por la empresa."
          tone="yellow"
        />
        {hasPending ? <LoadingState /> : hasPayment ? (
          <>
            <SectionHeader title="Medios agregados" subtitle="Ya podés continuar o agregar otro" />
            {data!.map((payment) => (
              <Card key={payment.id} style={styles.paymentItem}>
                <PaymentMethodCard payment={payment} selected={payment.verified} />
              </Card>
            ))}
            <Divider />
          </>
        ) : null}
        <SectionLabel>Agregar medio de pago</SectionLabel>
        {[
          { label: 'Cuenta bancaria', type: 'cuenta_bancaria', icon: 'business-outline' as const, description: 'Reservá fondos para operar en subastas.' },
          { label: 'Tarjeta de crédito', type: 'tarjeta_credito', icon: 'card-outline' as const, description: 'Usá una tarjeta a nombre del titular.' },
          { label: 'Cheque certificado', type: 'cheque_certificado', icon: 'wallet-outline' as const, description: 'Adjuntá el respaldo del cheque para revisión.' },
        ].map((option) => (
          <ActionRow
            key={option.type}
            icon={option.icon}
            label={option.label}
            description={option.description}
            onPress={() => router.push({ pathname: '/profile/payments/add', params: { type: option.type, onboarding: 'true', returnTo } })}
          />
        ))}
        <Button
          label="Continuar"
          disabled={!hasPayment}
          onPress={() => router.replace((returnTo || '/(tabs)') as Href)}
        />
        <Button
          label="Omitir por ahora"
          variant="ghost"
          onPress={() => router.replace((returnTo || '/(tabs)') as Href)}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  paymentItem: { gap: spacing.sm },
});
