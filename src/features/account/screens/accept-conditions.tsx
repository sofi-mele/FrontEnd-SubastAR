import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Divider, ErrorState, Header, Input, LoadingState, Screen, SectionHeader, SecurityNote, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { assetService, collectionAccountService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';

export function AcceptConditionsScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bank, setBank] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');

  const { data: accounts, isLoading, isError, refetch } = useQuery({
    queryKey: ['collection-accounts'],
    queryFn: collectionAccountService.list,
  });

  useEffect(() => {
    if (isLoading || !accounts) return;
    if (accounts.length === 0) setShowAddForm(true);
    else if (!selectedAccountId) setSelectedAccountId(accounts[0].id);
  }, [isLoading, accounts, selectedAccountId]);

  const addAccount = useMutation({
    mutationFn: () => collectionAccountService.create({ bankName: bank, identifier, country, currency }),
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: ['collection-accounts'] });
      setSelectedAccountId(newAccount.id);
      setShowAddForm(false);
      setBank('');
      setIdentifier('');
    },
  });

  const accept = useMutation({
    mutationFn: () => assetService.acceptConditions(id ?? '', true, selectedAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSuccess(true);
    },
  });

  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError) return <Screen><Header title="Cuenta de cobro" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;

  if (success) return (
    <Screen style={styles.successScreen}>
      <Ionicons name="checkmark-circle" size={64} color={colors.success} />
      <Text style={styles.successTitle}>Condiciones aceptadas</Text>
      <Body muted>Registramos tu cuenta de cobro y tu aceptación.</Body>
      <Button label="Ver mis bienes" onPress={() => router.replace('/profile/assets' as Href)} />
    </Screen>
  );

  return (
    <Screen>
      <Header title="Cuenta de cobro" onBack={back} />
      <StatusState
        icon="cash-outline"
        title="¿A qué cuenta enviamos el dinero?"
        message="Seleccioná la cuenta donde querés recibir el importe cuando se concrete la venta."
        tone="purple"
      />
      {accounts?.length ? <>
        <SectionHeader title="Cuentas declaradas" subtitle="Elegí una para este bien" />
        {accounts.map((account) => (
          <Pressable key={account.id} onPress={() => { setSelectedAccountId(account.id); setShowAddForm(false); }}>
            <Card style={[styles.itemCard, selectedAccountId === account.id && styles.accountCardSelected]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderCopy}>
                  <Text style={styles.cardTitle}>{account.bankName}</Text>
                  <Body muted>{account.identifier}</Body>
                  <Body muted>{account.country} · {account.currency}</Body>
                </View>
                <Ionicons
                  name={selectedAccountId === account.id ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={selectedAccountId === account.id ? colors.success : colors.textMuted}
                />
              </View>
            </Card>
          </Pressable>
        ))}
      </> : null}
      {!showAddForm ? (
        <Button label="Agregar cuenta nueva" variant="secondary" icon="add-outline" onPress={() => setShowAddForm(true)} />
      ) : (
        <Card style={styles.itemCard}>
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
          {accounts?.length ? <Button label="Cancelar" variant="ghost" onPress={() => setShowAddForm(false)} /> : null}
          {addAccount.isError ? <Body muted>{errorToUserMessage(addAccount.error, 'No fue posible guardar la cuenta.')}</Body> : null}
        </Card>
      )}
      {!showAddForm ? <>
        <Divider />
        <Button
          label={accept.isPending ? 'Aceptando...' : 'Confirmar y aceptar condiciones'}
          disabled={!selectedAccountId || accept.isPending}
          onPress={() => accept.mutate()}
        />
        {accept.isError ? <Body muted>{errorToUserMessage(accept.error, 'No fue posible aceptar las condiciones.')}</Body> : null}
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  successScreen: { alignItems: 'center', paddingTop: 70 },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  itemCard: { gap: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  cardHeaderCopy: { flex: 1, gap: 2 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
  accountCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  currencyToggle: { flexDirection: 'row', gap: spacing.sm },
  currencyOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  currencyOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  currencyOptionText: { color: colors.textMuted, fontFamily: fonts.medium },
  currencyOptionTextActive: { color: colors.primary, fontFamily: fonts.bold },
});
