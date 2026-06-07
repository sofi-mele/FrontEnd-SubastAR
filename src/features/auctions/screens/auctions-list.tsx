import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuctionCard } from '@/components/domain/cards';
import { Chip, EmptyState, ErrorState, Header, IconButton, LoadingState, Screen, SearchInput, SectionHeader, SecurityNote } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { auctionService } from '@/services/api';

export function AuctionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; category?: string; currency?: string }>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.status ?? 'Todas');
  const category = params.category ?? 'Todas';
  const currency = params.currency ?? 'Todas';
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auctions', search, status, category, currency],
    queryFn: () => auctionService.list({ search, status, category, currency }),
  });
  return (
    <Screen>
      <Header title="Subastas" right={<IconButton icon="options-outline" accessibilityLabel="Filtros" tone="primary" onPress={() => router.push('/auction-filters')} />} />
      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar subasta" />
      <SectionHeader title="Estado de subasta" subtitle="Filtrá por disponibilidad y contexto" actionLabel="Filtros" onAction={() => router.push('/auction-filters')} />
      <View style={styles.chips}>
        {['Todas', 'En vivo', 'Próximas', 'Finalizada'].map((item) => (
          <Chip label={item} active={item === status} onPress={() => setStatus(item)} key={item} />
        ))}
      </View>
      <SecurityNote text="Los lotes y estados se muestran según la información disponible de la subasta y tu sesión." />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : data?.length ? data.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} onPress={() => router.push(`/auction/${auction.id}`)} />
      )) : <EmptyState title="Sin resultados" message="Proba con otros filtros o palabras clave." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
