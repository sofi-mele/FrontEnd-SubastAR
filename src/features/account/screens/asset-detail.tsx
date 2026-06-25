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
  const rejectionReason = data.rejectionReason ?? data.detail;
  const showHeaderDetail = data.status !== 'Rechazado' || (data.detail && data.detail !== rejectionReason);
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
        {showHeaderDetail ? <Body>{data.detail}</Body> : null}
        <View style={styles.tileRow}>
          <InfoTile icon="albums-outline" label="Fotos" value={data.photosUploaded != null ? String(data.photosUploaded) : 'No asignado'} />
          <InfoTile icon="document-text-outline" label="Documentos" value={data.documentationAttached ? 'Adjunta' : 'No asignado'} tone={data.documentationAttached ? 'green' : 'yellow'} />
        </View>
        <Divider />
        <SummaryRow label="Precio base" value={data.basePrice != null ? formatCurrency(data.basePrice) : 'No asignado'} />
        <SummaryRow label="Comisión" value={data.commission != null ? formatCurrency(data.commission) : 'No asignado'} />
        <SummaryRow label="Depósito" value={data.depositLocation ?? 'No asignado'} />
        {data.status === 'Rechazado' ? <SummaryRow label="Motivo de rechazo" value={rejectionReason} /> : null}
        {data.status === 'Rechazado' ? <SummaryRow label="Costo de devolución" value={data.rejectionShippingCost != null ? formatCurrency(data.rejectionShippingCost) : 'No informado'} /> : null}
      </Card>
      {data.status === 'En inspección' && !data.depositReceived ? (
        <StatusState
          icon="cube-outline"
          title="Tu bien fue seleccionado para inspección"
          message={`La empresa está interesada en tu bien. Debés llevarlo físicamente${data.depositLocation ? ` a ${data.depositLocation}` : ' a la dirección indicada en el chat'}. Tené en cuenta que si el bien no es aceptado tras la inspección presencial, los gastos de devolución corren por tu cuenta.`}
          tone="purple"
        />
      ) : null}
      {data.status === 'En inspección' && data.depositReceived ? (
        <StatusState
          icon="checkmark-circle-outline"
          title="Bien recibido en depósito"
          message="Tu bien llegó a nuestras instalaciones y está siendo evaluado por nuestros especialistas. Te notificaremos el resultado de la inspección."
          tone="green"
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
