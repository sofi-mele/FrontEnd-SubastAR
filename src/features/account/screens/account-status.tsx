import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { formatCurrency } from '@/components/domain/cards';
import { Body, Button, Card, ErrorState, Header, LoadingState, Screen, StatusState } from '@/components/ui/primitives';
import { colors, fonts, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { profileService } from '@/services/api';

export function AccountStatusScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['account-state'], queryFn: profileService.accountState });
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Estado de cuenta" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  const regular = data.status === 'Regular';
  const blocked = data.status === 'Bloqueado';
  const title = regular ? 'Estado de cuenta regular' : blocked ? 'Cuenta bloqueada' : 'Cuenta multada';
  const description = regular
    ? 'No posees multas pendientes. Podés participar normalmente en subastas.'
    : blocked
      ? 'No podés operar mientras la cuenta permanezca bloqueada.'
      : 'Tenés multas pendientes. Debés regularizarlas antes de participar en otra subasta.';
  return (
    <Screen>
      <Header title="Estado de cuenta" onBack={back} />
      <StatusState icon={regular ? 'checkmark-circle-outline' : blocked ? 'lock-closed-outline' : 'alert-circle-outline'} title={title} message={data.message ? `${description} ${data.message}` : description} tone={regular ? 'green' : 'red'} />
      {data.penalty > 0 ? <Card style={styles.penaltyCard}><Body muted>Importe pendiente</Body><Text style={styles.penalty}>{formatCurrency(data.penalty)}</Text></Card> : null}
      {!regular ? <Button label="Ver compras pendientes" onPress={() => router.push('/purchases')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  penaltyCard: { alignItems: 'center', backgroundColor: colors.dangerSoft },
  penalty: { color: colors.danger, fontSize: typography.title, fontFamily: fonts.black },
});
