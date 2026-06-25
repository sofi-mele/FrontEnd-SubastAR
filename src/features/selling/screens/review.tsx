import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Badge, Body, Button, Card, Header, Screen, SectionHeader, StatusState } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { Summary } from '@/features/selling/components/summary';
import { WizardHeader } from '@/features/selling/components/wizard-header';

export function SellReviewScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ amount: string; code: string; name: string; type: string; photos: string; documents: string }>();
  const confirm = useMutation({
    mutationFn: () => assetService.confirm(params.code ?? ''),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      router.replace({ pathname: '/sell/success', params: { code: response.codigo_solicitud, status: response.estado } });
    },
  });
  return (
    <Screen>
      <Header title="Confirmar" onBack={back} />
      <Card style={styles.heroCard}>
        <Badge label="Paso 4 - Revisión" tone="purple" />
        <Body muted>Esta es la última instancia para confirmar que los datos, fotos y documentos estén correctos.</Body>
      </Card>
      <WizardHeader current={3} />
      <SectionHeader title="Resumen final" subtitle="Verificá categoría, cantidad y adjuntos" />
      <Card style={styles.summaryCard}>
        <Badge label={params.type === 'obra_arte' ? 'Obra de arte' : params.type === 'objeto_disenador' ? 'Objeto de diseñador' : 'Otro'} />
        <Summary label="Cantidad de elementos" value={params.amount ?? '-'} />
        <Summary label="Fotos cargadas" value={`${params.photos} archivos`} />
        <Summary label="Documentación" value={`${params.documents} adjuntos`} />
        <Summary label="Declaración de propiedad" value="Aceptada" />
      </Card>
      <StatusState icon="document-text-outline" title="Revisión final" message="Al confirmar, la solicitud pasa a revisión de la empresa y queda pendiente de inspección." tone="yellow" />
      <Button label={confirm.isPending ? 'Enviando...' : 'Confirmar'} disabled={confirm.isPending} onPress={() => confirm.mutate()} />
      {confirm.isError ? <Body muted>{errorToUserMessage(confirm.error, 'No fue posible enviar la solicitud.')}</Body> : null}
      <Button label="Editar bien" variant="secondary" onPress={() => router.back()} />
      <Button label="Cancelar" variant="ghost" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD', gap: spacing.sm },
  summaryCard: { gap: spacing.md, backgroundColor: '#FFFFFF' },
});
