import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { LotImageCarousel } from '@/components/domain/LotImageCarousel';
import { AuthRequiredModal, Badge, Body, Button, Card, Divider, EmptyState, ErrorState, Header, LoadingState, Screen, SectionHeader, Title } from '@/components/ui/primitives';
import { colors, fonts, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { auctionService } from '@/services/api';
import { InfoRow } from '@/features/auctions/components/info-row';
import { useId } from '@/features/auctions/utils';

export function LotDetailScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const id = useId();
  const { auctionId } = useLocalSearchParams<{ auctionId?: string }>();
  const canLoadLot = !!id && !!auctionId;
  const [authModal, setAuthModal] = useState(false);
  const { session } = useSession();
  const { data: lot, isLoading, isError, refetch } = useQuery({ queryKey: ['lot', id, auctionId], queryFn: () => auctionService.lot(id, auctionId ?? ''), enabled: canLoadLot });
  const { data: auction } = useQuery({ queryKey: ['auction', auctionId], queryFn: () => auctionService.get(auctionId ?? ''), enabled: !!auctionId });
  if (!auctionId) return <Screen><Header title="Detalle del lote" onBack={back} /><EmptyState title="No se encontró la subasta del lote" message="Volvé al catálogo para abrir esta pieza nuevamente." /></Screen>;
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !lot) return <Screen><Header title="Detalle del lote" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  const joinLive = () => session ? router.push(`/live/${lot.auctionId}`) : setAuthModal(true);
  return (
    <Screen>
      <Header title={`Lote ${lot.lotNumber}`} onBack={back} />
      <LotImageCarousel images={lot.images?.length ? lot.images : lot.image ? [lot.image] : undefined} title={lot.title} height={340} />
      <Card style={styles.detailHero}>
        <Badge label={`Lote ${lot.lotNumber}`} tone="purple" />
        <Title>{lot.title}</Title>
        <Body>{lot.description}</Body>
      </Card>
      {lot.artist ? <Card>
        <SectionHeader title="Detalles del lote" subtitle="Información complementaria disponible" />
        <InfoRow icon="color-palette-outline" label="Artista" value={lot.artist} />
        {lot.creationDate ? <InfoRow icon="calendar-outline" label="Fecha de creación" value={lot.creationDate} /> : null}
        {lot.owner ? <InfoRow icon="document-text-outline" label="Procedencia" value={lot.owner} /> : null}
        {lot.history ? <>
          <Divider />
          <Body muted>{lot.history}</Body>
        </> : null}
      </Card> : null}
      <Card style={styles.priceCard}>
        <Body muted>Precio base</Body>
        <Text style={styles.price}>{formatCurrency(lot.basePrice, auction?.currency)}</Text>
      </Card>
      <Button label="Ir a pujar" onPress={joinLive} />
      <AuthRequiredModal
        visible={authModal}
        onClose={() => setAuthModal(false)}
        onLogin={() => { setAuthModal(false); router.push({ pathname: '/login', params: { returnTo: `/live/${lot.auctionId}` } }); }}
        onRegister={() => { setAuthModal(false); router.push({ pathname: '/register', params: { returnTo: `/live/${lot.auctionId}` } }); }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  detailHero: { backgroundColor: '#FFFFFF', borderColor: '#C4B5FD' },
  priceCard: { backgroundColor: '#EDE9FE' },
  price: { fontSize: typography.body, color: colors.text, fontFamily: fonts.black },
});
