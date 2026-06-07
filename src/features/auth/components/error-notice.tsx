import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';

export function ErrorNotice({ message }: { message: string }) {
  return (
    <Card style={styles.errorCard}>
      <Text style={styles.error}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  errorCard: { backgroundColor: colors.dangerSoft, borderColor: '#F7C9C9', paddingVertical: spacing.sm },
  error: { color: colors.danger, fontSize: typography.small, fontFamily: fonts.bold, textAlign: 'center' },
});
