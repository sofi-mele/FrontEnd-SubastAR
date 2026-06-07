import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Badge, Body, Button, Card, ErrorState, Header, LoadingState, Screen, StatusState } from '@/components/ui/primitives';
import { useSafeBack } from '@/hooks/use-safe-back';
import { purchaseService } from '@/services/api';

export function DeliveryScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['purchase', id], queryFn: () => purchaseService.get(id ?? '') });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Entrega" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  const status = data.deliveryStatus.toLowerCase();
  const ready = status === 'listo_para_retirar';
  const moving = status === 'en_camino';
  const delivered = status === 'entregado';
  const title = ready ? 'Listo para retirar' : moving ? 'Envío en camino' : delivered ? 'Entrega completada' : 'Coordinación de entrega';
  const text = ready
    ? data.deliveryAddress ?? 'Acercate al depósito indicado con tu comprobante de compra.'
    : moving
      ? 'Tu lote se encuentra en traslado. Recibirás novedades cuando llegue a destino.'
      : delivered
        ? 'La entrega fue registrada correctamente.'
        : data.deliveryAddress ?? 'Estamos coordinando la dirección y modalidad de entrega.';
  return (
    <Screen>
      <Header title="Entrega" onBack={back} />
      <StatusState icon={ready ? 'location-outline' : moving ? 'car-outline' : delivered ? 'checkmark-circle-outline' : 'time-outline'} title={title} message={text} tone={delivered || ready ? 'green' : 'purple'} />
      {data.insuranceId ? (
        <Card>
          <Badge label="Póliza asociada" tone="green" />
          <Body muted>La cobertura asociada al lote acompaña esta entrega.</Body>
          <Button label="Ver póliza" variant="secondary" onPress={() => router.push(`/policy/${data.insuranceId}`)} />
        </Card>
      ) : null}
      <Button label="Coordinar por Chat" variant="secondary" icon="chatbubble-ellipses-outline" onPress={() => router.push('/chat/soporte')} />
      <Button label="Volver al detalle" onPress={back} />
    </Screen>
  );
}
