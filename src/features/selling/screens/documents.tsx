import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, Divider, Header, Screen, SectionHeader, SectionLabel, StatusState, UploadBox } from '@/components/ui/primitives';
import { colors, spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { explainFileAccess, permissionDeniedMessage } from '@/services/permissions';
import type { FileUpload } from '@/types/domain';
import { WizardHeader } from '@/features/selling/components/wizard-header';

export function SellDocumentsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const params = useLocalSearchParams<{ amount: string; code: string; name: string; type: string; photos: string }>();
  const [documents, setDocuments] = useState<FileUpload[]>([]);
  const [declaration, setDeclaration] = useState(false);
  const [apiError, setApiError] = useState('');
  const upload = useMutation({
    mutationFn: () => assetService.uploadDocuments(params.code ?? '', declaration, documents),
    onSuccess: () => router.push({ pathname: '/sell/review', params: { ...params, documents: String(documents.length) } }),
  });
  async function addDocument() {
    try {
      setApiError('');
      explainFileAccess('document');
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], multiple: true, copyToCacheDirectory: true });
      if (!result.canceled) setDocuments(result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: asset.name || `documento-${Date.now()}-${index}.pdf`,
        type: asset.mimeType ?? 'application/pdf',
        file: asset.file,
      })));
    } catch {
      setApiError(permissionDeniedMessage('document'));
    }
  }
  return (
    <Screen>
      <Header title="Documentación" onBack={back} />
      <Card style={styles.heroCard}>
        <Badge label="Paso 3 - Documentos" tone="purple" />
        <Body muted>La declaración es obligatoria. También podés adjuntar comprobantes para acelerar la revisión.</Body>
      </Card>
      <WizardHeader current={2} />
      <SectionHeader title="Declaración de propiedad" subtitle="Confirmación obligatoria para avanzar" />
      <Pressable onPress={() => setDeclaration((current) => !current)}>
        <Card style={[styles.declaration, declaration && styles.declarationActive]}>
          <Ionicons name={declaration ? 'checkmark-circle' : 'ellipse-outline'} color={declaration ? colors.success : colors.primary} size={22} />
          <Body>Declaro que el bien ofrecido para subasta es de mi exclusiva propiedad y que no se encuentra sujeto a ningún impedimento legal que restrinja su disposición.</Body>
        </Card>
      </Pressable>
      <SectionLabel>Documentación preventiva opcional</SectionLabel>
      <Card style={styles.dropzoneCard}>
        <Body muted>Al tocar adjuntar se abrira el selector de archivos del dispositivo. Podes elegir PDF o imagenes.</Body>
        <UploadBox label="Adjuntar comprobantes" description="PDF o imagen, hasta 10 MB" icon="document-attach-outline" done={documents.length > 0} onPress={addDocument} />
        <Body muted>Pueden ser certificados, respaldos o imágenes adicionales que ayuden a la revisión.</Body>
      </Card>
      {apiError ? <StatusState icon="alert-circle-outline" title="No pudimos abrir tus documentos" message={apiError} tone="red" /> : null}
      {documents.map((document) => (
        <Card key={document.uri} style={styles.documentRow}>
          <View style={styles.documentRowCopy}>
            <Ionicons name="document-attach-outline" size={18} color={colors.primary} />
            <Body>{document.name}</Body>
          </View>
          <Pressable onPress={() => setDocuments((current) => current.filter((file) => file.uri !== document.uri))}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </Card>
      ))}
      <Divider />
      <Button label={upload.isPending ? 'Guardando...' : 'Siguiente'} disabled={!declaration || upload.isPending} onPress={() => upload.mutate()} />
      {upload.isError ? <Body muted>{errorToUserMessage(upload.error, 'No fue posible cargar documentación.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD', gap: spacing.sm },
  dropzoneCard: { backgroundColor: '#EDE9FE', borderColor: '#C4B5FD', gap: spacing.sm },
  declaration: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border },
  declarationActive: { backgroundColor: colors.successSoft, borderColor: '#C9EED5' },
  documentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  documentRowCopy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
});
