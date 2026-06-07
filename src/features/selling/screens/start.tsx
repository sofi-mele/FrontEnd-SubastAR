import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DateInput } from '@/components/ui/date-input';
import { Badge, Body, Button, Card, Divider, Header, IconButton, Input, Screen, SectionHeader, SecurityNote } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { CategoryCard } from '@/features/selling/components/category-card';
import { WizardHeader } from '@/features/selling/components/wizard-header';
import { categoryOptions, countWords, limitWords, MAX_WORDS } from '@/features/selling/utils';

export function SellStartScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('1');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('');
  const [history, setHistory] = useState('');
  const [additional, setAdditional] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [suggestedCurrency, setSuggestedCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [existingCode, setExistingCode] = useState('');
  const save = useMutation({
    mutationFn: async () => {
      const code = existingCode || (await assetService.start(category)).code;
      if (!existingCode) setExistingCode(code);
      const numericPrice = suggestedPrice ? Number(suggestedPrice) : undefined;
      await assetService.saveDetails(code, {
        type: category, name, technicalDescription: description, amount: Number(amount), artistDesigner: artist || undefined,
        originPeriod: period || undefined, creationDate: date || undefined, history: history || undefined,
        additionalInformation: additional || undefined,
        suggestedBasePrice: numericPrice && numericPrice > 0 ? numericPrice : undefined,
        suggestedBasePriceCurrency: numericPrice && numericPrice > 0 ? suggestedCurrency : undefined,
      });
      return code;
    },
    onSuccess: (code) => router.push({ pathname: '/sell/photos', params: { code, name, type: category, amount } }),
  });
  return (
    <Screen>
      <Header title="Subir bien" onBack={back} right={<IconButton icon="help-circle-outline" accessibilityLabel="Ayuda" tone="primary" />} />
      <Card style={styles.heroCard}>
        <Badge label="Carga formal" tone="purple" />
        <Body muted>Completá la información con precisión para que la empresa pueda revisar documentación, fotos y condiciones de subasta.</Body>
        <SecurityNote text="La solicitud quedará pendiente de revisión formal antes de ser publicada en SubastAR." />
      </Card>
      <SectionHeader title="Categoría del bien" subtitle="Elegí el tipo de pieza antes de continuar" />
      <View style={styles.categories}>
        {categoryOptions.map((item) => <CategoryCard key={item.value} label={item.label} description={item.description} icon={item.icon} active={item.value === category} onPress={() => setCategory(item.value)} />)}
      </View>
      {category ? <>
        <WizardHeader current={0} />
        <SectionHeader title="Información operativa" subtitle="Completá los campos principales para iniciar la solicitud" />
        <Input label="Nombre del bien *" placeholder="Ej. Retrato en óleo" value={name} onChangeText={setName} />
        <View>
          <Input label="Descripción técnica *" placeholder="Materiales, medidas y estado" multiline value={description} onChangeText={(t) => setDescription(limitWords(t))} />
          <Text style={styles.wordCount}>{countWords(description)}/{MAX_WORDS} palabras</Text>
        </View>
        <Input label="Cantidad de elementos *" keyboardType="number-pad" value={amount} onChangeText={setAmount} />
        <Input label="Precio base sugerido (opcional)" keyboardType="number-pad" value={suggestedPrice} onChangeText={setSuggestedPrice} placeholder="Ej. 50000" />
        <Body muted>Moneda del precio sugerido</Body>
        <View style={styles.currencyToggle}>
          {(['ARS', 'USD'] as const).map((c) => (
            <Pressable key={c} onPress={() => setSuggestedCurrency(c)} style={[styles.currencyOption, suggestedCurrency === c && styles.currencyOptionActive]}>
              <Text style={[styles.currencyOptionText, suggestedCurrency === c && styles.currencyOptionTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        {category === 'obra_arte' ? <>
          <Input label="Artista" value={artist} onChangeText={setArtist} />
          <DateInput label="Fecha de creación (AAAA-MM-DD)" value={date} onChangeText={setDate} />
          <Input label="Época u origen" value={period} onChangeText={setPeriod} />
          <View>
            <Input label="Historia y procedencia" multiline value={history} onChangeText={(t) => setHistory(limitWords(t))} />
            <Text style={styles.wordCount}>{countWords(history)}/{MAX_WORDS} palabras</Text>
          </View>
        </> : null}
        {category === 'objeto_disenador' ? <>
          <Input label="Diseñador *" value={artist} onChangeText={setArtist} />
          <DateInput label="Fecha de creación (AAAA-MM-DD) *" value={date} onChangeText={setDate} />
        </> : null}
        {category === 'otro' ? <View>
          <Input label="Información adicional *" value={additional} onChangeText={(t) => setAdditional(limitWords(t))} />
          <Text style={styles.wordCount}>{countWords(additional)}/{MAX_WORDS} palabras</Text>
        </View> : null}
        <Divider />
        <Button label={save.isPending ? 'Guardando...' : 'Continuar con fotografías'} disabled={!name || !description || Number(amount) <= 0 || save.isPending} onPress={() => save.mutate()} />
        {save.isError ? <Body muted>{errorToUserMessage(save.error, 'No fue posible iniciar la solicitud.')}</Body> : null}
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryBorder, gap: spacing.sm },
  categories: { gap: spacing.sm },
  wordCount: { color: colors.textMuted, fontSize: typography.caption, fontFamily: fonts.regular, textAlign: 'right', marginTop: 2 },
  currencyToggle: { flexDirection: 'row', gap: spacing.sm },
  currencyOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  currencyOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  currencyOptionText: { color: colors.textMuted, fontFamily: fonts.medium },
  currencyOptionTextActive: { color: colors.primary, fontFamily: fonts.bold },
});
