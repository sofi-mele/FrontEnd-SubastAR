import { StyleSheet, Text, View } from 'react-native';

import { Body } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';

export function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Body muted>{label}</Body>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  summaryValue: { color: colors.text, fontSize: typography.body, fontFamily: fonts.regular },
  summaryValueBold: { fontFamily: fonts.black, color: colors.primaryDark },
});
