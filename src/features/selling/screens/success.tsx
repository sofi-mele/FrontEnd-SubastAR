import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button, Card, Screen, StatusState } from '@/components/ui/primitives';
import { Summary } from '@/features/selling/components/summary';

export function SellSuccessScreen() {
  const router = useRouter();
  const { code, status } = useLocalSearchParams<{ code: string; status: string }>();
  return (
    <Screen style={styles.success}>
      <StatusState icon="checkmark-circle-outline" title="Solicitud enviada exitosamente" message="Tu bien fue enviado para revisión. Te notificaremos cuando la empresa complete la inspección e informe fecha, valor base y comisiones." tone="green" />
      <Card style={styles.fullWidth}>
        <Summary label="Código de solicitud" value={code ?? '-'} />
        <Summary label="Estado" value={status ?? 'Pendiente de revisión'} />
      </Card>
      <Button label="Agregar otro bien" onPress={() => router.replace('/sell')} />
      <Button label="Ver mis bienes" variant="secondary" onPress={() => router.replace('/profile/assets')} />
      <Button label="Volver al inicio" variant="ghost" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: { paddingTop: 75, alignItems: 'center' },
  fullWidth: { width: '100%' },
});
