import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Body, Button, Card, IconButton, Title } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import type { Country } from '@/types/domain';

export function CountryPickerModal({
  visible,
  countries,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  countries: Country[];
  value?: string;
  onClose: () => void;
  onSelect: (country: Country) => void;
}) {
  if (!visible) return null;
  return (
    <View style={styles.overlaySoft}>
      <Card style={styles.countryModal}>
        <View style={styles.countryModalHeader}>
          <View style={styles.countryModalTitleCopy}>
            <Title>Seleccioná tu país</Title>
            <Body muted>Elegí un país de origen desde la lista disponible.</Body>
          </View>
          <IconButton icon="close-outline" accessibilityLabel="Cerrar selector de países" onPress={onClose} />
        </View>
        <ScrollView style={styles.countryList} contentContainerStyle={styles.countryListContent} showsVerticalScrollIndicator={false}>
          {countries.map((country) => {
            const active = value === country.name;
            return (
              <Pressable key={country.id} onPress={() => onSelect(country)} style={[styles.countryRow, active && styles.countryRowActive]}>
                <View style={styles.countryRowCopy}>
                  <Text style={styles.countryRowTitle}>{country.name}</Text>
                  <Body muted>{country.capital ?? 'Capital no informada'}</Body>
                  <Body muted>{country.languages ?? 'Idioma no informado'}</Body>
                </View>
                <View style={styles.countryRowMeta}>
                  <Badge label={country.code} tone={active ? 'purple' : 'dark'} />
                  {active ? <Ionicons name="checkmark-circle" size={20} color={colors.success} /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <Button label="Cerrar" variant="ghost" onPress={onClose} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlaySoft: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(17,17,23,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl, zIndex: 20 },
  countryModal: { width: '100%', maxHeight: '82%', gap: spacing.md },
  countryModalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  countryModalTitleCopy: { flex: 1, gap: spacing.xs },
  countryList: { maxHeight: 420 },
  countryListContent: { gap: spacing.sm, paddingBottom: spacing.sm },
  countryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  countryRowActive: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  countryRowCopy: { flex: 1, gap: 2 },
  countryRowTitle: { color: colors.textStrong, fontSize: typography.body, fontFamily: fonts.bold },
  countryRowMeta: { alignItems: 'flex-end', gap: spacing.xs },
});
