import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Body, Button, Card, Header, Input, Screen, SectionLabel, StepIndicator, UploadBox } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSession } from '@/providers/app-provider';
import { authService, profileService } from '@/services/api';
import { ApiError } from '@/services/http';
import { explainFileAccess, permissionDeniedMessage, requestMediaLibraryPermission } from '@/services/permissions';
import type { FileUpload } from '@/types/domain';
import { ErrorNotice } from '@/features/auth/components/error-notice';
import { registerSchema, registrationSteps } from '@/features/auth/schemas';
import { messageForAuthError } from '@/features/auth/utils';

function UploadAction({ label, done, error, onPress }: { label: string; done: boolean; error?: boolean; onPress: () => void }) {
  if (!done && error) {
    return (
      <Pressable onPress={onPress} style={styles.uploadBoxError}>
        <Ionicons name="camera-outline" size={24} color={colors.primary} />
        <Text style={styles.uploadBoxTitle}>{label}</Text>
        <Text style={styles.uploadBoxDesc}>Subir foto</Text>
      </Pressable>
    );
  }
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
  const [countryError, setCountryError] = useState('');
  const [dniError, setDniError] = useState('');
  const { control, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<z.infer<typeof registerSchema>>({
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
        setDniError('');
      }
    } catch {
      setApiError(permissionDeniedMessage('gallery'));
    }
  }
  const submit = async () => {
    const formValid = await trigger();

    let manualError = false;
    if (!countrySearch) {
      setCountryError('Seleccioná tu país de origen.');
      manualError = true;
    } else {
      setCountryError('');
    }
    if (!front || !backImage) {
      setDniError('Adjuntá frente y dorso del DNI.');
      manualError = true;
    } else {
      setDniError('');
    }

    if (!formValid || manualError) return;

    handleSubmit(async (values) => {
      try {
        setApiError('');
        await authService.register({ ...values, front: front!, back: backImage! });
        setRegistration({ email: values.email, returnTo });
        router.push('/registration-pending' as Href);
      } catch (error) {
        const apiErr = error as ApiError;
        if (apiErr?.status === 409 || apiErr?.message?.includes('ya está registrado')) {
          const isPending = apiErr?.message?.toLowerCase().includes('pendiente');
          if (isPending) {
            setRegistration({ email: values.email, returnTo });
            router.push('/registration-pending' as Href);
          } else {
            setApiError('Este email ya está registrado. Si ya tenés una cuenta, iniciá sesión.');
          }
        } else {
          setApiError(messageForAuthError(error, 'No pudimos completar el registro. Revisa tu conexion e intenta nuevamente.'));
        }
      }
    })();
  };
  return (
    <Screen>
      <Header title="Crear cuenta" subtitle="Paso 1 de 4" onBack={goBack} />
      <Card style={styles.formCard}>
        <StepIndicator steps={registrationSteps} current={0} />
        <Body muted>Usamos estos datos para validar tu identidad antes de habilitar pujas y operaciones de venta.</Body>
        <Controller control={control} name="name" render={({ field }) => <Input label="Nombre *" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />} />
        <Controller control={control} name="surname" render={({ field }) => <Input label="Apellido *" value={field.value} onChangeText={field.onChange} error={errors.surname?.message} />} />
        <Controller control={control} name="email" render={({ field }) => <Input label="Mail *" value={field.value} onChangeText={field.onChange} keyboardType="email-address" error={errors.email?.message} />} />
        <Controller control={control} name="address" render={({ field }) => <Input label="Domicilio legal *" value={field.value} onChangeText={field.onChange} error={errors.address?.message} />} />
        <Controller control={control} name="country" render={({ field }) => (
          <View>
            <Input
              label="País de origen *"
              value={countrySearch}
              onChangeText={(text) => { setCountrySearch(text); setShowCountryDropdown(true); }}
              onFocus={() => setShowCountryDropdown(true)}
              error={countryError || errors.country?.message}
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
                        setCountryError('');
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
          <UploadAction label="Frente" done={!!front} error={!!dniError} onPress={() => pick('front')} />
          <UploadAction label="Dorso" done={!!backImage} error={!!dniError} onPress={() => pick('back')} />
        </View>
        {dniError ? <Text style={styles.errorText}>{dniError}</Text> : null}
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
  uploadBoxError: { flex: 1, minHeight: 110, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.danger, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.md },
  uploadBoxTitle: { color: colors.textStrong, fontFamily: fonts.bold, fontSize: typography.bodySmall, textAlign: 'center' },
  uploadBoxDesc: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: typography.caption, textAlign: 'center' },
  errorText: { color: colors.danger, fontSize: typography.label, fontFamily: fonts.regular },
});
