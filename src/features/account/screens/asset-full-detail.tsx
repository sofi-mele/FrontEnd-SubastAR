import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Badge, Body, Button, Card, EmptyState, ErrorState, Header, Input, LoadingState, Screen, SectionHeader, SecurityNote } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { formatAmountWithCurrency, openExternalUrl } from '@/features/account/utils';
import { LoadingOverlay } from '@/features/account/components/loading-overlay';

function AssetField({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.fieldCard}>
      <Body muted>{label}</Body>
      <Text style={styles.fieldValue}>{value || 'No asignado'}</Text>
    </View>
  );
}

export function AssetFullDetailScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['asset', id], queryFn: () => assetService.get(id ?? '') });
  const [photoIndex, setPhotoIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [suggestedBasePrice, setSuggestedBasePrice] = useState('');
  const [suggestedBasePriceCurrency, setSuggestedBasePriceCurrency] = useState('ARS');
  const photos = data?.photos?.filter((photo) => photo.url) ?? [];
  const selectedPhoto = photos[photoIndex];
  const numericSuggestedBasePrice = suggestedBasePrice ? Number(suggestedBasePrice) : undefined;
  const invalidSuggestedBasePrice = numericSuggestedBasePrice != null && (!Number.isFinite(numericSuggestedBasePrice) || numericSuggestedBasePrice <= 0);

  const updateAsset = useMutation({
    mutationFn: async () => {
      await assetService.update(id ?? '', {
        additionalInformation,
        suggestedBasePrice: numericSuggestedBasePrice,
        suggestedBasePriceCurrency: suggestedBasePriceCurrency || undefined,
      });
      return assetService.get(id ?? '');
    },
    onSuccess: (updatedAsset) => {
      queryClient.setQueryData(['asset', id], updatedAsset);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setEditing(false);
      setEditingPrice(false);
    },
  });

  useEffect(() => {
    if (!editing && data) {
      setAdditionalInformation(data.additionalInformation ?? '');
      setSuggestedBasePrice(data.suggestedBasePrice != null ? String(data.suggestedBasePrice) : '');
      setSuggestedBasePriceCurrency(data.suggestedBasePriceCurrency ?? 'ARS');
    }
  }, [data, editing]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const intervalId = setInterval(() => setPhotoIndex((current) => (current + 1) % photos.length), 4000);
    return () => clearInterval(intervalId);
  }, [photos.length]);

  useEffect(() => {
    if (photoIndex >= photos.length) setPhotoIndex(0);
  }, [photoIndex, photos.length]);

  function goPrev() {
    if (!photos.length) return;
    setPhotoIndex((current) => current === 0 ? photos.length - 1 : current - 1);
  }

  function goNext() {
    if (!photos.length) return;
    setPhotoIndex((current) => (current + 1) % photos.length);
  }

  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Detalle completo del bien" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  const rejectionReason = data.rejectionReason ?? data.detail;
  const showHeaderDetail = data.status !== 'Rechazado' || (data.detail && data.detail !== rejectionReason);

  return (
    <Screen>
      <Header title="Detalle completo del bien" subtitle={data.title} onBack={back} />
      <Card style={[styles.itemCard, styles.assetHeroCard]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderCopy}>
            <Badge label={data.status} tone={data.status === 'Aceptado' ? 'green' : data.status === 'Rechazado' ? 'red' : data.status === 'En inspección' ? 'purple' : 'yellow'} />
            <Text style={styles.cardTitle}>{data.title}</Text>
            {data.category && data.category !== 'Sin asignar' ? <Body muted>{data.category}</Body> : null}
          </View>
          <View style={styles.assetHeroIcon}><Ionicons name="analytics-outline" size={24} color={colors.primary} /></View>
        </View>
        {showHeaderDetail ? <Body>{data.detail}</Body> : null}
        {data.status === 'Rechazado' ? <AssetField label="Motivo de rechazo" value={rejectionReason} /> : null}
        {data.status === 'Rechazado' ? <AssetField label="Costo de devolución" value={data.rejectionShippingCost != null ? formatCurrency(data.rejectionShippingCost) : 'No informado'} /> : null}
      </Card>
      <Card style={styles.assetGalleryCard}>
        <SectionHeader title="Galería del bien" subtitle={`${photos.length} imágenes cargadas`} />
        {selectedPhoto?.url ? (
          <View style={styles.carouselFrame}>
            <Image source={{ uri: selectedPhoto.url }} style={styles.assetMainPhoto} resizeMode="cover" />
            {photos.length > 1 ? (
              <>
                <Pressable style={[styles.carouselButton, styles.carouselButtonLeft]} onPress={goPrev}>
                  <Ionicons name="chevron-back" size={22} color="#FFF" />
                </Pressable>
                <Pressable style={[styles.carouselButton, styles.carouselButtonRight]} onPress={goNext}>
                  <Ionicons name="chevron-forward" size={22} color="#FFF" />
                </Pressable>
                <View style={styles.carouselDots}>
                  {photos.map((photo, index) => (
                    <Pressable key={photo.id} onPress={() => setPhotoIndex(index)} style={[styles.carouselDot, index === photoIndex && styles.carouselDotActive]} />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <EmptyState title="Sin fotos disponibles" message="Las fotos cargadas aparecerán acá." />
        )}
        {photos.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetThumbRow}>
            {photos.map((photo, index) => (
              <Pressable
                key={photo.id}
                style={[styles.assetThumbButton, index === photoIndex && styles.assetThumbButtonActive]}
                onPress={() => setPhotoIndex(index)}>
                <Image source={{ uri: photo.url }} style={styles.assetThumb} resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </Card>
      <Card style={styles.itemCard}>
        <SectionHeader title="Información declarada" subtitle="Datos informados al iniciar la solicitud" />
        <View style={styles.fieldGrid}>
          <AssetField label="Descripción técnica" value={data.technicalDescription} />
          <AssetField label="Cantidad de elementos" value={data.quantity != null ? String(data.quantity) : undefined} />
          <AssetField label="Información adicional" value={data.additionalInformation} />
          {data.originPeriod ? <AssetField label="Época u origen" value={data.originPeriod} /> : null}
          {data.artistDesigner ? <AssetField label="Artista o diseñador" value={data.artistDesigner} /> : null}
          {data.historicalData ? <AssetField label="Datos históricos" value={data.historicalData} /> : null}
        </View>
      </Card>
      <Card style={styles.itemCard}>
        <SectionHeader title="Condiciones de subasta" subtitle="Valores y asignaciones definidos para el bien" />
        <View style={styles.fieldGrid}>
          <AssetField label="Precio base asignado" value={data.basePrice != null ? formatCurrency(data.basePrice) : undefined} />
          {data.status === 'Pendiente' ? (
            editingPrice ? (
              <View style={styles.fieldCard}>
                <Body muted>Precio base sugerido</Body>
                <Input label="" value={suggestedBasePrice} onChangeText={setSuggestedBasePrice} keyboardType="number-pad" placeholder="Ej. 50000" />
                <View style={styles.currencyToggle}>
                  {(['ARS', 'USD'] as const).map((c) => (
                    <Pressable key={c} onPress={() => setSuggestedBasePriceCurrency(c)} style={[styles.currencyOption, suggestedBasePriceCurrency === c && styles.currencyOptionActive]}>
                      <Text style={[styles.currencyOptionText, suggestedBasePriceCurrency === c && styles.currencyOptionTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.editActionsRow}>
                  <Button label={updateAsset.isPending ? 'Guardando...' : 'Guardar'} size="sm" disabled={updateAsset.isPending} onPress={() => updateAsset.mutate()} />
                  <Button label="Cancelar" size="sm" variant="secondary" onPress={() => setEditingPrice(false)} />
                </View>
              </View>
            ) : (
              <Pressable onPress={() => setEditingPrice(true)}>
                <View style={styles.fieldCard}>
                  <Body muted>Precio base sugerido</Body>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.fieldValue}>{data.suggestedBasePrice != null ? formatAmountWithCurrency(data.suggestedBasePrice, data.suggestedBasePriceCurrency) : 'No asignado'}</Text>
                    <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  </View>
                </View>
              </Pressable>
            )
          ) : (
            <AssetField label="Precio base sugerido" value={data.suggestedBasePrice != null ? formatAmountWithCurrency(data.suggestedBasePrice, data.suggestedBasePriceCurrency) : undefined} />
          )}
          <AssetField label="Comisión" value={data.commission != null ? formatCurrency(data.commission) : undefined} />
          <AssetField label="Subasta asignada" value={data.assignedAuction} />
          <AssetField label="Depósito" value={data.depositLocation} />
          <AssetField label="Póliza" value={data.policyId} />
        </View>
        {data.policyId ? (
          <Button label="Ver póliza de seguro" icon="shield-checkmark-outline" variant="secondary" onPress={() => router.push(`/policy/${data.policyId}` as Href)} />
        ) : null}
        <SecurityNote text="El precio base sugerido puede ser revisado por la empresa antes de asignar el bien a una subasta." />
      </Card>
      <Card style={styles.itemCard}>
        <SectionHeader title="Documentación adjunta" subtitle={data.documents?.length ? `${data.documents.length} archivo(s)` : 'Sin archivos disponibles'} />
        {data.documents?.length ? data.documents.map((document) => (
          <View key={document.id} style={styles.documentRow}>
            <View style={styles.documentIcon}>
              <Ionicons name={document.contentType === 'application/pdf' ? 'document-text-outline' : 'image-outline'} size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{document.name ?? 'Documento adjunto'}</Text>
              <Body muted>{document.contentType ?? document.type ?? 'Archivo'}</Body>
            </View>
            <Button label="Ver" variant="secondary" size="sm" disabled={!document.url} onPress={() => openExternalUrl(document.url)} />
          </View>
        )) : (
          <EmptyState title="Sin documentación visible" message="Cuando haya documentos adjuntos aparecerán en esta sección." />
        )}
      </Card>
      {data.status !== 'Rechazado' ? (
        <Card style={styles.itemCard}>
          <SectionHeader title="Editar datos del bien" subtitle="Podés ajustar información visible para la revisión de la empresa" />
          {!editing ? (
            <>
              <Body muted>Estos datos ayudan a la empresa a preparar la futura subasta del bien.</Body>
              <Button label="Editar información" variant="secondary" onPress={() => setEditing(true)} />
            </>
          ) : (
            <>
              <Input label="Información adicional" value={additionalInformation} onChangeText={setAdditionalInformation} multiline />
              {data.status === 'Pendiente' ? <>
                <Input label="Precio base sugerido" value={suggestedBasePrice} onChangeText={setSuggestedBasePrice} keyboardType="number-pad" />
                <Body muted>Divisa del precio sugerido</Body>
                <View style={styles.currencyToggle}>
                  {['ARS', 'USD'].map((currency) => (
                    <Pressable key={currency} onPress={() => setSuggestedBasePriceCurrency(currency)} style={[styles.currencyOption, suggestedBasePriceCurrency === currency && styles.currencyOptionActive]}>
                      <Text style={[styles.currencyOptionText, suggestedBasePriceCurrency === currency && styles.currencyOptionTextActive]}>{currency}</Text>
                    </Pressable>
                  ))}
                </View>
                <Body muted>El precio base sugerido no abre la subasta automáticamente. La empresa puede revisarlo antes de asignar el bien.</Body>
              </> : null}
              <View style={styles.editActionsRow}>
                <Button label={updateAsset.isPending ? 'Guardando...' : 'Guardar cambios'} disabled={updateAsset.isPending || invalidSuggestedBasePrice || (!!suggestedBasePrice && !suggestedBasePriceCurrency)} onPress={() => updateAsset.mutate()} />
                <Button label="Cancelar" variant="secondary" disabled={updateAsset.isPending} onPress={() => setEditing(false)} />
              </View>
              {updateAsset.isError ? <Body muted>{errorToUserMessage(updateAsset.error, 'No fue posible guardar los cambios.')}</Body> : null}
            </>
          )}
        </Card>
      ) : null}
      <LoadingOverlay visible={updateAsset.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
  assetHeroCard: { backgroundColor: colors.surfaceAlt },
  assetGalleryCard: { gap: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  assetHeroIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  carouselFrame: { position: 'relative', overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surfaceAlt },
  carouselButton: { position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,17,23,0.55)' },
  carouselButtonLeft: { left: spacing.md },
  carouselButtonRight: { right: spacing.md },
  carouselDots: { position: 'absolute', left: 0, right: 0, bottom: spacing.md, flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  carouselDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)' },
  carouselDotActive: { width: 22, backgroundColor: '#FFF' },
  assetMainPhoto: { width: '100%', height: 320, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt },
  assetThumbRow: { gap: spacing.sm, paddingVertical: spacing.sm },
  assetThumbButton: { borderWidth: 2, borderColor: 'transparent', borderRadius: radius.md, padding: 2 },
  assetThumbButtonActive: { borderColor: colors.primary },
  assetThumb: { width: 84, height: 84, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  documentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  documentIcon: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  editActionsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  fieldGrid: { gap: spacing.sm },
  fieldCard: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  fieldValue: { color: colors.textStrong, fontSize: typography.body, fontFamily: fonts.medium },
  currencyToggle: { flexDirection: 'row', gap: spacing.sm },
  currencyOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  currencyOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  currencyOptionText: { color: colors.textMuted, fontFamily: fonts.medium },
  currencyOptionTextActive: { color: colors.primary, fontFamily: fonts.bold },
  flex: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
});
