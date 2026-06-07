import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuctionCard } from '@/components/domain/cards';
import { AuthRequiredModal, Badge, Body, Card, EmptyState, ErrorState, Header, InfoTile, LoadingState, Screen, SectionHeader, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';
import { auctionService, profileService } from '@/services/api';

export function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [requiresAuth, setRequiresAuth] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['auctions', 'featured'], queryFn: () => auctionService.list() });
  const { data: accountState } = useQuery({ queryKey: ['account-state'], queryFn: profileService.accountState, enabled: !!session });
  const featured = data?.[0];
  if (accountState?.status === 'Bloqueado') {
    return (
      <Screen>
        <Header title="Inicio bloqueado" />
        <StatusState icon="lock-closed-outline" title="Tu cuenta está bloqueada" message={accountState.message ?? 'No podés operar mientras la cuenta permanezca bloqueada.'} tone="red" actionLabel="Ver estado de cuenta" onAction={() => router.push('/profile/account-status')} />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title="" right={<Body muted><Text style={{ textAlign: 'right' }}>Bienvenido{session ? `, ${session.profile.name.split(' ')[0]}` : ''}</Text></Body>} />
        <Card style={styles.homeHero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroMark}><Ionicons name="hammer-outline" size={20} color={colors.primary} /></View>
          <View style={styles.heroHeaderCopy}>
            <Badge label={session ? 'Cuenta activa' : 'Acceso invitado'} tone={session ? 'green' : 'purple'} />
            <Text style={styles.homeHeroTitle}>Descubrí lotes destacados y pujá con confianza</Text>
            <Text style={styles.homeHeroBody}>Subastas seleccionadas, pagos verificados y seguimiento claro en una experiencia más profesional.</Text>
          </View>
        </View>
        <View style={styles.tileRow}>
          <InfoTile icon="radio-outline" label="En vivo" value="Ofertá en tiempo real" />
          <InfoTile icon="cube-outline" label="Catálogo" value="Lotes verificados" />
        </View>
      </Card>
      <SectionHeader title="Destacada" subtitle="Subasta seleccionada para hoy" />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : featured ? <AuctionCard auction={featured} onPress={() => router.push(`/auction/${featured.id}`)} /> : <EmptyState title="No hay subastas destacadas" message="Volvé a consultar más tarde." />}
      <SectionHeader title="Atajos" subtitle="Acciones rápidas para continuar" />
      <Pressable style={styles.exploreHero} onPress={() => router.push('/(tabs)/auctions')}>
        <Ionicons name="hammer-outline" size={27} color="#FFF" />
        <View style={styles.flex}>
          <Text style={styles.heroTitle}>Explorar subastas</Text>
          <Text style={styles.heroBody}>Ver catálogos y pujar</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#FFF" />
      </Pressable>
      <Pressable style={styles.quickHero} onPress={() => session ? router.push('/sell') : setRequiresAuth(true)}>
        <Ionicons name="add-circle-outline" size={27} color={colors.primary} />
        <View style={styles.flex}>
          <Text style={styles.sellTitle}>Subir bien</Text>
          <Text style={styles.heroBodyDark}>Publicá un bien para subastar</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </Pressable>
      <AuthRequiredModal
        visible={requiresAuth}
        onClose={() => setRequiresAuth(false)}
        onLogin={() => { setRequiresAuth(false); router.push({ pathname: '/login', params: { returnTo: '/sell' } }); }}
        onRegister={() => { setRequiresAuth(false); router.push({ pathname: '/register', params: { returnTo: '/sell' } }); }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  homeHero: { gap: spacing.lg, backgroundColor: colors.surfaceAlt, borderColor: colors.primaryBorder },
  heroHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  heroMark: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroHeaderCopy: { flex: 1, gap: spacing.xs },
  homeHeroTitle: { color: colors.textStrong, fontSize: typography.headline, lineHeight: 28, fontFamily: fonts.black },
  homeHeroBody: { color: colors.textMuted, fontSize: typography.bodySmall, lineHeight: 20, fontFamily: fonts.regular },
  exploreHero: { minHeight: 96, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.primaryDark, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroTitle: { fontSize: typography.heading, color: '#FFF', fontFamily: fonts.bold },
  heroBody: { fontSize: typography.small, color: '#D7D0FF', fontFamily: fonts.regular },
  quickHero: { minHeight: 92, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primaryBorder, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sellTitle: { fontSize: typography.heading, color: colors.text, fontFamily: fonts.bold },
  heroBodyDark: { fontSize: typography.small, color: colors.textMuted, fontFamily: fonts.regular },
});
