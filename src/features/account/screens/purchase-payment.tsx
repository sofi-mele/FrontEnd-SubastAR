import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { formatCurrency, PaymentMethodCard } from '@/components/domain/cards';
import { Body, Button, EmptyState, ErrorState, Header, LoadingState, Screen, SectionHeader, Title } from '@/components/ui/primitives';
import { useSafeBack } from '@/hooks/use-safe-back';
import { paymentService, purchaseService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { SummaryRow } from '@/features/account/components/summary-row';

export function PurchasePaymentScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paymentId, setPaymentId] = useState('');
  const { data: purchase, isLoading: loadingPurchase, isError: purchaseError } = useQuery({ queryKey: ['purchase', id], queryFn: () => purchaseService.get(id ?? '') });
  const { data: payments, isLoading: loadingPayments, isError: paymentsError } = useQuery({ queryKey: ['payments'], queryFn: paymentService.list });
  const usablePayments = payments?.filter((payment) => payment.verified) ?? [];
  const pay = useMutation({
    mutationFn: () => purchaseService.regularize(id ?? '', paymentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['penalties'] });
      queryClient.invalidateQueries({ queryKey: ['account-state'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.replace(`/purchases/${id}`);
    },
  });
  const insolvency = useMutation({
    mutationFn: () => purchaseService.declareInsolvency(id ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-state'] });
      router.replace('/(tabs)');
    },
  });
  if (loadingPurchase || loadingPayments) return <Screen><LoadingState /></Screen>;
  if (purchaseError || paymentsError || !purchase) return <Screen><Header title="Regularizar pago" onBack={back} /><ErrorState /></Screen>;
  return (
    <Screen>
      <Header title="Regularizar pago" onBack={back} />
      <Title>{purchase.lot.title}</Title>
      <SummaryRow label="Monto a regularizar" value={formatCurrency(purchase.amount + purchase.fee + purchase.penalty + (purchase.shippingCost ?? 0))} bold />
      <Body muted>Seleccioná un medio verificado para confirmar el pago pendiente.</Body>
      <SectionHeader title="Medios verificados" subtitle="Usá un medio aprobado para completar el pago" />
      {usablePayments.length ? usablePayments.map((payment) => (
        <Pressable key={payment.id} onPress={() => setPaymentId(payment.id)}>
          <PaymentMethodCard payment={payment} selected={paymentId === payment.id} />
        </Pressable>
      )) : (
        <EmptyState title="Sin medios habilitados" message="Agregá o verificá un medio de pago antes de regularizar la compra." />
      )}
      {!usablePayments.length ? <Button label="Agregar medio de pago" variant="secondary" onPress={() => router.push('/profile/payments')} /> : null}
      <Button label={pay.isPending ? 'Confirmando pago...' : 'Confirmar pago'} disabled={!paymentId || pay.isPending} onPress={() => pay.mutate()} />
      {pay.isError ? <Body muted>{errorToUserMessage(pay.error, 'No fue posible regularizar el pago.')}</Body> : null}
      <Button
        label={insolvency.isPending ? 'Procesando...' : 'No cuento con el dinero suficiente'}
        variant="ghost"
        disabled={insolvency.isPending}
        onPress={() => insolvency.mutate()}
      />
      {insolvency.isError ? <Body muted>{errorToUserMessage(insolvency.error, 'No fue posible procesar la declaración.')}</Body> : null}
    </Screen>
  );
}
