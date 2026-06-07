import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '@/constants/theme';

export function FilterTabs<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (next: T) => void }) {
  return (
    <View style={styles.filters}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.filter, value === option && styles.filterActive]} onPress={() => onChange(option)}>
          <Text style={[styles.filterText, value === option && styles.filterTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceAlt },
  filterActive: { backgroundColor: colors.primarySoft },
  filterText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: typography.small },
  filterTextActive: { color: colors.primary },
});
