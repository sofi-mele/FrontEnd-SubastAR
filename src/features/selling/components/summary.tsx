import { StyleSheet, Text, View } from 'react-native';

import { Body } from '@/components/ui/primitives';
import { colors, fonts, typography } from '@/constants/theme';

export function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summary}>
      <Body muted>{label}</Body>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryValue: { color: colors.textStrong, fontFamily: fonts.bold, fontSize: typography.body },
});
