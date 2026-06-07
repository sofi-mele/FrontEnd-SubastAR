import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '@/constants/theme';

const DateInputImpl = ({
  label = 'Fecha de creación (AAAA-MM-DD)',
  value,
  onChangeText,
}: {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function openPicker() {
    const input = inputRef.current as any;
    if (!input) return;
    if ('showPicker' in input) {
      input.showPicker();
      return;
    }
    input.click();
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={({ pressed }) => [styles.trigger, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={label}>
        <View style={styles.copy}>
          <Text style={[styles.value, !value && styles.placeholder]}>{value || 'AAAA-MM-DD'}</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </View>
      </Pressable>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChangeText(event.target.value)}
        style={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
      />
    </View>
  );
};

export { DateInputImpl as DateInput };
export default DateInputImpl;

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  trigger: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pressed: { opacity: 0.82 },
  copy: { flex: 1 },
  value: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: typography.body,
  },
  placeholder: { color: colors.textMuted },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
    left: 0,
    top: 0,
  },
});


