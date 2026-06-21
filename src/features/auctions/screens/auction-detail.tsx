import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Body, Button, Card, Divider, ErrorState, Header, InfoTile, LoadingState, Screen, Title } from '@/components/ui/primitives';
import { colors, fonts, spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { auctionService } from '@/services/api';
import { InfoRow } from '@/features/auctions/components/info-row';
import { formatAuctionDate, useId } from '@/features/auctions/utils';

export function AuctionDetailScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const id = useId();
  const { data: auction, isLoading, isError, refetch } = useQuery({ queryKey: ['auction', id], queryFn: () => auctionService.get(id), enabled: !!id });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !auction) return <Screen><Header title="Datos subasta" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Datos subasta" onBack={back} />
      <Card style={styles.detailHero}>
        <View style={styles.detailHeroTop}>
          <Badge label={auction.status} tone={auction.status === 'En vivo' ? 'green' : auction.status === 'Finalizada' ? 'red' : 'purple'} />
          <Title>{auction.name}</Title>
          <Body muted>{auction.category}</Body>
        </View>
        <View style={styles.tileRow}>
          <InfoTile icon="calendar-outline" label="Fecha y hora" value={formatAuctionDate(auction.date)} />
          <InfoTile icon="cash-outline" label="Moneda" value={auction.currency} />
        </View>
        <Divider />
        <InfoRow icon="location-outline" label="Lugar" value={auction.location} />
        <InfoRow icon="person-outline" label="Rematador" value={auction.auctioneer} />
      </Card>
      <Card style={styles.metricCard}>
        <Body muted>Cantidad de lotes disponibles</Body>
        <Text style={styles.bigNumber}>{auction.totalLots}</Text>
      </Card>
      <Button label="Ver catálogo" onPress={() => router.push(`/auction/${id}/catalog`)} />
      {auction.status === 'En vivo' ? <Button label="Entrar a subasta en vivo" onPress={() => router.push(`/live/${id}`)} /> : null}
      {auction.status === 'Finalizada' ? <Button label="Ver resultados de la subasta" onPress={() => router.push(`/auction/${id}/results`)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  detailHero: { backgroundColor: '#FFFFFF', borderColor: '#C4B5FD' },
  detailHeroTop: { gap: spacing.xs },
  metricCard: { backgroundColor: colors.surfaceAlt },
  bigNumber: { color: colors.primary, fontSize: 28, fontFamily: fonts.black },
});
