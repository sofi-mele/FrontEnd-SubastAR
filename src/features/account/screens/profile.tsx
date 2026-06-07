import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionRow, Badge, Body, Button, Card, Divider, ErrorState, Header, IconButton, InfoTile, LoadingState, Screen, SectionHeader, SecurityNote } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';
import { authService, profileService } from '@/services/api';
import { GuestNotice } from '@/features/account/components/guest-notice';
import { StatusState } from '@/components/ui/primitives';

export function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useSession();
  const { data: profile, isLoading, isError, refetch } = useQuery({ queryKey: ['profile'], queryFn: profileService.me, enabled: !!session });
  const { data: accountState } = useQuery({ queryKey: ['account-state'], queryFn: profileService.accountState, enabled: !!session });
  if (!session) return <Screen><Header title="Perfil" /><GuestNotice /></Screen>;
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !profile) return <Screen><Header title="Perfil" /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Perfil" right={<IconButton icon="create-outline" accessibilityLabel="Editar perfil" tone="primary" onPress={() => router.push('/profile/edit')} />} />
      <Card style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile.name[0]}</Text></View>
        <Body muted>{profile.email}</Body>
        <Badge label={`Categoría ${profile.category}`} />
        <View style={styles.tileRow}>
          <InfoTile icon="person-outline" label="Estado" value={accountState?.status ?? profile.status} tone={accountState?.status === 'Regular' ? 'green' : accountState?.status === 'Bloqueado' ? 'red' : 'yellow'} />
          <InfoTile icon="shield-checkmark-outline" label="Categoría" value={profile.category} />
        </View>
        <SecurityNote text="Usamos tus datos para validar pujas, pagos y accesos de forma segura." />
      </Card>
      {accountState?.status === 'Multado' ? (
        <StatusState icon="warning-outline" title="Multa pendiente de pago" message={accountState.message ?? 'Regularizá tu cuenta para volver a participar en subastas.'} tone="red" />
      ) : null}
      <Card style={styles.menuBlock}>
        <SectionHeader title="Cuenta" subtitle="Accedé a tu información y actividad" />
        <ActionRow icon="person-outline" label="Datos personales" onPress={() => router.push('/profile/edit')} />
        <Divider />
        <ActionRow icon="time-outline" label="Historial" onPress={() => router.push('/profile/history')} />
        <Divider />
        <ActionRow icon="stats-chart-outline" label="Métricas" onPress={() => router.push('/profile/metrics')} />
        <Divider />
        <ActionRow icon="cube-outline" label="Mis bienes" onPress={() => router.push('/profile/assets')} />
        <Divider />
        <ActionRow icon="bag-check-outline" label="Mis compras" onPress={() => router.push('/purchases')} />
      </Card>
      <Card style={styles.menuBlock}>
        <SectionHeader title="Estado operativo y legal" subtitle="Validaciones para pujas y pagos" />
        <ActionRow icon="card-outline" label="Medios de pago" onPress={() => router.push('/profile/payments')} />
        <Divider />
        <ActionRow icon="warning-outline" label="Multas" onPress={() => router.push('/profile/account-status')} />
      </Card>
      <Card style={styles.menuBlock}>
        <SectionHeader title="Gestión financiera" subtitle="Coberturas y respaldo de tus compras" />
        <ActionRow icon="shield-checkmark-outline" label="Seguros y Pólizas" onPress={() => router.push('/profile/policies')} />
      </Card>
      <Button label="Cerrar sesión" variant="ghost" onPress={async () => {
        try { await authService.logout(); } finally { await signOut(); router.replace('/welcome'); }
      }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', backgroundColor: '#F5F3FF' },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignSelf: 'stretch' },
  menuBlock: { gap: spacing.sm },
  avatar: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  avatarText: { fontFamily: fonts.black, fontSize: 28, color: colors.primary },
});
