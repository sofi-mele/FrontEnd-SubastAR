import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, Header, InfoTile, Screen, StatusState, UploadBox } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { explainFileAccess, permissionDeniedMessage, requestMediaLibraryPermission } from '@/services/permissions';
import type { FileUpload } from '@/types/domain';
import { PhotoPreview } from '@/features/selling/components/photo-preview';
import { WizardHeader } from '@/features/selling/components/wizard-header';

export function SellPhotosScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { amount, code, name, type } = useLocalSearchParams<{ amount: string; code: string; name: string; type: string }>();
  const [photos, setPhotos] = useState<FileUpload[]>([]);
  const [apiError, setApiError] = useState('');
  const upload = useMutation({
    mutationFn: () => assetService.uploadPhotos(code ?? '', photos),
    onSuccess: () => router.push({ pathname: '/sell/documents', params: { amount, code, name, type, photos: String(photos.length) } }),
  });
  async function addPhoto() {
    try {
      setApiError('');
      explainFileAccess('photo');
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        setApiError(permissionDeniedMessage('gallery'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.7 });
      if (!result.canceled) setPhotos((current) => [...current, ...result.assets.map((asset, index) => ({
        uri: asset.uri, name: asset.fileName ?? `bien-${Date.now()}-${index}.jpg`, type: asset.mimeType ?? 'image/jpeg', file: asset.file,
      }))]);
    } catch {
      setApiError(permissionDeniedMessage('gallery'));
    }
  }
  return (
    <Screen>
      <Header title="Fotografías" onBack={back} />
      <Card style={styles.heroCard}>
        <Badge label="Paso 2 - Fotos" tone="purple" />
        <Body muted>Mostrá el bien desde varios ángulos. Necesitás al menos 6 fotos para seguir.</Body>
      </Card>
      <WizardHeader current={1} />
      <View style={styles.tileRow}>
        <InfoTile icon="camera-outline" label="Mínimo" value="6 fotos" tone={photos.length >= 6 ? 'green' : 'yellow'} />
      </View>
      <Card style={styles.dropzoneCard}>
        <Body muted>Para cargar fotos necesitamos abrir tu galeria. En computadora se abrira el selector de archivos.</Body>
        <UploadBox label="Agregar fotos" description="JPG o PNG" icon="camera-outline" onPress={addPhoto} />
        <Body muted>Podés seleccionar varias imágenes a la vez. Si no cumplen el mínimo, no podrás avanzar.</Body>
      </Card>
      {apiError ? <StatusState icon="alert-circle-outline" title="No pudimos acceder a tus fotos" message={apiError} tone="red" /> : null}
      <View style={styles.gallery}>
        {photos.map((file) => <PhotoPreview key={file.uri} file={file} onRemove={() => setPhotos((current) => current.filter((photo) => photo.uri !== file.uri))} />)}
      </View>
      <Badge label={`${photos.length} foto${photos.length !== 1 ? 's' : ''} cargada${photos.length !== 1 ? 's' : ''}`} tone={photos.length >= 6 ? 'green' : 'yellow'} />
      <Button label={upload.isPending ? 'Subiendo...' : 'Continuar'} disabled={photos.length < 6 || upload.isPending} onPress={() => upload.mutate()} />
      {upload.isError ? <Body muted>{errorToUserMessage(upload.error, 'No fue posible subir las fotos.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD', gap: spacing.sm },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  dropzoneCard: { backgroundColor: '#EDE9FE', borderColor: '#C4B5FD', gap: spacing.sm },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
