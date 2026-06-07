import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Card, EmptyState, ErrorState, Header, LoadingState, Screen } from '@/components/ui/primitives';
import { colors, fonts, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { auctionService } from '@/services/api';

export function BidHistoryScreen() {
  const back = useSafeBack();
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId?: string }>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bid-history', id, itemId],
    queryFn: () => auctionService.bidHistory(id, itemId ?? ''),
    enabled: !!itemId,
  });
  return (
    <Screen>
      <Header title="Historial de pujas" onBack={back} />
      {!itemId ? <EmptyState title="Sin lote seleccionado" message="Ingresa desde una subasta en vivo para consultar su historial." /> :
        isLoading ? <LoadingState /> :
          isError ? <ErrorState onRetry={() => refetch()} /> :
            data?.length ? data.map((bid, index) => (
              <Card key={bid.id} style={styles.historyCard}>
                <Badge label={index === 0 ? 'Oferta líder' : `Oferta ${index + 1}`} tone={index === 0 ? 'green' : 'purple'} />
                <Text style={styles.offer}>{formatCurrency(bid.amount)}</Text>
                <Body muted>{bid.bidder} - {bid.timestamp}</Body>
              </Card>
            )) : <EmptyState title="Sin pujas registradas" message="Todavía no se realizaron ofertas para este lote." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  historyCard: { gap: 8 },
  offer: { color: '#4C35BF', fontFamily: fonts.black, fontSize: typography.title },
});
