import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Body, Button, Card, Title } from '@/components/ui/primitives';
import { colors, spacing } from '@/constants/theme';

export function GuestNotice() {
  const router = useRouter();
  return (
    <Card style={styles.notice}>
      <Ionicons name="lock-closed-outline" size={28} color={colors.primary} />
      <Title>Área personal</Title>
      <Body muted>Iniciá sesión para acceder a esta sección.</Body>
      <Button label="Iniciar sesión" onPress={() => router.push('/login')} />
    </Card>
  );
}

const styles = StyleSheet.create({
  notice: { alignItems: 'center', marginTop: spacing.huge },
});
