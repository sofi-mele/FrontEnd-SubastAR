import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';

const platformShadow = {
  shadowColor: '#302477',
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 16,
  elevation: 3,
};

export function CategoryCard({
  label,
  description,
  icon,
  active,
  onPress,
}: {
  label: string;
  description: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.categoryCard, active && styles.categoryCardActive, pressed && styles.pressed]}>
      <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
        <IconButton icon={icon} accessibilityLabel={label} tone={active ? 'primary' : 'neutral'} />
      </View>
      <View style={styles.categoryCopy}>
        <Text style={styles.categoryText}>{label}</Text>
        <Text style={styles.categoryDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={active ? colors.primary : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.78 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface, ...platformShadow },
  categoryCardActive: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  categoryIcon: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  categoryIconActive: { backgroundColor: colors.primarySoft },
  categoryCopy: { flex: 1, gap: spacing.xs },
  categoryText: { color: colors.textStrong, fontSize: typography.body, fontFamily: fonts.bold },
  categoryDescription: { color: colors.textMuted, fontSize: typography.bodySmall, fontFamily: fonts.regular },
});
