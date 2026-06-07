import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Button, Card, Divider, ErrorState, Header, InfoTile, LoadingState, Screen, SectionHeader, StatusState, Title } from '@/components/ui/primitives';
import { colors, radius, spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { SummaryRow } from '@/features/account/components/summary-row';

export function AssetDetailScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['asset', id], queryFn: () => assetService.get(id ?? '') });
  const accept = useMutation({
    mutationFn: (accepted: boolean) => assetService.acceptConditions(id ?? '', accepted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Detalle del bien" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Detalle del bien" onBack={back} />
      <Card style={[styles.itemCard, styles.assetHeroCard]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderCopy}>
            <Badge label={data.status} tone={data.status === 'Aceptado' ? 'green' : data.status === 'Rechazado' ? 'red' : data.status === 'En inspección' ? 'purple' : 'yellow'} />
            <Title>{data.title}</Title>
            <Body muted>{data.category}</Body>
          </View>
          <View style={styles.assetHeroIcon}><Ionicons name="cube-outline" size={24} color={colors.primary} /></View>
        </View>
        <Body>{data.detail}</Body>
        <View style={styles.tileRow}>
          <InfoTile icon="albums-outline" label="Fotos" value={data.photosUploaded != null ? String(data.photosUploaded) : 'No asignado'} />
          <InfoTile icon="document-text-outline" label="Documentos" value={data.documentationAttached ? 'Adjunta' : 'No asignado'} tone={data.documentationAttached ? 'green' : 'yellow'} />
        </View>
        <Divider />
        <SummaryRow label="Precio base" value={data.basePrice != null ? formatCurrency(data.basePrice) : 'No asignado'} />
        <SummaryRow label="Comisión" value={data.commission != null ? formatCurrency(data.commission) : 'No asignado'} />
        <SummaryRow label="Depósito" value={data.depositLocation ?? 'No asignado'} />
      </Card>
      {data.status === 'En inspección' ? (
        <StatusState
          icon="cube-outline"
          title="Bien en camino a inspección"
          message="La empresa está interesada. Revisá el chat para ver la dirección de envío y enviá el bien físicamente."
          tone="purple"
        />
      ) : null}
      {data.status === 'Aceptado' && data.assignedAuction ? (
        <Card style={styles.itemCard}>
          <SectionHeader title="Subasta asignada" subtitle="La empresa te asignó una fecha y lugar" />
          <SummaryRow label="Subasta" value={data.assignedAuction} />
          {data.depositLocation ? <SummaryRow label="Depósito" value={data.depositLocation} /> : null}
        </Card>
      ) : null}
      {data.status === 'Aceptado' && data.policyId ? (
        <Card style={styles.itemCard}>
          <SectionHeader title="Póliza de seguro" subtitle="Cobertura contratada sobre el bien" />
          <Button label="Ver póliza de seguro" icon="shield-checkmark-outline" variant="secondary" onPress={() => router.push(`/policy/${data.policyId}` as Href)} />
        </Card>
      ) : null}
      <Button label="Ver detalle completo" variant="secondary" icon="open-outline" onPress={() => router.push({ pathname: '/profile/assets/[id]/full', params: { id: data.id } })} />
      {data.status === 'Aceptado' && !data.conditionsAccepted ? <>
        <Button label="Aceptar condiciones" onPress={() => router.push(`/profile/assets/${data.id}/accept-conditions` as Href)} />
        <Button label="Rechazar condiciones" variant="secondary" onPress={() => accept.mutate(false)} />
      </> : null}
      {accept.isSuccess ? <StatusState icon="checkmark-circle-outline" title="Respuesta enviada" message="Registramos tu decisión sobre las condiciones del bien." tone="green" /> : null}
      {accept.isError ? <Body muted>{errorToUserMessage(accept.error, 'No fue posible registrar la decisión.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  assetHeroCard: { backgroundColor: colors.surfaceAlt },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  assetHeroIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignSelf: 'stretch' },
});
