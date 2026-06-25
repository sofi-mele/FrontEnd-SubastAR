import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Header, Input, LoadingState, Screen, SectionHeader, SecurityNote, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { collectionAccountService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';

export function CollectionAccountsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [showForm, setShowForm] = useState(false);
  const [bank, setBank] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['collection-accounts'],
    queryFn: collectionAccountService.list,
  });

  const addAccount = useMutation({
    mutationFn: () => collectionAccountService.create({ bankName: bank, identifier, country, currency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-accounts'] });
      router.replace((returnTo ?? '/profile/assets') as Href);
    },
  });

  if (isLoading) return <Screen><LoadingState /></Screen>;

  return (
    <Screen>
      <Header title="Cuenta de cobro" onBack={back} />
      <StatusState
        icon="cash-outline"
        title="¿A qué cuenta enviamos el dinero?"
        message="Registrá la cuenta bancaria donde querés recibir el importe cuando se concrete la venta de tu bien."
        tone="purple"
      />
      {accounts?.length ? (
        <>
          <SectionHeader title="Cuentas declaradas" subtitle="Ya tenés una cuenta registrada" />
          {accounts.map((account) => (
            <Card key={account.id} style={styles.accountCard}>
              <View style={styles.row}>
                <View style={styles.copy}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                  <Body muted>{account.identifier}</Body>
                  <Body muted>{account.country} · {account.currency}</Body>
                </View>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              </View>
            </Card>
          ))}
          <Button label="Continuar" onPress={() => router.replace((returnTo ?? '/profile/assets') as Href)} />
          {!showForm ? (
            <Button label="Agregar otra cuenta" variant="ghost" icon="add-outline" onPress={() => setShowForm(true)} />
          ) : null}
        </>
      ) : null}
      {(!accounts?.length || showForm) ? (
        <Card style={styles.formCard}>
          <SectionHeader title="Nueva cuenta de cobro" subtitle="Completá los datos bancarios" />
          <Input label="Nombre del banco" value={bank} onChangeText={setBank} placeholder="Ej: Banco Nación" />
          <Input label="CBU / IBAN" value={identifier} onChangeText={setIdentifier} placeholder="Ej: 0000000000000000000000" />
          <Input label="País del banco" value={country} onChangeText={setCountry} placeholder="Ej: Argentina" />
          <Body muted>Moneda de la cuenta</Body>
          <View style={styles.currencyToggle}>
            {(['ARS', 'USD'] as const).map((c) => (
              <Pressable key={c} onPress={() => setCurrency(c)} style={[styles.currencyOption, currency === c && styles.currencyOptionActive]}>
                <Text style={[styles.currencyOptionText, currency === c && styles.currencyOptionTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <SecurityNote text="Esta cuenta recibirá el pago cuando la empresa cierre la venta del bien." />
          <Button
            label={addAccount.isPending ? 'Guardando...' : 'Guardar cuenta'}
            disabled={!bank.trim() || !identifier.trim() || addAccount.isPending}
            onPress={() => addAccount.mutate()}
          />
          {showForm ? <Button label="Cancelar" variant="ghost" onPress={() => setShowForm(false)} /> : null}
          {addAccount.isError ? <Body muted>{errorToUserMessage(addAccount.error, 'No fue posible guardar la cuenta.')}</Body> : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  accountCard: { gap: spacing.sm },
  formCard: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1, gap: 2 },
  bankName: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
  currencyToggle: { flexDirection: 'row', gap: spacing.sm },
  currencyOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  currencyOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  currencyOptionText: { color: colors.textMuted, fontFamily: fonts.medium },
  currencyOptionTextActive: { color: colors.primary, fontFamily: fonts.bold },
});
