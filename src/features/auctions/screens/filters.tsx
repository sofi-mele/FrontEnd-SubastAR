import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Body, Button, Chip, Header, Screen, SectionLabel, Title } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';

export function AuctionFiltersScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const [status, setStatus] = useState('Todas');
  const [category, setCategory] = useState('Todas');
  const [currency, setCurrency] = useState('Todas');
  return (
    <Screen>
      <Header title="Filtros" onBack={back} />
      <Title>Filtrar subastas</Title>
      <Body muted>Seleccioná estado, categoría y moneda para encontrar subastas disponibles.</Body>
      <SectionLabel>Estado</SectionLabel>
      <View style={styles.chips}>{['Todas', 'En vivo', 'Próximas'].map((item) => <Chip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />)}</View>
      <SectionLabel>Categoría</SectionLabel>
      <View style={styles.chips}>{['Todas', 'Oro', 'Platino', 'Plata', 'Especial', 'Común', 'Otro'].map((item) => <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</View>
      <SectionLabel>Moneda</SectionLabel>
      <View style={styles.chips}>{['USD', 'ARS'].map((item) => <Chip key={item} label={item} active={currency === item} onPress={() => setCurrency(item)} />)}</View>
      <Button label="Aplicar filtros" onPress={() => router.replace({ pathname: '/(tabs)/auctions', params: { status, category, currency } })} />
      <Button label="Limpiar todo" variant="ghost" onPress={() => { setStatus('Todas'); setCategory('Todas'); setCurrency('Todas'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
