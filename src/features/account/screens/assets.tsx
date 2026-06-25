import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, EmptyState, ErrorState, Header, LoadingState, Screen, SectionHeader, StatusState } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { FilterTabs } from '@/features/account/components/filter-tabs';

export function AssetsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const [status, setStatus] = useState('Todos');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['assets', status], queryFn: () => assetService.list(status) });
  return (
    <Screen>
      <Header title="Mis bienes" onBack={back} />
      <SectionHeader title="Estado de solicitud" subtitle="Filtrá tus bienes por su revisión actual" />
      <FilterTabs options={['Todos', 'Pendiente', 'En revisión', 'En inspección', 'Aceptado', 'Rechazado'] as const} value={status} onChange={setStatus} />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : data?.length ? data.map((asset) => {
        const pendingDecision = asset.status === 'Aceptado' && !asset.conditionsAccepted;
        return (
          <Card key={asset.id} style={styles.itemCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderCopy}>
                <Text style={styles.cardTitle}>{asset.title}</Text>
              </View>
              <Badge label={asset.status} tone={asset.status === 'Aceptado' ? 'green' : asset.status === 'Rechazado' ? 'red' : asset.status === 'En inspección' ? 'purple' : asset.status === 'En revisión' ? 'dark' : 'yellow'} />
            </View>
            {pendingDecision ? (
              <StatusState icon="alert-circle-outline" title="Requiere tu decisión" message="La empresa aceptó el bien. Revisá las condiciones y decidí si participás." tone="yellow" />
            ) : null}
            <Button label={pendingDecision ? 'Revisar condiciones' : 'Ver detalle'} variant={pendingDecision ? 'primary' : 'secondary'} onPress={() => router.push({ pathname: '/profile/assets/[id]', params: { id: asset.id } })} />
          </Card>
        );
      }) : <EmptyState title="Sin bienes en este estado" message="Tus solicitudes aparecerán acá al ser registradas." />}
      <Button label="Subir un producto" onPress={() => router.push('/sell')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
});
