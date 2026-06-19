import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Card, EmptyState, ErrorState, Header, LoadingState, Screen } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { lostParticipationService } from '@/services/api';
import { SummaryRow } from '@/features/account/components/summary-row';

export function LostParticipationsScreen() {
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lost-participations'],
    queryFn: lostParticipationService.list,
  });

  return (
    <Screen>
      <Header title="Participaciones perdidas" onBack={back} />
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data?.length ? (
        data.map((item) => (
          <Card key={item.itemId} style={styles.itemCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderCopy}>
                <Text style={styles.cardTitle}>{item.nombreProducto}</Text>
                <Body muted>{item.descripcion}</Body>
              </View>
              <Badge label="Perdida" tone="red" />
            </View>
            <SummaryRow label="Tu mejor puja" value={formatCurrency(item.miMejorPuja)} bold />
            <SummaryRow label="Precio final" value={formatCurrency(item.precioFinalVenta)} />
            {item.fechaPuja ? <SummaryRow label="Fecha" value={item.fechaPuja} /> : null}
          </Card>
        ))
      ) : (
        <EmptyState title="No participaste en subastas aún" message="Las subastas en las que pujes y no ganes aparecerán acá." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
});
