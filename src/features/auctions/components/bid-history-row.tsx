import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/primitives';
import { formatCurrency } from '@/components/domain/cards';
import { colors, fonts, spacing, typography } from '@/constants/theme';

export function BidHistoryRow({ bidder, amount, timestamp, leader }: { bidder: string; amount: number; timestamp: string; leader?: boolean }) {
  return (
    <View style={styles.bidRow}>
      <View style={styles.bidRowCopy}>
        <Text style={styles.infoValue}>{bidder}</Text>
        <Text style={styles.meta}>{timestamp}</Text>
      </View>
      <View style={styles.bidRowAmount}>
        {leader ? <Badge label="Líder" tone="green" /> : null}
        <Text style={styles.price}>{formatCurrency(amount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bidRow: { borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  bidRowCopy: { flex: 1, gap: 2 },
  bidRowAmount: { alignItems: 'flex-end', gap: spacing.xs },
  meta: { color: colors.textMuted, fontSize: typography.caption, fontFamily: fonts.regular },
  infoValue: { color: colors.text, fontSize: typography.body, fontFamily: fonts.medium },
  price: { fontSize: typography.body, color: colors.text, fontFamily: fonts.black },
});
