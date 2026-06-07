import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Button, Card, ErrorState, Header, Input, LoadingState, Screen, StatusState, Title } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { insuranceService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { SummaryRow } from '@/features/account/components/summary-row';

export function ExtendPolicyScreen() {
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newValue, setNewValue] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['policy', id], queryFn: () => insuranceService.get(id ?? '') });
  const extend = useMutation({
    mutationFn: () => insuranceService.extend(id ?? '', Number(newValue)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policy', id] }),
  });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Ampliar póliza" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Ampliar póliza" onBack={back} />
      <Card style={styles.itemCard}>
        <Title>Solicitar mayor cobertura</Title>
        <SummaryRow label="Cobertura actual" value={formatCurrency(data.insuredValue)} bold />
        <Body muted>Ingresá un valor superior al actual para solicitar la ampliación.</Body>
      </Card>
      <Input label="Nuevo valor asegurado" keyboardType="number-pad" value={newValue} onChangeText={setNewValue} />
      <Button label={extend.isPending ? 'Solicitando...' : 'Confirmar solicitud'} disabled={!newValue || Number(newValue) <= data.insuredValue || extend.isPending} onPress={() => extend.mutate()} />
      {extend.isSuccess ? <StatusState icon="checkmark-circle-outline" title="Solicitud registrada" message="La nueva cobertura fue actualizada correctamente." tone="green" /> : null}
      {extend.isError ? <Body muted>{errorToUserMessage(extend.error, 'No fue posible ampliar la cobertura.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
});
