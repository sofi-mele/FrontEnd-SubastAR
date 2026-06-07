import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button, Card, ErrorState, Header, LoadingState, Screen, StatusState } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { insuranceService } from '@/services/api';
import { SummaryRow } from '@/features/account/components/summary-row';

export function PolicyContactScreen() {
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['policy', id], queryFn: () => insuranceService.get(id ?? '') });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Contacto compañía" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Contacto compañía" onBack={back} />
      <StatusState icon="shield-checkmark-outline" title={data.company} message={`Póliza ${data.number}`} tone="green" />
      <Card style={styles.itemCard}>
        <SummaryRow label="Teléfono" value={data.contact?.phone ?? 'No informado'} />
        <SummaryRow label="Correo" value={data.contact?.email ?? 'No informado'} />
        <SummaryRow label="Web" value={data.contact?.web ?? 'No informada'} />
      </Card>
      <Button label="Volver a la póliza" onPress={back} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
});
