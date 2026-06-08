import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '@/constants/theme';

const NativeInput = 'input' as any;

function parseDateValue(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDateValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DateInputImpl = ({
  label = 'Fecha de creación (AAAA-MM-DD)',
  value,
  onChangeText,
  error,
}: {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);
  const todayString = formatDateValue(new Date());
  const isFuture = !!value && value > todayString;
  const displayError = isFuture ? 'Fecha invalida' : error;
  const dateValue = useMemo(() => parseDateValue(value), [value]);

  if (Platform.OS === 'web') {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.trigger, displayError ? styles.triggerError : undefined]}>
          <NativeInput
            type="date"
            max={todayString}
            value={value || ''}
            onChange={(e: any) => {
              const v: string = e.target.value;
              onChangeText(v);
            }}
            style={{
              flex: 1,
              border: 'none',
              fontSize: 16,
              fontFamily: 'inherit',
              outline: 'none',
              background: 'transparent',
              color: value ? colors.text : colors.textMuted,
              cursor: 'pointer',
            }}
          />
          <View style={styles.iconWrap}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          </View>
        </View>
        {displayError ? <Text style={styles.displayErrorText}>{displayError}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.trigger, displayError ? styles.triggerError : undefined, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.copy}>
          <Text style={[styles.value, !value && styles.placeholder]}>{value || 'AAAA-MM-DD'}</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </View>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            if (selectedDate) {
              const today = new Date();
              today.setHours(23, 59, 59, 999);
              onChangeText(formatDateValue(selectedDate > today ? today : selectedDate));
            }
            setOpen(false);
          }}
        />
      ) : null}
      {displayError ? <Text style={styles.displayErrorText}>{displayError}</Text> : null}
    </View>
  );
};

export { DateInputImpl as DateInput };

const styles = StyleSheet.create({
  triggerError: { borderColor: colors.danger },
  displayErrorText: { color: colors.danger, fontSize: 11, marginTop: 4 },
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
});
