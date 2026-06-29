import { useQueries, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Button, Card, ErrorState, Header, LoadingState, Screen, SectionHeader, StatusState } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { profileService, purchaseService } from '@/services/api';
import { SummaryRow } from '@/features/account/components/summary-row';

function formatPenaltyDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-AR');
}

export function AccountStatusScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['account-state'], queryFn: profileService.accountState });
  const { data: penalties, isLoading: penaltiesLoading, isError: penaltiesError, refetch: refetchPenalties } = useQuery({
    queryKey: ['penalties'],
    queryFn: profileService.penalties,
  });
  const purchaseIds = (penalties ?? []).map((p) => p.purchaseId).filter(Boolean) as string[];
  const purchaseQueries = useQueries({
    queries: purchaseIds.map((id) => ({ queryKey: ['purchase', id], queryFn: () => purchaseService.get(id) })),
  });
  const totalPending = purchaseQueries.length > 0
    ? purchaseQueries.reduce((sum, q) => sum + (q.data?.total ?? q.data ? (q.data.amount + q.data.fee + q.data.penalty) : 0), 0)
    : data?.penalty ?? 0;
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Estado de cuenta" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  const regular = data.status === 'Regular';
  const blocked = data.status === 'Bloqueado';
  const title = regular ? 'Estado de cuenta regular' : blocked ? 'Cuenta bloqueada' : 'Cuenta multada';
  const description = regular
    ? 'No posees multas pendientes. Podés participar normalmente en subastas.'
    : blocked
      ? 'No podés operar mientras la cuenta permanezca bloqueada.'
      : 'Tenés multas pendientes. Debés regularizarlas antes de participar en otra subasta.';
  return (
    <Screen>
      <Header title="Estado de cuenta" onBack={back} />
      <StatusState icon={regular ? 'checkmark-circle-outline' : blocked ? 'lock-closed-outline' : 'alert-circle-outline'} title={title} message={!regular && totalPending > 0 ? `${description} Importe total pendiente: ${formatCurrency(totalPending)}.` : description} tone={regular ? 'green' : 'red'} />
      {totalPending > 0 ? <Card style={styles.penaltyCard}><Body muted>Importe pendiente</Body><Text style={styles.penalty}>{formatCurrency(totalPending)}</Text></Card> : null}
      <SectionHeader title="Multas" subtitle="Detalle informado por tu cuenta" />
      {penaltiesLoading ? <Card><Body muted>Cargando multas...</Body></Card> : penaltiesError ? (
        <Card style={styles.penaltiesError}>
          <Body>No pudimos cargar el detalle de multas. El estado general de tu cuenta sigue disponible.</Body>
          <Button label="Reintentar" variant="ghost" onPress={() => refetchPenalties()} />
        </Card>
      ) : penalties?.length ? (
        <View style={styles.penaltiesList}>
          {penalties.map((penalty, index) => {
            const penaltyDate = formatPenaltyDate(penalty.date);
            const purchaseReference = penalty.purchaseId ?? penalty.registrationId;
            const purchaseIndex = purchaseIds.indexOf(penalty.purchaseId ?? '');
            const purchaseData = purchaseIndex >= 0 ? purchaseQueries[purchaseIndex]?.data : undefined;
            const totalAmount = purchaseData
              ? purchaseData.amount + purchaseData.fee + purchaseData.penalty
              : penalty.amount;
            return (
              <Card key={penalty.id ?? index} style={styles.penaltyDetailCard}>
                <SummaryRow label="Monto" value={formatCurrency(totalAmount)} bold />
                <SummaryRow label="Estado" value={penalty.status} />
                {penalty.reason ? <SummaryRow label="Motivo" value={penalty.reason} /> : null}
                {penaltyDate ? <SummaryRow label="Fecha" value={penaltyDate} /> : null}
                {penalty.purchaseDescription ? <SummaryRow label="Compra o lote" value={penalty.purchaseDescription} /> : null}
                {purchaseReference ? <SummaryRow label="Compra" value={`#${purchaseReference}`} /> : null}
                {penalty.purchaseId ? <Button label="Ver compra asociada" variant="ghost" onPress={() => router.push(`/purchases/${penalty.purchaseId}`)} /> : null}
              </Card>
            );
          })}
        </View>
      ) : <Card><Body>No tenés multas pendientes.</Body></Card>}
      {!regular ? <Button label="Ver compras pendientes" onPress={() => router.push('/purchases')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  penaltyCard: { alignItems: 'center', backgroundColor: colors.dangerSoft },
  penalty: { color: colors.danger, fontSize: typography.title, fontFamily: fonts.black },
  penaltiesList: { gap: spacing.md },
  penaltyDetailCard: { gap: spacing.sm },
  penaltiesError: { gap: spacing.sm, borderColor: colors.warning },
});
