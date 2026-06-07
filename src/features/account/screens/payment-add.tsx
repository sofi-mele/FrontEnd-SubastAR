import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Badge, Body, Button, Card, Header, Input, Screen, StatusState, Title, UploadBox } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { paymentService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';
import { explainFileAccess, permissionDeniedMessage, requestMediaLibraryPermission } from '@/services/permissions';
import type { FileUpload, PaymentMethodKind } from '@/types/domain';
import {
  validateBank, validateCbu, validateAmount, validateChequeNumber,
  validateCardNumber, validateExpiry, validateCvv, validateHolder, validateDni,
  formatCardNumber, formatExpiry,
} from '@/features/account/utils';

export function PaymentAddScreen() {
  const router = useRouter();
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { type, onboarding, returnTo } = useLocalSearchParams<{ type?: PaymentMethodKind; onboarding?: string; returnTo?: string }>();
  const kind = type ?? 'tarjeta_credito';
  const [bank, setBank] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [security, setSecurity] = useState('');
  const [dni, setDni] = useState('');
  const [photo, setPhoto] = useState<FileUpload>();
  const [pickerError, setPickerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setError(field: string, msg: string) {
    setErrors(prev => ({ ...prev, [field]: msg }));
  }

  function handleCardNumber(raw: string) {
    const formatted = formatCardNumber(raw);
    setIdentifier(formatted);
    if (errors.identifier) setError('identifier', validateCardNumber(formatted));
  }

  function handleExpiry(raw: string) {
    const formatted = formatExpiry(raw, expiry);
    setExpiry(formatted);
    if (errors.expiry) setError('expiry', validateExpiry(formatted));
  }

  function handleCvv(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setSecurity(digits);
    if (errors.security) setError('security', validateCvv(digits));
  }

  function handleHolder(raw: string) {
    setHolder(raw);
    if (errors.holder) setError('holder', validateHolder(raw));
  }

  function handleDni(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    setDni(digits);
    if (errors.dni) setError('dni', validateDni(digits));
  }

  const save = useMutation({
    mutationFn: () => paymentService.create({
      type: kind, bankName: bank, bankCountry: country, cbuIban: kind === 'cuenta_bancaria' ? identifier : undefined,
      reservedFunds: amount, cardNumber: kind === 'tarjeta_credito' ? identifier.replace(/\s/g, '') : undefined, holder, expiry,
      securityCode: security, holderDni: dni, issuerBank: bank, certifiedAmount: amount,
      chequeNumber: kind === 'cheque_certificado' ? identifier : undefined, chequePhoto: photo,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.replace({ pathname: '/payment-success', params: { returnTo, type: kind, onboarding: onboarding ?? 'false' } });
    },
  });

  async function pickCheque() {
    try {
      setPickerError('');
      explainFileAccess('photo');
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        setPickerError(permissionDeniedMessage('gallery'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled) {
        const asset = result.assets[0];
        setPhoto({ uri: asset.uri, name: asset.fileName ?? `cheque-${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg', file: asset.file });
      }
    } catch {
      setPickerError(permissionDeniedMessage('gallery'));
    }
  }

  const label = kind === 'tarjeta_credito' ? 'Tarjeta de crédito' : kind === 'cuenta_bancaria' ? 'Cuenta bancaria' : 'Cheque certificado';
  const submitLabel = kind === 'cuenta_bancaria' ? 'Agregar cuenta' : kind === 'tarjeta_credito' ? 'Agregar tarjeta' : 'Agregar cheque';
  const cardValid = !validateCardNumber(identifier) && !validateExpiry(expiry) && !validateCvv(security) && !validateHolder(holder) && !validateDni(dni);
  const cbuValid = !validateBank(bank) && !!country && !validateCbu(identifier) && !validateAmount(amount);
  const chequeValid = !validateBank(bank) && !validateChequeNumber(identifier) && !validateAmount(amount) && !!photo;
  const canSave = kind === 'tarjeta_credito' ? cardValid : kind === 'cuenta_bancaria' ? cbuValid : chequeValid;

  return (
    <Screen>
      <Header title={label} onBack={back} />
      <Card style={styles.itemCard}>
        <Badge label="Alta de medio" tone="purple" />
        <Title>Agregar {label.toLowerCase()}</Title>
        <Body muted>La empresa puede revisar los datos antes de habilitarlo para pujas y pagos pendientes.</Body>
      </Card>
      <StatusState icon="lock-closed-outline" title="Validación del medio" message="La empresa puede revisar los datos antes de habilitarlo para pujas y pagos pendientes." tone="yellow" />
      {onboarding === 'true' ? <Button label="Omitir por ahora" variant="ghost" onPress={() => router.replace((returnTo || '/(tabs)') as Href)} /> : null}
      {kind !== 'tarjeta_credito' ? (
        <Input
          label="Nombre del banco" value={bank} placeholder="Ej: Banco Nación"
          onChangeText={v => { setBank(v); if (errors.bank) setError('bank', validateBank(v)); }}
          onBlur={() => setError('bank', validateBank(bank))}
          error={errors.bank}
        />
      ) : null}
      {kind === 'cuenta_bancaria' ? <Input label="País del banco" value={country} placeholder="Ej: Argentina" onChangeText={setCountry} /> : null}
      {kind === 'tarjeta_credito' ? <>
        <Input
          label="Número de tarjeta" value={identifier} keyboardType="number-pad"
          placeholder="1234 5678 9012 3456"
          onChangeText={handleCardNumber}
          onBlur={() => setError('identifier', validateCardNumber(identifier))}
          error={errors.identifier} maxLength={23}
        />
        <Input
          label="Titular (como figura en la tarjeta)" value={holder} autoCapitalize="words"
          placeholder="Nombre Apellido"
          onChangeText={handleHolder}
          onBlur={() => setError('holder', validateHolder(holder))}
          error={errors.holder}
        />
        <Input
          label="DNI del titular" value={dni} keyboardType="number-pad"
          placeholder="12345678"
          onChangeText={handleDni}
          onBlur={() => setError('dni', validateDni(dni))}
          error={errors.dni} maxLength={8}
        />
        <Input
          label="Vencimiento" value={expiry} keyboardType="number-pad"
          placeholder="MM/AA"
          onChangeText={handleExpiry}
          onBlur={() => setError('expiry', validateExpiry(expiry))}
          error={errors.expiry} maxLength={5}
        />
        <Input
          label="Código de seguridad" secureTextEntry value={security} keyboardType="number-pad"
          placeholder="3 o 4 dígitos (CVV/CVC)"
          onChangeText={handleCvv}
          onBlur={() => setError('security', validateCvv(security))}
          error={errors.security} maxLength={4}
        />
      </> : kind === 'cuenta_bancaria' ? <>
        <Input
          label="Fondos reservados para subasta" value={amount} keyboardType="number-pad"
          placeholder="Ej: 50000"
          onChangeText={v => { setAmount(v); if (errors.amount) setError('amount', validateAmount(v)); }}
          onBlur={() => setError('amount', validateAmount(amount))}
          error={errors.amount}
        />
        <Input
          label="CBU/IBAN/Número de cuenta" value={identifier}
          placeholder="22 dígitos para CBU"
          onChangeText={v => { setIdentifier(v); if (errors.identifier) setError('identifier', validateCbu(v)); }}
          onBlur={() => setError('identifier', validateCbu(identifier))}
          error={errors.identifier}
        />
      </> : <>
        <Input
          label="Número de cheque" value={identifier} keyboardType="number-pad"
          placeholder="Ej: 00123456"
          onChangeText={v => { setIdentifier(v); if (errors.identifier) setError('identifier', validateChequeNumber(v)); }}
          onBlur={() => setError('identifier', validateChequeNumber(identifier))}
          error={errors.identifier}
        />
        <Input
          label="Monto certificado" value={amount} keyboardType="number-pad"
          placeholder="Ej: 100000"
          onChangeText={v => { setAmount(v); if (errors.amount) setError('amount', validateAmount(v)); }}
          onBlur={() => setError('amount', validateAmount(amount))}
          error={errors.amount}
        />
      </>}
      {kind === 'cheque_certificado' ? <>
        <Body muted>Necesitamos abrir tu galeria para adjuntar la imagen del cheque. En computadora se abrira el selector de archivos.</Body>
        <UploadBox label={photo ? 'Foto cargada' : 'Subir foto del cheque'} description="Imagen del respaldo certificado" done={!!photo} icon="camera-outline" onPress={pickCheque} />
        {pickerError ? <StatusState icon="alert-circle-outline" title="No pudimos acceder a la foto" message={pickerError} tone="red" /> : null}
      </> : null}
      <Button label={save.isPending ? 'Guardando...' : submitLabel} disabled={!canSave || save.isPending} onPress={() => save.mutate()} />
      {save.isError ? <Body muted>{errorToUserMessage(save.error, 'No fue posible agregar el medio.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemCard: { gap: spacing.md },
});
