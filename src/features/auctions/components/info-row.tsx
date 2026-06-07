import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '@/constants/theme';

export function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowIcon}>
        <Ionicons name={icon} color={colors.primary} size={18} />
      </View>
      <View style={styles.infoRowCopy}>
        <Text style={styles.meta}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  infoRowIcon: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  infoRowCopy: { flex: 1 },
  meta: { color: colors.textMuted, fontSize: typography.caption, fontFamily: fonts.regular },
  infoValue: { color: colors.text, fontSize: typography.body, fontFamily: fonts.medium },
});
