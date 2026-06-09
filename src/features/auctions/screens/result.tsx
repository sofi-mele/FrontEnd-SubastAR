import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Button, Card, EmptyState, ErrorState, Header, LoadingState, Screen, StatusState } from '@/components/ui/primitives';
import { colors, fonts, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { auctionService } from '@/services/api';
import { ResultLine } from '@/features/auctions/components/result-line';
import { formatAuctionDate } from '@/features/auctions/utils';

export function ResultScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId?: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['result', id, itemId], queryFn: () => auctionService.result(id, itemId ?? ''), enabled: !!itemId });
  if (!itemId) return <Screen><Header title="Resultado" onBack={back} /><EmptyState title="Resultado no disponible" message="Abrí el resultado desde una subasta finalizada." /></Screen>;
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Resultado" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  if (data.status === 'en_curso') return <Screen><Header title="Resultado" onBack={back} /><EmptyState title="Subasta en curso" message="Todavía no se declaró un resultado para este lote." /></Screen>;
  return (
    <Screen style={styles.result}>
      <StatusState
        icon={data.won ? 'trophy-outline' : 'time-outline'}
        title={data.won ? 'Ganaste la subasta' : 'La subasta finalizó'}
        message={data.won ? 'Consulta el pago y la entrega en Mis compras.' : 'Tu oferta no resultó ganadora.'}
        tone={data.won ? 'green' : 'purple'}
      />
      <Body muted>{data.lotName}</Body>
      {data.won ? <Card style={styles.total}>
        <ResultLine label="Monto abonado" value={data.finalAmount != null ? formatCurrency(data.finalAmount) : 'A confirmar'} />
        <ResultLine label="Medio de pago" value={data.paymentMethod ?? 'Ver en Mis compras'} />
        <ResultLine label="Fecha" value={formatAuctionDate(data.date)} />
      </Card> : data.finalAmount != null ? <Text style={styles.resultItem}>{formatCurrency(data.finalAmount)}</Text> : null}
      {data.won ? <Button label="Ir a Mis compras" onPress={() => router.push('/purchases')} /> : null}
      <Button label="Seguir participando en la subasta" variant="secondary" onPress={() => router.replace(`/live/${id}`)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: { alignItems: 'center', paddingTop: 54 },
  resultItem: { color: colors.primary, fontFamily: fonts.bold, fontSize: typography.heading },
  total: { alignSelf: 'stretch' },
});
