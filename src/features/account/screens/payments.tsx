import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PaymentMethodCard } from '@/components/domain/cards';
import { ActionRow, Button, Card, ConfirmationModal, Divider, EmptyState, ErrorState, Header, LoadingState, Screen, SectionHeader } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { paymentService } from '@/services/api';

export function PaymentsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const [selectedForRemoval, setSelectedForRemoval] = useState<string>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['payments'], queryFn: paymentService.list });
  const remove = useMutation({
    mutationFn: paymentService.remove,
    onSuccess: () => {
      setSelectedForRemoval(undefined);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
  return (
    <Screen>
      <Header title="Medios de pago" onBack={back} />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : data?.length ? data.map((payment) => (
        <Card key={payment.id} style={styles.itemCard}>
          <PaymentMethodCard payment={payment} selected={payment.verified} />
          <Divider />
          <View style={styles.cardActionsRow}>
            <Button label="Eliminar" variant="ghost" onPress={() => setSelectedForRemoval(payment.id)} />
          </View>
        </Card>
      )) : <EmptyState title="Sin medios de pago" message="Agregá uno para participar de una puja." />}
      <SectionHeader title="Agregar medio" subtitle="Elegí el tipo de validación que necesites" />
      <ActionRow icon="card-outline" label="Tarjeta de crédito" description="Alta rápida para pagos y pujas." onPress={() => router.push({ pathname: '/profile/payments/add', params: { type: 'tarjeta_credito' } })} />
      <ActionRow icon="business-outline" label="Cuenta bancaria" description="Reservá fondos para operar." onPress={() => router.push({ pathname: '/profile/payments/add', params: { type: 'cuenta_bancaria' } })} />
      <ActionRow icon="wallet-outline" label="Cheque certificado" description="Requiere documentación para revisión." onPress={() => router.push({ pathname: '/profile/payments/add', params: { type: 'cheque_certificado' } })} />
      <ConfirmationModal
        visible={!!selectedForRemoval}
        title="Eliminar medio de pago"
        message="Este medio dejará de estar disponible para futuras pujas y pagos pendientes."
        confirmLabel="Eliminar"
        pending={remove.isPending}
        onClose={() => setSelectedForRemoval(undefined)}
        onConfirm={() => selectedForRemoval && remove.mutate(selectedForRemoval)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  cardActionsRow: { flexDirection: 'row', justifyContent: 'flex-end' },
});
