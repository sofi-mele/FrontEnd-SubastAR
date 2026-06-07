import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Button, Card, ErrorState, Header, InfoTile, LoadingState, Screen, SectionHeader } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { purchaseService } from '@/services/api';

export function InvoiceScreen() {
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: content, isLoading: loadingContent, isError: contentError, refetch: refetchContent } = useQuery({
    queryKey: ['invoice-content', id],
    queryFn: () => purchaseService.invoiceContent(id ?? ''),
  });
  const { data: purchase, isLoading: loadingPurchase, isError: purchaseError, refetch: refetchPurchase } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseService.get(id ?? ''),
  });
  const download = useMutation({ mutationFn: () => purchaseService.downloadInvoice(id ?? '') });
  const [copied, setCopied] = useState(false);
  async function copyContent() {
    if (!content || Platform.OS !== 'web' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
  }
  if (loadingContent || loadingPurchase) return <Screen><LoadingState /></Screen>;
  if (contentError || purchaseError || !content || !purchase) return <Screen><Header title="Factura" onBack={back} /><ErrorState onRetry={() => { refetchContent(); refetchPurchase(); }} /></Screen>;
  return (
    <Screen>
      <Header title="Factura" onBack={back} />
      <Card style={styles.invoiceHero}>
        <View style={styles.invoiceHeroHeader}>
          <Badge label={purchase.paymentStatus} tone={purchase.paymentStatus.toLowerCase() === 'pagado' ? 'green' : 'yellow'} />
        </View>
        <View style={styles.invoiceHeroCopy}>
          <Body muted>Factura emitida por SubastAR</Body>
        </View>
      </Card>
      <View style={styles.invoiceMetaGrid}>
        <InfoTile icon="cube-outline" label="Item" value={purchase.lot.title} />
        <InfoTile icon="cash-outline" label="Total" value={formatCurrency(purchase.total ?? purchase.amount)} />
        <InfoTile icon="card-outline" label="Pago" value={purchase.paymentStatus} tone={purchase.paymentStatus.toLowerCase() === 'pagado' ? 'green' : 'yellow'} />
        <InfoTile icon="car-outline" label="Entrega" value={purchase.deliveryStatus} />
      </View>
      <Card>
        <SectionHeader title="Exportar comprobante" subtitle="Descargá el archivo .txt o guardalo desde el menú de tu celular" />
        <View style={styles.invoiceActions}>
          <Button label={download.isPending ? 'Descargando...' : 'Descargar TXT'} icon="download-outline" disabled={download.isPending} onPress={() => download.mutate()} />
          {Platform.OS === 'web' && navigator.clipboard ? <Button label={copied ? 'Contenido copiado' : 'Copiar contenido'} variant="secondary" icon="copy-outline" onPress={copyContent} /> : null}
        </View>
        {download.isError ? <Body muted>No fue posible descargar la factura.</Body> : null}
      </Card>
      <Card>
        <SectionHeader title="Vista previa" subtitle="Contenido completo de la factura" />
        <View style={styles.invoicePaper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.invoiceText}>{content}</Text>
          </ScrollView>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  invoiceHero: { alignItems: 'stretch', gap: spacing.md, backgroundColor: colors.surface },
  invoiceHeroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceHeroCopy: { alignItems: 'center', gap: spacing.xs },
  invoiceActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  invoicePaper: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  invoiceText: { fontFamily: Platform.OS === 'web' ? 'monospace' : fonts.regular, color: colors.text, fontSize: typography.body, lineHeight: 24 },
  invoiceMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
