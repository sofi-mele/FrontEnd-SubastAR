import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Badge, Body, Button, Card, EmptyState, ErrorState, Header, LoadingState, Screen, StatusState, Title } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { purchaseService } from '@/services/api';

export function PoliciesScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['purchases', 'policies'], queryFn: purchaseService.list });
  const insuredPurchases = (data ?? []).filter((purchase) => !!purchase.insuranceId)
    .filter((purchase, index, purchases) => purchases.findIndex((item) => item.insuranceId === purchase.insuranceId) === index);
  return (
    <Screen>
      <Header title="Seguros y Pólizas" onBack={back} />
      <StatusState icon="shield-checkmark-outline" title="Cobertura de bienes" message="Tus pólizas asociadas a compras aparecerán acá cuando el servidor informe el vínculo." tone="green" />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : insuredPurchases.length ? insuredPurchases.map((purchase) => (
        <Card key={purchase.insuranceId} style={styles.itemCard}>
          <Badge label="Póliza activa" tone="green" />
          <Title>{purchase.insuranceNumber ?? purchase.insuranceId}</Title>
          <Body muted>{purchase.lot.title}</Body>
          <Body muted>{purchase.auctionName ?? 'Compra asegurada'}</Body>
          <Button label="Ver póliza de seguro" onPress={() => router.push(`/policy/${purchase.insuranceId}`)} />
        </Card>
      )) : <EmptyState title="Sin pólizas asociadas" message="Tus pólizas asociadas a compras y bienes aparecerán acá." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
});
