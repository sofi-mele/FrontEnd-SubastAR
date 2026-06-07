import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PurchaseCard } from '@/components/domain/cards';
import { EmptyState, ErrorState, Header, LoadingState, Screen, SectionHeader } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { purchaseService } from '@/services/api';

export function PurchasesScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['purchases'], queryFn: purchaseService.list });
  const sections = data ? [
    { label: 'Pendientes', items: data.filter((purchase) => purchase.paymentStatus.toLowerCase() !== 'pagado') },
    { label: 'En proceso de entrega', items: data.filter((purchase) => purchase.paymentStatus.toLowerCase() === 'pagado' && !['entregado', 'listo_para_retirar'].includes(purchase.deliveryStatus.toLowerCase())) },
    { label: 'Entregadas o listas para retiro', items: data.filter((purchase) => ['entregado', 'listo_para_retirar'].includes(purchase.deliveryStatus.toLowerCase())) },
  ] : [];
  return (
    <Screen>
      <Header title="Mis compras" onBack={back} />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : data?.length ? sections.map((section) => section.items.length ? (
        <View key={section.label} style={styles.purchaseSection}>
          <SectionHeader title={section.label} subtitle="Agrupadas por estado de pago y entrega" />
          {section.items.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} onPress={() => router.push(`/purchases/${purchase.id}`)} />
          ))}
        </View>
      ) : null) : <EmptyState title="Todavía no hay compras" message="Los lotes ganados aparecerán acá." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  purchaseSection: { gap: spacing.md },
});
