import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Button, Card, ErrorState, Header, LoadingState, Screen, SectionHeader, SecurityNote, StatusState } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { SummaryRow } from '@/features/account/components/summary-row';
import { StyleSheet } from 'react-native';

export function AcceptConditionsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.get(id ?? ''),
    enabled: !!id,
  });

  const accept = useMutation({
    mutationFn: () => assetService.acceptConditions(id ?? '', true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.replace({ pathname: '/profile/collection-accounts', params: { returnTo: '/profile/assets' } } as Href);
    },
  });

  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Condiciones del bien" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;

  return (
    <Screen>
      <Header title="Condiciones del bien" onBack={back} />
      <StatusState
        icon="document-text-outline"
        title="Revisá las condiciones antes de aceptar"
        message="La empresa definió las condiciones para subastar tu bien. Revisalas y confirmá si aceptás."
        tone="purple"
      />
      <Card style={styles.card}>
        <SectionHeader title={data.title} subtitle="Condiciones asignadas por la empresa" />
        <SummaryRow label="Precio base asignado" value={data.basePrice != null ? formatCurrency(data.basePrice) : 'No informado'} />
        <SummaryRow label="Comisión" value={data.commission != null ? formatCurrency(data.commission) : 'No informada'} />
      </Card>
      <SecurityNote text="Al aceptar, autorizás a la empresa a subastar tu bien en las condiciones indicadas." />
      <Button
        label={accept.isPending ? 'Aceptando...' : 'Aceptar condiciones'}
        disabled={accept.isPending}
        onPress={() => accept.mutate()}
      />
      {accept.isError ? <Body muted>{errorToUserMessage(accept.error, 'No fue posible aceptar las condiciones.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
});
