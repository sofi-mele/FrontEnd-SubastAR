import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Body, Button, Card, ErrorState, Header, Input, LoadingState, Screen, SelectInput } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { profileService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { CountryPickerModal } from '@/features/account/components/country-picker-modal';

export function EditProfileScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['profile'], queryFn: profileService.me });
  const { data: countries = [], isLoading: loadingCountries, isError: countriesError } = useQuery({ queryKey: ['countries'], queryFn: profileService.countries });
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const save = useMutation({
    mutationFn: () => profileService.update({ address: address || data?.address, country: country || data?.country }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); router.replace('/profile'); },
  });
  const selectedCountry = useMemo(() => countries.find((item) => item.name === (country || data?.country)), [countries, country, data?.country]);
  if (isLoading) return <Screen><LoadingState /></Screen>;
  if (isError || !data) return <Screen><Header title="Datos personales" onBack={back} /><ErrorState onRetry={() => refetch()} /></Screen>;
  return (
    <Screen>
      <Header title="Datos personales" onBack={back} />
      <Card style={styles.itemCard}>
        <Input label="Nombre y apellido" value={data.name} editable={false} />
        <Input label="Email" value={data.email} editable={false} />
        <Input label="DNI" value={data.dni ?? ''} editable={false} />
        <Input label="Categoría" value={data.category ?? ''} editable={false} />
      </Card>
      <Input label="Dirección" value={address || (data.address ?? '')} onChangeText={setAddress} />
      <SelectInput
        label="País de origen"
        value={selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : country || data.country}
        placeholder={loadingCountries ? 'Cargando países...' : 'Seleccionar país'}
        helperText={countriesError ? 'No se pudieron cargar los países. Podés reintentar más tarde.' : 'Mostramos el listado recibido por el servidor.'}
        onPress={() => setCountryPickerVisible(true)}
      />
      <CountryPickerModal
        visible={countryPickerVisible}
        countries={countries}
        value={country || data.country}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={(selected) => {
          setCountry(selected.name);
          setCountryPickerVisible(false);
        }}
      />
      <Button label={save.isPending ? 'Guardando...' : 'Guardar cambios'} disabled={save.isPending} onPress={() => save.mutate()} />
      {save.isError ? <Body muted>{errorToUserMessage(save.error, 'No fue posible guardar.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
});
