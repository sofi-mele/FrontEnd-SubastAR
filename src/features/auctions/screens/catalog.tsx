import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LotCard } from '@/components/domain/cards';
import { Chip, EmptyState, ErrorState, Header, IconButton, LoadingState, Screen, SectionHeader } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { auctionService } from '@/services/api';
import { useId } from '@/features/auctions/utils';

export function CatalogScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const id = useId();
  const [filter, setFilter] = useState('Todas');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog', id],
    queryFn: () => auctionService.catalog(id),
    enabled: !!id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const { data: auction } = useQuery({ queryKey: ['auction', id], queryFn: () => auctionService.get(id), enabled: !!id });
  const lots = data?.filter((lot) => {
    const status = lot.status?.toLowerCase();
    if (filter === 'Todas') return true;
    const sold = status === 'vendido' || status === 'subastado';
    const closedWithoutBid = status === 'sin_puja';
    return filter === 'Vendidos' ? sold || closedWithoutBid : !sold && !closedWithoutBid;
  });
  return (
    <Screen>
      <Header title="Catálogo" subtitle={auction?.name} onBack={back} right={<IconButton icon="refresh-outline" accessibilityLabel="Actualizar catálogo" onPress={() => refetch()} />} />
      <SectionHeader title="Estado de lotes" subtitle="Ordená por disponibilidad para encontrar piezas activas" />
      <View style={styles.chips}>
        {['Todas', 'Disponibles', 'Vendidos'].map((item) => <Chip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />)}
      </View>
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : (
        <View style={styles.grid}>
          {lots?.map((lot) => <LotCard lot={lot} currency={auction?.currency} key={lot.id} onPress={() => router.push({ pathname: '/lot/[id]', params: { id: lot.id, auctionId: id } })} />)}
          {!lots?.length ? <EmptyState title="No hay lotes" message="No encontramos piezas para este estado." /> : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
