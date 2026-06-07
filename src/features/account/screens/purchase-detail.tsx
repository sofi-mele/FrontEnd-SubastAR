import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Button, Card, Divider, ErrorState, Header, InfoTile, LoadingState, Screen, Title } from '@/components/ui/primitives';
import { colors, spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { purchaseService } from '@/services/api';
import { SummaryRow } from '@/features/account/components/summary-row';

export function PurchaseDetailScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['purchase', id], queryFn: () => purchaseService.get(id ?? '') });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Detalle de compra" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Detalle de compra" onBack={back} />
      <Card style={styles.itemCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderCopy}>
            <Title>{data.lot.title}</Title>
            <Body muted>{data.auctionName}</Body>
          </View>
          <Badge label={data.paymentStatus} tone={data.paymentStatus.toLowerCase() === 'pagado' ? 'green' : 'yellow'} />
        </View>
        <View style={styles.tileRow}>
          <InfoTile icon="card-outline" label="Pago" value={data.paymentStatus} tone={data.paymentStatus.toLowerCase() === 'pagado' ? 'green' : 'yellow'} />
          <InfoTile icon="cube-outline" label="Entrega" value={data.deliveryStatus} />
        </View>
        <Divider />
        <SummaryRow label="Valor pujado" value={formatCurrency(data.amount)} />
        <SummaryRow label="Cargos y comisión" value={formatCurrency(data.fee)} />
        {data.shippingCost != null ? <SummaryRow label="Envío" value={formatCurrency(data.shippingCost)} /> : null}
        <SummaryRow label="Total" value={formatCurrency(data.total ?? data.amount + data.fee)} bold />
      </Card>
      <Card style={styles.itemCard}>
        <Badge label={data.deliveryStatus} tone="green" />
        <Title>Coordinación de entrega</Title>
        <Body muted>{data.deliveryAddress ?? 'La dirección de entrega se informará cuando esté coordinada.'}</Body>
        <Button label="Ver seguimiento de entrega" variant="secondary" onPress={() => router.push(`/purchases/${id}/delivery`)} />
        <Button label="Coordinar por Chat" variant="secondary" icon="chatbubble-ellipses-outline" onPress={() => router.push('/chat/soporte')} />
      </Card>
      {data.paymentStatus.toLowerCase() !== 'pagado' ? <Button label="Regularizar pago" onPress={() => router.push(`/purchases/${id}/payment`)} /> : null}
      <Button label="Ver factura" variant="secondary" icon="document-text-outline" onPress={() => router.push(`/purchases/${id}/invoice`)} />
      {data.insuranceId ? (
        <Card style={styles.policy}>
          <Badge label="Póliza asociada" tone="green" />
          <Body muted>Esta compra tiene una póliza disponible para consultar o ampliar.</Body>
          {data.insuranceNumber ? <SummaryRow label="Número de póliza" value={data.insuranceNumber} /> : null}
          <Button label="Ver póliza de seguro" onPress={() => router.push(`/policy/${data.insuranceId}`)} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignSelf: 'stretch' },
  policy: { backgroundColor: colors.primarySoft },
});
