import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Card, Divider, ErrorState, Header, InfoTile, LoadingState, Screen, SectionHeader } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { profileService } from '@/services/api';

export function MetricsScreen() {
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['metrics'], queryFn: profileService.metrics });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Métricas" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;

  const maxWins = Math.max(...data.winsByMonth.map((m) => m.count), 1);

  return (
    <Screen>
      <Header title="Métricas" onBack={back} />
      <View style={styles.tileRow}>
        <InfoTile icon="hammer-outline" label="Participadas" value={String(data.participated)} />
        <InfoTile icon="trophy-outline" label="Ganadas" value={String(data.won)} tone="green" />
        <InfoTile icon="stats-chart-outline" label="Tasa de éxito" value={`${Math.round(data.successRate * 100)}%`} />
      </View>
      <SectionHeader title="Importes" subtitle="Montos acumulados de tu actividad" />
      <View style={styles.tileRow}>
        <InfoTile icon="trending-up-outline" label="Total ofertado" value={formatCurrency(data.totalBid)} />
        <InfoTile icon="cash-outline" label="Total pagado" value={formatCurrency(data.totalPaid)} tone="green" />
      </View>
      <SectionHeader title="Oferta promedio por subasta" subtitle="Estadísticas de tus pujas" />
      <Card style={styles.statCard}>
        <View style={styles.statRow}>
          <Body muted>Promedio general</Body>
          <Text style={styles.statValue}>{formatCurrency(data.averageBid)}</Text>
        </View>
        <Divider />
        <View style={styles.statRow}>
          <Body muted>Oferta más alta</Body>
          <Text style={[styles.statValue, styles.statValueGreen]}>{formatCurrency(data.highestBid)}</Text>
        </View>
        <Divider />
        <View style={styles.statRow}>
          <Body muted>Oferta más baja</Body>
          <Text style={styles.statValue}>{formatCurrency(data.lowestBid)}</Text>
        </View>
      </Card>
      <SectionHeader title="Historial mensual" subtitle="Subastas ganadas por mes" />
      <Card style={styles.statCard}>
        {data.winsByMonth.length === 0 ? (
          <Body muted>Sin subastas ganadas registradas.</Body>
        ) : data.winsByMonth.map((item) => (
          <View key={item.month} style={styles.monthRow}>
            <Text style={styles.monthLabel}>{item.month}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.round((item.count / maxWins) * 100)}%` as `${number}%` }]} />
            </View>
            <Text style={styles.monthCount}>{item.count}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { gap: spacing.sm },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  statValue: { fontFamily: fonts.bold, fontSize: typography.body, color: colors.textStrong },
  statValueGreen: { color: colors.success },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  monthLabel: { fontFamily: fonts.medium, fontSize: typography.label, color: colors.text, width: 48 },
  barTrack: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.primaryFixed },
  barFill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  monthCount: { fontFamily: fonts.bold, fontSize: typography.label, color: colors.textStrong, minWidth: 20, textAlign: 'right' },
});
