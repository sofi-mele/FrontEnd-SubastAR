import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

import { Body, Card, Title } from '@/components/ui/primitives';
import { colors, spacing } from '@/constants/theme';

export function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.loadingOverlay}>
        <Card style={styles.loadingOverlayCard}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Title>Actualizando el bien</Title>
          <Body muted>Guardamos tus cambios y refrescamos la información.</Body>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(17,17,23,0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingOverlayCard: { width: '100%', maxWidth: 360, alignItems: 'center', gap: spacing.md },
});
