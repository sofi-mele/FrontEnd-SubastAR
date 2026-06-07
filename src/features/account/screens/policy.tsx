import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Button, Card, Divider, ErrorState, Header, InfoTile, LoadingState, Screen, StatusState, Title } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { insuranceService } from '@/services/api';
import { SummaryRow } from '@/features/account/components/summary-row';

export function PolicyScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['policy', id], queryFn: () => insuranceService.get(id ?? '') });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Póliza de seguro" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Póliza de seguro" onBack={back} />
      <StatusState icon="shield-checkmark-outline" title={data.company} message={`Póliza ${data.number} - Vigente hasta ${data.validUntil ?? 'sin fecha informada'}`} tone="green" />
      <Card style={styles.itemCard}>
        <Title>{data.company}</Title>
        <View style={styles.tileRow}>
          <InfoTile icon="cash-outline" label="Valor asegurado" value={formatCurrency(data.insuredValue)} />
          <InfoTile icon="checkmark-circle-outline" label="Estado" value="Activa" tone="green" />
        </View>
        <Divider />
        <SummaryRow label="Valor asegurado" value={formatCurrency(data.insuredValue)} bold />
        <SummaryRow label="Cobertura" value={data.coverage ?? 'Sin detalle'} />
      </Card>
      <Card style={styles.itemCard}>
        <Text style={styles.cardTitle}>Piezas cubiertas</Text>
        {data.items.length ? data.items.map((item) => <Body key={item} muted>{item}</Body>) : <Body muted>No hay detalle de piezas informado.</Body>}
      </Card>
      <Card style={styles.itemCard}>
        <Text style={styles.cardTitle}>Contacto aseguradora</Text>
        <Body muted>{data.contact?.phone ?? 'Teléfono no informado'}</Body>
        <Body muted>{data.contact?.email ?? 'Correo no informado'}</Body>
      </Card>
      <Button label="Ampliar cobertura" onPress={() => router.push(`/policy/${id}/extend` as Href)} />
      <Button label="Ver contacto completo" variant="secondary" onPress={() => router.push(`/policy/${id}/contact` as Href)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignSelf: 'stretch' },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
});
