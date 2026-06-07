import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { formatCurrency, PaymentMethodCard } from '@/components/domain/cards';
import { Body, Button, Card, Divider, EmptyState, Header, LoadingState, Screen, SecurityNote, StatusState, Title } from '@/components/ui/primitives';
import { colors, fonts, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { auctionService, paymentService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { ApiError } from '@/services/http';
import { formatAuctionMoney } from '@/features/auctions/utils';

export function ConfirmBidScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { id, amount, paymentId, itemId } = useLocalSearchParams<{ id: string; amount?: string; paymentId?: string; itemId?: string }>();
  const { data: payments, isLoading } = useQuery({ queryKey: ['payments'], queryFn: paymentService.list });
  const { data: auction, isLoading: loadingAuction } = useQuery({ queryKey: ['auction', id], queryFn: () => auctionService.get(id), enabled: !!id });
  const { data: live, isLoading: loadingLive } = useQuery({ queryKey: ['live', id], queryFn: () => auctionService.live(id), enabled: !!id });
  const [accepted, setAccepted] = useState(false);
  const payment = payments?.find((method) => method.id === paymentId);
  const amountValue = Number(amount);
  const hasInvalidAmount = !Number.isFinite(amountValue);
  const belowCurrentMinimum = live ? amountValue < live.minBid : false;
  const currency = auction?.currency ?? 'ARS';
  const mutation = useMutation({
    mutationFn: () => auctionService.bid(id, Number(amount), paymentId ?? ''),
    onSuccess: () => {
      setAccepted(true);
      queryClient.invalidateQueries({ queryKey: ['live', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
  if (isLoading || loadingAuction || loadingLive) return <Screen><LoadingState /></Screen>;
  if (!amount || !paymentId || !payment) return <Screen><Header title="Confirmar puja" onBack={back} /><EmptyState title="Puja incompleta" message="Seleccioná monto y medio de pago desde la subasta en vivo." /></Screen>;
  const bidError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const restricted = bidError?.status === 403;
  const restrictionMessage = bidError?.message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') ?? '';
  const insufficientCategory = restricted && restrictionMessage.includes('categoria');
  return (
    <Screen>
      <Header title="Confirmar puja" onBack={back} />
      <Title>{accepted ? 'Puja aceptada' : 'Revisa tu oferta'}</Title>
      <Card style={accepted ? styles.bidAccepted : styles.bidPanel}>
        <StatusState
          icon={accepted ? 'checkmark-circle-outline' : 'warning-outline'}
          title={accepted ? 'Oferta confirmada' : 'Estás por confirmar una puja'}
          message={accepted ? 'La puja quedó registrada correctamente.' : 'Revisá monto y medio de pago antes de enviar.'}
          tone={accepted ? 'green' : 'purple'}
        />
        <Body muted>Monto de tu oferta</Body>
        <Text style={styles.offer}>{formatAuctionMoney(amountValue, currency)}</Text>
        {belowCurrentMinimum ? <Body muted>La puja mínima actual es {formatAuctionMoney(live?.minBid ?? 0, currency)}. Volvé a la subasta en vivo para elegir otro monto.</Body> : null}
        <PaymentMethodCard payment={payment} selected />
        <Divider />
        <SecurityNote text="Confirmar una puja genera una obligación de compra según las condiciones de la subasta." />
      </Card>
      {mutation.isError ? (
        <StatusState
          icon="alert-circle-outline"
          title={insufficientCategory ? 'No podés pujar' : restricted ? 'No podés ofertar en este lote' : 'No pudimos registrar la oferta'}
          message={insufficientCategory ? 'Todavía no contás con una categoría suficiente para participar en esta subasta.' : errorToUserMessage(mutation.error, 'La puja fue rechazada.')}
          tone="red"
          actionLabel={restricted && !insufficientCategory ? 'Ver estado de cuenta' : undefined}
          onAction={() => router.push('/profile/account-status')}
        />
      ) : null}
      {!accepted ? <Button label={mutation.isPending ? 'Enviando...' : 'Confirmar puja'} disabled={mutation.isPending || hasInvalidAmount || belowCurrentMinimum} onPress={() => mutation.mutate()} /> : (
        <>
          <Button label="Volver a la subasta en vivo" onPress={() => router.replace(`/live/${id}`)} />
          {itemId ? <Button label="Consultar resultado luego" variant="secondary" onPress={() => router.push({ pathname: '/result/[id]', params: { id, itemId } })} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bidPanel: { backgroundColor: '#FFFFFF', borderColor: '#C4B5FD' },
  bidAccepted: { backgroundColor: colors.successSoft, alignItems: 'center' },
  offer: { color: colors.primaryDark, fontFamily: fonts.black, fontSize: typography.title },
});
