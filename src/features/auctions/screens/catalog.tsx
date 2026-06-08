import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LotCard } from '@/components/domain/cards';
import { LotImageCarousel } from '@/components/domain/LotImageCarousel';
import { Badge, Chip, EmptyState, ErrorState, Header, IconButton, LoadingState, Screen, SectionHeader } from '@/components/ui/primitives';
import { colors, fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { auctionService } from '@/services/api';
import type { Lot } from '@/types/domain';
import { useId } from '@/features/auctions/utils';

function GuestLotCard({ lot, onPress }: { lot: Lot; onPress: () => void }) {
  const router = useRouter();
  const sold = lot.status?.toLowerCase() === 'vendido' || lot.status?.toLowerCase() === 'subastado';
  return (
    <Pressable onPress={onPress} style={styles.lotCard}>
      <View style={styles.lotMedia}>
        <LotImageCarousel images={lot.images?.length ? lot.images : lot.image ? [lot.image] : undefined} title={lot.title} height={180} />
        <View style={styles.lotBadgeWrap}>
          <Badge label={`Lote ${lot.lotNumber}`} tone={sold ? 'red' : 'purple'} />
        </View>
      </View>
      <View style={styles.lotCopy}>
        <Text numberOfLines={2} style={styles.lotTitle}>{lot.title}</Text>
        <Text numberOfLines={2} style={styles.lotMeta}>{lot.description}</Text>
        <Text style={styles.lotMeta}>Estado: {lot.status ?? 'disponible'}</Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.loginHint}>Iniciá sesión para ver el precio base</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function CatalogScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const id = useId();
  const { session } = useSession();
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
          {lots?.map((lot) => session ? (
            <LotCard lot={lot} currency={auction?.currency} key={lot.id} onPress={() => router.push({ pathname: '/lot/[id]', params: { id: lot.id, auctionId: id } })} />
          ) : (
            <GuestLotCard lot={lot} key={lot.id} onPress={() => router.push({ pathname: '/lot/[id]', params: { id: lot.id, auctionId: id } })} />
          ))}
          {!lots?.length ? <EmptyState title="No hay lotes" message="No encontramos piezas para este estado." /> : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  lotCard: { flex: 1, minWidth: '46%', overflow: 'hidden', borderRadius: radius.lg, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.surface, ...shadow },
  lotMedia: { position: 'relative' },
  lotBadgeWrap: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  lotCopy: { padding: spacing.md, gap: spacing.xs },
  lotTitle: { fontSize: typography.body, lineHeight: 20, color: colors.textStrong, fontFamily: fonts.bold },
  lotMeta: { color: colors.textMuted, fontSize: typography.bodySmall, fontFamily: fonts.regular },
  loginHint: { fontSize: typography.bodySmall, fontFamily: fonts.bold, color: colors.primary },
});
