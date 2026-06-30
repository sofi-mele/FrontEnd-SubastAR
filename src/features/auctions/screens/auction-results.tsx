import { useQueries, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { LotImageCarousel } from '@/components/domain/LotImageCarousel';
import { Badge, Body, Button, Card, EmptyState, ErrorState, Header, InfoTile, LoadingState, Screen, SectionHeader, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { auctionService } from '@/services/api';
import type { AuctionResult } from '@/types/domain';
import { formatAuctionDate } from '@/features/auctions/utils';

type LotResultState = 'won' | 'lost' | 'no_bids' | 'active' | 'pending' | 'error';

const statePresentation: Record<LotResultState, { label: string; tone: 'green' | 'red' | 'yellow' | 'purple' | 'dark'; color: string; background: string }> = {
  won: { label: 'Ganado', tone: 'green', color: colors.success, background: colors.successSoft },
  lost: { label: 'Perdido', tone: 'red', color: colors.danger, background: colors.dangerSoft },
  no_bids: { label: 'Sin pujas', tone: 'dark', color: colors.textMuted, background: colors.surfaceContainer },
  active: { label: 'En curso', tone: 'yellow', color: colors.warning, background: colors.warningSoft },
  pending: { label: 'Pendiente', tone: 'purple', color: colors.primary, background: colors.primarySoft },
  error: { label: 'No disponible', tone: 'yellow', color: colors.warning, background: colors.warningSoft },
};

function resultState(result?: AuctionResult, loading = false, error = false): LotResultState {
  if (error) return 'error';
  if (loading || !result) return 'pending';
  const status = result.status.toLowerCase();
  if (status === 'sin_pujas') return 'no_bids';
  if (status === 'en_curso') return 'active';
  if (status === 'finalizada' || status === 'finalizado') return result.won ? 'won' : 'lost';
  return 'pending';
}

export function AuctionResultsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { session } = useSession();
  const { id = '', initialLotId, itemId } = useLocalSearchParams<{ id?: string; initialLotId?: string; itemId?: string }>();
  const requestedLotId = initialLotId ?? itemId;
  const [selectedLotId, setSelectedLotId] = useState(requestedLotId ?? '');

  const catalogQuery = useQuery({
    queryKey: ['catalog', id],
    queryFn: () => auctionService.catalog(id),
    enabled: !!id && !!session,
  });
  const auctionQuery = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionService.get(id),
    enabled: !!id && !!session,
  });
  const lots = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const resultQueries = useQueries({
    queries: lots.map((lot) => ({
      queryKey: ['result', id, lot.id],
      queryFn: () => auctionService.result(id, lot.id),
      enabled: !!id && !!session,
      staleTime: 30_000,
    })),
  });

  useEffect(() => {
    if (!lots.length) return;
    setSelectedLotId((current) => {
      if (current && lots.some((lot) => lot.id === current)) return current;
      if (requestedLotId && lots.some((lot) => lot.id === requestedLotId)) return requestedLotId;
      return lots[0].id;
    });
  }, [lots, requestedLotId]);

  const entries = lots.map((lot, index) => {
    const query = resultQueries[index];
    return {
      lot,
      query,
      state: resultState(query?.data, query?.isPending, query?.isError),
    };
  });
  const selectedEntry = entries.find((entry) => entry.lot.id === selectedLotId) ?? entries[0];
  const wonCount = entries.filter((entry) => entry.state === 'won').length;
  const lostCount = entries.filter((entry) => entry.state === 'lost').length;
  const noBidsCount = entries.filter((entry) => entry.state === 'no_bids').length;
  const pendingCount = entries.length - wonCount - lostCount - noBidsCount;

  if (!session) {
    return (
      <Screen>
        <Header title="Resultados de la subasta" onBack={back} />
        <StatusState icon="lock-closed-outline" title="Iniciá sesión para ver resultados" message="Los resultados por lote están disponibles para usuarios autenticados." tone="yellow" />
        <Button label="Iniciar sesión" onPress={() => router.push({ pathname: '/login', params: { returnTo: `/auction/${id}/results` } })} />
      </Screen>
    );
  }
  if (catalogQuery.isLoading) return <Screen><LoadingState /></Screen>;
  if (catalogQuery.isError) return <Screen><Header title="Resultados de la subasta" onBack={back} /><ErrorState onRetry={() => catalogQuery.refetch()} /></Screen>;
  if (!lots.length) return <Screen><Header title="Resultados de la subasta" subtitle={auctionQuery.data?.name} onBack={back} /><EmptyState title="Subasta sin lotes" message="No hay lotes disponibles para consultar resultados." /></Screen>;

  return (
    <Screen>
      <Header title="Resultados de la subasta" subtitle={auctionQuery.data?.name} onBack={back} />
      <View style={styles.summaryGrid}>
        <InfoTile icon="trophy-outline" label="Ganados" value={String(wonCount)} tone="green" />
        <InfoTile icon="close-circle-outline" label="Perdidos" value={String(lostCount)} tone="red" />
        <InfoTile icon="remove-circle-outline" label="Sin pujas" value={String(noBidsCount)} />
        <InfoTile icon="time-outline" label="Pendientes / en curso" value={String(pendingCount)} tone="yellow" />
      </View>

      <SectionHeader title="Lotes" subtitle="Seleccioná un lote para consultar su resultado" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {entries.map((entry, index) => {
          const presentation = statePresentation[entry.state];
          const selected = entry.lot.id === selectedEntry?.lot.id;
          return (
            <Pressable
              key={entry.lot.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setSelectedLotId(entry.lot.id)}
              style={[styles.tab, { borderColor: presentation.color, backgroundColor: presentation.background }, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabTitle, { color: presentation.color }]}>Lote {entry.lot.lotNumber || index + 1}</Text>
              <Text style={styles.tabStatus}>{presentation.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedEntry ? (
        <>
          <SectionHeader title={`Lote ${selectedEntry.lot.lotNumber || lots.indexOf(selectedEntry.lot) + 1}`} subtitle={selectedEntry.lot.title} />
          <LotImageCarousel images={selectedEntry.lot.images?.length ? selectedEntry.lot.images : selectedEntry.lot.image ? [selectedEntry.lot.image] : undefined} title={selectedEntry.lot.title} height={260} />
          <Card style={styles.lotCard}>
            <View style={styles.lotHeader}>
              <Text style={styles.lotTitle}>{selectedEntry.lot.title}</Text>
              <Badge label={statePresentation[selectedEntry.state].label} tone={statePresentation[selectedEntry.state].tone} />
            </View>
            {selectedEntry.lot.description ? <Body muted>{selectedEntry.lot.description}</Body> : null}
            {selectedEntry.lot.basePrice > 0 ? <Body muted>Precio base: {formatCurrency(selectedEntry.lot.basePrice, auctionQuery.data?.currency)}</Body> : null}
          </Card>
          <LotResultDetail
            state={selectedEntry.state}
            result={selectedEntry.query?.data}
            error={selectedEntry.query?.error}
            onRetry={() => selectedEntry.query?.refetch()}
            onPurchases={() => router.push('/purchases')}
          />
        </>
      ) : null}
    </Screen>
  );
}

function LotResultDetail({
  state,
  result,
  error,
  onRetry,
  onPurchases,
}: {
  state: LotResultState;
  result?: AuctionResult;
  error?: Error | null;
  onRetry: () => void;
  onPurchases: () => void;
}) {
  if (state === 'error') return <ErrorState message={error?.message ?? 'No pudimos cargar este resultado.'} onRetry={onRetry} />;
  if (state === 'pending') return <Card><Body muted>Cargando resultado del lote...</Body></Card>;
  if (state === 'active') return <StatusState icon="time-outline" title="Lote aún en curso" message="El resultado todavía no está disponible." tone="yellow" />;
  if (state === 'no_bids') return <StatusState icon="remove-circle-outline" title="Lote cerrado sin pujas" message="Este lote no recibió ofertas." tone="purple" />;
  if (state === 'lost') {
    return (
      <>
        <StatusState icon="close-circle-outline" title="No ganaste este lote" message="La mejor oferta fue superior a la tuya o no resultaste ganador." tone="red" />
        {result?.finalAmount != null ? <Card><Body muted>Monto final</Body><Text style={styles.amount}>{formatCurrency(result.finalAmount, result.currency)}</Text></Card> : null}
      </>
    );
  }
  return (
    <>
      <StatusState icon="trophy-outline" title="Ganaste este lote" message="La compra y su entrega están disponibles en Mis compras." tone="green" />
      <Card style={styles.resultCard}>
        <ResultRow label="Monto final" value={result?.finalAmount != null ? formatCurrency(result.finalAmount, result.currency) : 'A confirmar'} />
        {result?.paymentMethod ? <ResultRow label="Medio de pago" value={result.paymentMethod} /> : null}
        {result?.date ? <ResultRow label="Fecha" value={formatAuctionDate(result.date)} /> : null}
      </Card>
      <Button label="Ir a mis compras" onPress={onPurchases} />
    </>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tabs: { gap: spacing.sm, paddingVertical: spacing.xs },
  tab: { minWidth: 112, minHeight: 58, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderRadius: radius.sm, justifyContent: 'center', gap: spacing.xs },
  tabSelected: { borderWidth: 2 },
  tabTitle: { fontFamily: fonts.bold, fontSize: typography.bodySmall },
  tabStatus: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: typography.caption },
  lotCard: { gap: spacing.sm },
  lotHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  lotTitle: { flex: 1, color: colors.textStrong, fontFamily: fonts.black, fontSize: typography.heading },
  resultCard: { gap: spacing.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  resultLabel: { flex: 1, color: colors.textMuted, fontFamily: fonts.medium, fontSize: typography.bodySmall },
  resultValue: { flex: 1, color: colors.textStrong, fontFamily: fonts.bold, fontSize: typography.bodySmall, textAlign: 'right' },
  amount: { color: colors.primaryDark, fontFamily: fonts.black, fontSize: typography.title, fontVariant: ['tabular-nums'] },
});
