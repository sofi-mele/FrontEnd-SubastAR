import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BrandLogo } from '@/components/brand/logo';
import { Body, Button, Card, InfoTile, Screen, Title } from '@/components/ui/primitives';
import { colors, spacing } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';

export function WelcomeScreen() {
  const router = useRouter();
  const { enterAsGuest } = useSession();
  return (
    <Screen style={styles.welcome}>
      <Card style={styles.welcomeHero}>
        <BrandLogo iconSize={88} />
        <View style={styles.centerCopy}>
          <Title>Descubrí objetos únicos</Title>
          <Body muted>Explorá subastas seleccionadas, pujás con respaldo operativo y gestionás tus compras desde un entorno seguro.</Body>
        </View>
        <View style={styles.tileRow}>
          <InfoTile icon="shield-checkmark-outline" label="Cuenta" value="Validación segura" />
          <InfoTile icon="hammer-outline" label="Subastas" value="Pujas en vivo" />
        </View>
      </Card>
      <Card style={styles.actionsCard}>
        <Button label="Iniciar sesión" onPress={() => router.push('/login')} />
        <Button label="Crear cuenta" variant="secondary" onPress={() => router.push('/register')} />
        <Button label="Continuar como invitado" variant="ghost" onPress={() => { enterAsGuest(); router.replace('/(tabs)'); }} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: { justifyContent: 'space-between' },
  welcomeHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, backgroundColor: colors.surfaceAlt },
  actionsCard: { gap: spacing.md },
  centerCopy: { alignItems: 'center', gap: spacing.sm },
  tileRow: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
});
