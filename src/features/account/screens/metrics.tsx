import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Card, ErrorState, Header, InfoTile, LoadingState, Screen, Title } from '@/components/ui/primitives';
import { colors, radius, spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { profileService } from '@/services/api';

export function MetricsScreen() {
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['metrics'], queryFn: profileService.metrics });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Métricas" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Métricas" onBack={back} />
      <View style={styles.metricGrid}>
        <InfoTile icon="hammer-outline" label="Participadas" value={String(data.participated)} />
        <InfoTile icon="trophy-outline" label="Ganadas" value={String(data.won)} tone="green" />
        <InfoTile icon="stats-chart-outline" label="Tasa de éxito" value={`${Math.round(data.successRate * 100)}%`} />
        <InfoTile icon="cash-outline" label="Total pagado" value={formatCurrency(data.totalPaid)} />
      </View>
      <Card>
        <Title>Ganadas por mes</Title>
        <View style={styles.bars}>
          {data.winsByMonth.map((month) => <View key={month.month} style={[styles.bar, { height: Math.max(10, month.count * 22) }]} />)}
        </View>
        <Body muted>{data.winsByMonth.map((month) => month.month).join('   ') || 'Sin subastas ganadas registradas'}</Body>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  bars: { height: 105, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end', justifyContent: 'center' },
  bar: { width: 22, borderRadius: radius.sm, backgroundColor: colors.primary },
});
