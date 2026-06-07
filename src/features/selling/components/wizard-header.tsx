import { StyleSheet, Text, View } from 'react-native';

import { Badge, Card, StepIndicator } from '@/components/ui/primitives';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { steps } from '@/features/selling/utils';

export function WizardHeader({ current }: { current: number }) {
  return (
    <Card style={styles.wizardCard}>
      <View style={styles.wizardHeader}>
        <View style={styles.wizardHeaderCopy}>
          <Badge label={`Paso ${current + 1} de ${steps.length}`} tone="purple" />
          <Text style={styles.wizardTitle}>{steps[current]}</Text>
        </View>
      </View>
      <StepIndicator steps={steps} current={current} />
    </Card>
  );
}

const styles = StyleSheet.create({
  wizardCard: { backgroundColor: colors.surface, gap: spacing.md },
  wizardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  wizardHeaderCopy: { flex: 1, gap: spacing.xs },
  wizardTitle: { color: colors.textStrong, fontSize: typography.headline, lineHeight: 28, fontFamily: fonts.black },
});
