import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Button, Card, EmptyState, ErrorState, Header, LoadingState, Screen } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { purchaseService } from '@/services/api';
import { FilterTabs } from '@/features/account/components/filter-tabs';
import { SummaryRow } from '@/features/account/components/summary-row';

export function ParticipationHistoryScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const [filter, setFilter] = useState<'Todas' | 'Ganadas' | 'Perdidas'>('Todas');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['purchases', 'participation-history'], queryFn: purchaseService.list });
  const visiblePurchases = filter === 'Perdidas' ? [] : data ?? [];
  return (
    <Screen>
      <Header title="Historial de participaciones" onBack={back} />
      <FilterTabs options={['Todas', 'Ganadas', 'Perdidas'] as const} value={filter} onChange={setFilter} />
      {filter === 'Todas' ? <Card style={styles.policy}>
        <Body muted>Por ahora se muestran participaciones ganadas asociadas a tus compras. Las demás estarán disponibles cuando el servidor informe el historial completo.</Body>
      </Card> : filter === 'Perdidas' ? <Card style={styles.policy}>
        <Body muted>Las participaciones no ganadas estarán disponibles cuando el servidor informe su historial.</Body>
      </Card> : null}
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : visiblePurchases.length ? visiblePurchases.map((purchase) => (
        <Card key={purchase.id} style={styles.itemCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCopy}>
              <Text style={styles.cardTitle}>{purchase.lot.title}</Text>
              <Body muted>{purchase.auctionName ?? 'Subasta'}</Body>
            </View>
            <Badge label="Ganada" tone="green" />
          </View>
          <SummaryRow label="Monto final" value={formatCurrency(purchase.amount)} bold />
          {purchase.date ? <SummaryRow label="Fecha" value={purchase.date} /> : null}
          <Button label="Ver compra" variant="secondary" onPress={() => router.push(`/purchases/${purchase.id}`)} />
        </Card>
      )) : <EmptyState title="Todavía no hay participaciones registradas" message="Cuando participes en subastas, verás tu historial acá." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  policy: { backgroundColor: colors.primarySoft },
  itemCard: { gap: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
});
