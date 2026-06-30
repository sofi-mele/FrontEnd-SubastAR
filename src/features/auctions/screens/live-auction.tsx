import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaymentMethodCard } from '@/components/domain/cards';
import { LotImageCarousel } from '@/components/domain/LotImageCarousel';
import { Body, Button, Card, EmptyState, ErrorState, Header, InfoTile, Input, LoadingState, Screen, SectionHeader, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { auctionService, paymentService, profileService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { addRealtimeStatusListener, subscribeToAuction, subscribeToUserBidEvents } from '@/services/realtime';
import type { AuctionRealtimeEvent, Bid } from '@/types/domain';
import { BidHistoryRow } from '@/features/auctions/components/bid-history-row';
import { formatAuctionMoney, useId } from '@/features/auctions/utils';

type LiveAuctionData = Awaited<ReturnType<typeof auctionService.live>>;

function bidFromRealtimeEvent(event: AuctionRealtimeEvent): Bid | undefined {
  if (event.amount == null) return undefined;
  return {
    id: event.bidId ?? `${event.timestamp ?? Date.now()}-${event.amount}`,
    bidder: event.bidder ?? 'Usuario',
    amount: event.amount,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
}

export function LiveAuctionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const back = useSafeBack();
  const id = useId();
  const { session } = useSession();
  const sessionEmail = session?.profile.email.toLowerCase();
  const [amount, setAmount] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const bidMutation = useMutation({
    mutationFn: () => auctionService.bid(id, Number(amount), paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
  const [lastLotId, setLastLotId] = useState<string>();
  const [realtimeNotice, setRealtimeNotice] = useState<string>();
  const [auctionFinished, setAuctionFinished] = useState(false);
  const [displaySecondsLeft, setDisplaySecondsLeft] = useState<number>();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['live', id],
    queryFn: () => auctionService.live(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
  const { data: paymentData } = useQuery({ queryKey: ['payments'], queryFn: paymentService.list });
  const { data: auction } = useQuery({ queryKey: ['auction', id], queryFn: () => auctionService.get(id), enabled: !!id });
  const { data: accountState } = useQuery({ queryKey: ['account-state'], queryFn: profileService.accountState, enabled: !!session });
  const usablePayments = paymentData?.filter((payment) => payment.verified) ?? [];
  useEffect(() => {
    if (data?.lot?.id) setLastLotId(data.lot.id);
  }, [data?.lot?.id]);

  useEffect(() => {
    if (!id) return;

    const unsubscribeAuction = subscribeToAuction(id, (event) => {
      if (event.type === 'AUCTION_FINISHED') {
        setAuctionFinished(true);
        setDisplaySecondsLeft(0);
        void refetch();
        setRealtimeNotice(event.message ?? 'La subasta finalizo.');
        return;
      }

      if (event.type === 'LOT_CHANGED') {
        setAuctionFinished(false);
        setAmount('');
        setRealtimeNotice(undefined);
        setDisplaySecondsLeft(undefined);
        void refetch();
        return;
      }

      if (event.type === 'BID_OUTBID') {
        return;
      }

      if (event.type !== 'BID_PLACED') return;

      const nextBid = bidFromRealtimeEvent(event);
      queryClient.setQueryData<LiveAuctionData>(['live', id], (current) => {
        if (!current) return current;
        const nextBestBid = event.bestBid ?? event.amount ?? current.bestBid;
        const hasBid = nextBid ? current.history.some((bid) => bid.id === nextBid.id) : true;
        const nextHistory = nextBid && !hasBid ? [nextBid, ...current.history].slice(0, 8) : current.history;
        return {
          ...current,
          bestBid: nextBestBid,
          minBid: event.minBid ?? current.minBid,
          maxBid: event.maxBid ?? current.maxBid,
          secondsLeft: event.secondsLeft ?? current.secondsLeft,
          history: nextHistory,
        };
      });

      setDisplaySecondsLeft(event.secondsLeft ?? 30);
      const isOwnBid = !!event.bidderEmail && event.bidderEmail.toLowerCase() === sessionEmail;
      setRealtimeNotice(isOwnBid ? 'Tu puja fue registrada.' : event.message ?? 'Nueva mejor oferta recibida.');
    });

    const unsubscribeUserBidEvents = session ? subscribeToUserBidEvents((event) => {
      if (event.type !== 'BID_OUTBID') return;
      if (event.auctionId && event.auctionId !== id) return;
      setRealtimeNotice(event.message ?? 'Tu oferta fue superada.');
      if (event.secondsLeft != null) setDisplaySecondsLeft(event.secondsLeft);
    }) : undefined;

    const unsubscribeStatus = addRealtimeStatusListener((nextStatus) => {
      if (nextStatus === 'connected') void refetch();
    });

    return () => {
      unsubscribeAuction();
      unsubscribeUserBidEvents?.();
      unsubscribeStatus();
    };
  }, [id, queryClient, refetch, session, sessionEmail]);

  useEffect(() => {
    if (!realtimeNotice) return;
    const timeout = setTimeout(() => setRealtimeNotice(undefined), 4000);
    return () => clearTimeout(timeout);
  }, [realtimeNotice]);

  useEffect(() => {
    if (data?.secondsLeft != null) {
      setDisplaySecondsLeft(data.secondsLeft);
    }
  }, [data?.secondsLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySecondsLeft((current) => {
        if (current == null || current <= 0) return current;
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return (
    <Screen>
      <Header title="Subasta en vivo" onBack={back} />
      <StatusState
        icon="wallet-outline"
        title="No se pudo cargar la subasta"
        message={errorToUserMessage(error, 'No pudimos cargar la subasta.')}
        tone="red"
        actionLabel="Registrar medio de pago"
        onAction={() => router.push('/profile/payments')}
      />
    </Screen>
  );
  if (auctionFinished || !data.lot) return (
    <Screen>
      <Header title="Subasta en vivo" onBack={back} />
      <EmptyState
        title={auctionFinished ? 'Subasta finalizada' : 'No hay lote activo'}
        message={auctionFinished ? 'La subasta finalizo. Consulta el resultado del ultimo lote disponible.' : 'El lote finalizó o aún no comenzó.'}
      />
      <Button label="Actualizar estado" variant="ghost" onPress={() => refetch()} />
      {auctionFinished || lastLotId ? (
        <Button
          label="Ver resultados de la subasta"
          onPress={() => router.push(`/auction/${id}/results${lastLotId ? `?initialLotId=${encodeURIComponent(lastLotId)}` : ''}`)}
        />
      ) : null}
    </Screen>
  );
  const currency = auction?.currency ?? 'ARS';
  const currentLeader = data.history[0]?.bidder ?? null;
  const formatTimer = (seconds?: number): string => {
    if (seconds == null) return '00:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const base = data.bestBid > 0 ? data.bestBid : data.lot.basePrice;
  const quickAmounts = [
    { label: 'Mínima', value: data.minBid },
    { label: '+5%', value: Math.min(Math.max(data.minBid, base + data.lot.basePrice * 0.05), data.maxBid ?? Infinity) },
    { label: '+10%', value: Math.min(Math.max(data.minBid, base + data.lot.basePrice * 0.10), data.maxBid ?? Infinity) },
    { label: 'Máxima', value: data.maxBid ?? Math.max(data.minBid, base + data.lot.basePrice * 0.20) },
  ];
  const amountValue = Number(amount);
  const hasInvalidAmount = !!amount && !Number.isFinite(amountValue);
  const isBelowMinimum = !!amount && Number.isFinite(amountValue) && amountValue < data.minBid;
  const isAboveMaximum = !!amount && data.maxBid != null && amountValue > data.maxBid;
  return (
    <Screen>
      <Header title="Subasta en vivo" subtitle={auction?.name} onBack={back} />
      {realtimeNotice ? (
        <Card style={styles.realtimeNotice}>
          <Text style={styles.realtimeNoticeTitle}>Actualizacion en vivo</Text>
          <Body>{realtimeNotice}</Body>
        </Card>
      ) : null}
      <Card style={styles.liveBannerCard}>
        <View style={styles.liveBanner}><View style={styles.liveDot} /><Text style={styles.liveText}>EN VIVO</Text><Text style={styles.timer}>{formatTimer(displaySecondsLeft)}</Text></View>
        <Text style={styles.liveTitle}>{data.lot.title}</Text>
        <Body muted>{auction?.location ?? 'Subasta activa'}</Body>
        {displaySecondsLeft === 0 ? <Text style={styles.timerWaiting}>Tiempo finalizado. Esperando confirmación del backend...</Text> : null}
      </Card>
      <LotImageCarousel images={data.lot.images?.length ? data.lot.images : data.lot.image ? [data.lot.image] : undefined} title={data.lot.title} height={300} />
      {displaySecondsLeft != null && displaySecondsLeft > 0 && displaySecondsLeft <= 20 && (
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerNumber}>{displaySecondsLeft}</Text>
          </View>
          <Text style={styles.timerText}>
            {'Últimos segundos. El equipo confirmará el cierre del lote.'}
            {currentLeader ? <Text style={styles.timerBidder}>{`\nOferta líder: ${currentLeader}`}</Text> : null}
          </Text>
        </View>
      )}
      <Card style={styles.bidPanel}>
        <SectionHeader title="Consola de puja" subtitle="Elegí un monto rápido o ingresalo manualmente" />
        {session && accountState?.status === 'Multado' ? (
          <StatusState icon="warning-outline" title="Cuenta multada" message="Tenés una multa pendiente de pago. Regularizá tu situación para volver a pujar." tone="red" actionLabel="Ver multas" onAction={() => router.push('/profile/account-status')} />
        ) : session && accountState?.status === 'Bloqueado' ? (
          <StatusState icon="lock-closed-outline" title="Cuenta bloqueada" message="Tu acceso fue restringido. Contactá al soporte." tone="red" />
        ) : session ? (
          <>
            <Body muted>Mejor oferta actual</Body>
            <Text style={styles.offer}>{data.bestBid > 0 ? formatAuctionMoney(data.bestBid, currency) : 'Sin ofertas todavía'}</Text>
            {data.bestBid <= 0 ? <Body muted>Precio base: {formatAuctionMoney(data.lot.basePrice, currency)}</Body> : null}
            <View style={styles.tileRow}>
              <InfoTile icon="trending-up-outline" label="Puja mínima" value={formatAuctionMoney(data.minBid, currency)} />
              <InfoTile icon="shield-checkmark-outline" label="Puja máxima" value={data.maxBid != null ? formatAuctionMoney(data.maxBid, currency) : 'Sin tope'} />
            </View>
            <View style={styles.quickBids}>
              {quickAmounts.map((item) => (
                <Pressable key={item.label} style={styles.quickBid} onPress={() => setAmount(String(Math.round(item.value)))}>
                  <Text style={styles.quickBidLabel}>{item.label}</Text>
                  <Text style={styles.quickBidValue}>{formatAuctionMoney(item.value, currency)}</Text>
                </Pressable>
              ))}
            </View>
            <Input label="Tu oferta" value={amount} keyboardType="number-pad" onChangeText={setAmount} />
            {hasInvalidAmount ? <Body muted>Ingresá un monto numérico válido.</Body> : null}
            {isBelowMinimum ? <Body muted>La puja mínima es {formatAuctionMoney(data.minBid, currency)}.</Body> : null}
            {isAboveMaximum ? <Body muted>El monto supera el máximo general. Si tu categoría lo permite, el sistema validará la operación.</Body> : null}
            {usablePayments.length ? usablePayments.map((payment) => (
              <Pressable key={payment.id} onPress={() => setPaymentId(payment.id)}>
                <PaymentMethodCard payment={payment} selected={paymentId === payment.id} />
              </Pressable>
            )) : (
              <>
                <StatusState icon="card-outline" title="Medio de pago pendiente" message="No podés pujar hasta contar con un medio aprobado para operar." tone="yellow" actionLabel="Agregar medio de pago" onAction={() => router.push('/profile/payments')} />
              </>
            )}
            <Button
              label={bidMutation.isPending ? 'Enviando...' : 'Pujar ahora'}
              disabled={bidMutation.isPending || !paymentId || !amount.trim() || !Number.isFinite(amountValue) || amountValue < data.minBid || (data.maxBid != null && amountValue > data.maxBid)}
              onPress={() => bidMutation.mutate()}
            />
            {bidMutation.isError ? <Body muted>{errorToUserMessage(bidMutation.error, 'No fue posible registrar la puja.')}</Body> : null}
            {bidMutation.isSuccess ? <Body muted>¡Tu puja fue registrada!</Body> : null}
          </>
        ) : !session ? (
          <>
            <StatusState icon="lock-closed-outline" title="Iniciá sesión para poder pujar en esta subasta" message="Creá una cuenta o iniciá sesión para participar." tone="yellow" />
            <Button label="Iniciar sesión" onPress={() => router.push({ pathname: '/login', params: { returnTo: `/live/${id}` } })} />
          </>
        ) : null}
      </Card>
      <SectionHeader title="Historial de pujas" subtitle="Últimas ofertas registradas" />
      <Card style={styles.historyCard}>
        {data.history.map((bid, index) => (
          <BidHistoryRow key={bid.id} bidder={bid.bidder} amount={bid.amount} timestamp={bid.timestamp} leader={index === 0} currency={currency} />
        ))}
      </Card>
      <Button label="Ver historial completo" variant="ghost" onPress={() => router.push(`/live/${id}/history?itemId=${data.lot?.id}`)} />
      <Button label="Actualizar estado" variant="ghost" onPress={() => refetch()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  liveBannerCard: { backgroundColor: colors.surface, borderColor: colors.dangerSoft },
  liveBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: '#F7C9C9' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { color: colors.danger, fontFamily: fonts.black, flex: 1 },
  timer: { color: colors.danger, fontFamily: fonts.black },
  timerWaiting: { color: colors.danger, fontFamily: fonts.bold, fontSize: typography.caption },
  liveTitle: { color: colors.textStrong, fontSize: typography.heading, fontFamily: fonts.black },
  realtimeNotice: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  realtimeNoticeTitle: { color: colors.primaryDark, fontFamily: fonts.black, fontSize: typography.body },
  bidPanel: { backgroundColor: colors.surface, borderColor: colors.primaryBorder },
  historyCard: { gap: spacing.sm },
  offer: { color: colors.primaryDark, fontFamily: fonts.black, fontSize: typography.title },
  quickBids: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBid: { minWidth: '46%', flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder },
  quickBidLabel: { color: colors.primary, fontFamily: fonts.black, fontSize: typography.caption },
  quickBidValue: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 10 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  timerCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  timerNumber: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  timerText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  timerBidder: { fontWeight: 'bold', color: '#1a1a1a' },
});
