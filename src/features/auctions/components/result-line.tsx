import { StyleSheet, Text, View } from 'react-native';

import { Body } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';

export function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultLine}>
      <Body muted>{label}</Body>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resultLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  resultValue: { color: colors.text, fontFamily: fonts.bold, fontSize: typography.body, textAlign: 'right' },
});
