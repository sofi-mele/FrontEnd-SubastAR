import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Body, Button, Card, Header, Input, Screen, SectionLabel, StepIndicator, UploadBox } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { authService, profileService } from '@/services/api';
import { ApiError } from '@/services/http';
import { explainFileAccess, permissionDeniedMessage, requestMediaLibraryPermission } from '@/services/permissions';
import type { FileUpload } from '@/types/domain';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { registerSchema, registrationSteps } from '@/features/auth/schemas';
import { messageForAuthError } from '@/features/auth/utils';

function UploadAction({ label, done, onPress }: { label: string; done: boolean; onPress: () => void }) {
  return <UploadBox label={label} description={done ? 'Imagen cargada' : 'Subir foto'} done={done} icon="camera-outline" onPress={onPress} />;
}

export function RegisterScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { setRegistration } = useSession();
  const [front, setFront] = useState<FileUpload>();
  const [backImage, setBackImage] = useState<FileUpload>();
  const [apiError, setApiError] = useState('');
  const [countries, setCountries] = useState<{id: string, name: string}[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', surname: '', email: '', address: '', country: 'Argentina' },
  });
  useEffect(() => {
    profileService.countries().then(setCountries).catch(() => {});
  }, []);
  async function pick(side: 'front' | 'back') {
    try {
      setApiError('');
      explainFileAccess('photo');
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        setApiError(permissionDeniedMessage('gallery'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled) {
        const asset = result.assets[0];
        const upload: FileUpload = {
          uri: asset.uri,
          name: asset.fileName ?? `dni-${side}-${Date.now()}.jpg`,
          type: asset.mimeType ?? 'image/jpeg',
          file: asset.file,
        };
        if (side === 'front') setFront(upload);
        else setBackImage(upload);
      }
    } catch {
      setApiError(permissionDeniedMessage('gallery'));
    }
  }
  const submit = handleSubmit(async (values) => {
    if (!front || !backImage) {
      setApiError('Adjunta frente y dorso del DNI.');
      return;
    }
    try {
      setApiError('');
      await authService.register({ ...values, front, back: backImage });
      setRegistration({ email: values.email, returnTo });
      router.push('/registration-pending' as Href);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 || (error as ApiError)?.message?.includes('ya está registrado')) {
        setRegistration({ email: values.email, returnTo });
        router.push('/registration-pending' as Href);
      } else {
        setApiError(messageForAuthError(error, 'No pudimos completar el registro. Revisa tu conexion e intenta nuevamente.'));
      }
    }
  });
  return (
    <Screen>
      <Header title="Crear cuenta" subtitle="Paso 1 de 4" onBack={goBack} />
      <Card style={styles.formCard}>
        <StepIndicator steps={registrationSteps} current={0} />
        <Body muted>Usamos estos datos para validar tu identidad antes de habilitar pujas y operaciones de venta.</Body>
        <Controller control={control} name="name" render={({ field }) => <Input label="Nombre" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />} />
        <Controller control={control} name="surname" render={({ field }) => <Input label="Apellido" value={field.value} onChangeText={field.onChange} error={errors.surname?.message} />} />
        <Controller control={control} name="email" render={({ field }) => <Input label="Mail" value={field.value} onChangeText={field.onChange} keyboardType="email-address" error={errors.email?.message} />} />
        <Controller control={control} name="address" render={({ field }) => <Input label="Domicilio legal" value={field.value} onChangeText={field.onChange} error={errors.address?.message} />} />
        <Controller control={control} name="country" render={({ field }) => (
          <View>
            <Input
              label="País de origen"
              value={countrySearch}
              onChangeText={(text) => { setCountrySearch(text); setShowCountryDropdown(true); }}
              onFocus={() => setShowCountryDropdown(true)}
              error={errors.country?.message}
            />
            {showCountryDropdown && (
              <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, maxHeight: 200, overflow: 'scroll' }}>
                {countries
                  .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                  .map(c => (
                    <Pressable
                      key={c.id}
                      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                      onPress={() => {
                        field.onChange(c.name);
                        setCountrySearch(c.name);
                        setShowCountryDropdown(false);
                      }}
                    >
                      <Text>{c.name}</Text>
                    </Pressable>
                  ))
                }
              </View>
            )}
          </View>
        )} />
        <SectionLabel>Documento de identidad</SectionLabel>
        <Body muted>Necesitamos abrir tu galeria para adjuntar frente y dorso del DNI. En computadora se abrira el selector de archivos.</Body>
        <View style={styles.uploadRow}>
          <UploadAction label="Frente" done={!!front} onPress={() => pick('front')} />
          <UploadAction label="Dorso" done={!!backImage} onPress={() => pick('back')} />
        </View>
        {apiError ? <ErrorNotice message={apiError} /> : null}
        <Button label={isSubmitting ? 'Enviando...' : 'Crear cuenta'} disabled={isSubmitting} onPress={submit} />
        <Button label="¿Ya tienes una cuenta? Iniciá sesión" variant="ghost" onPress={() => router.push({ pathname: '/login', params: { returnTo } })} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  uploadRow: { flexDirection: 'row', gap: spacing.md },
});
