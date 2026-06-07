import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, ErrorState, Header, Input, LoadingState, Screen, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { chatService } from '@/services/api';
import { errorToUserMessage } from '@/services/errors';

export function ConversationScreen() {
  const back = useSafeBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['messages', id], queryFn: () => chatService.messages(id ?? 'bot') });
  const [message, setMessage] = useState('');
  const send = useMutation({
    mutationFn: () => chatService.send(id ?? 'bot', message),
    onSuccess: () => { setMessage(''); queryClient.invalidateQueries({ queryKey: ['messages', id] }); },
  });
  const isBotNotifications = id === 'bot' || id === 'notificaciones';
  const title = id === 'soporte' ? 'Soporte SubastAR' : id === 'poliza' ? 'Póliza de seguro' : isBotNotifications ? 'Bot - Notificaciones' : 'Asistente SubastAR';
  useEffect(() => {
    if (!isBotNotifications) return;
    chatService.markNotificationsRead()
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      })
      .catch(() => undefined);
  }, [isBotNotifications, queryClient]);
  return (
    <Screen>
      <Header title={title} onBack={back} />
      <StatusState
        icon={isBotNotifications ? 'hardware-chip-outline' : 'chatbubble-ellipses-outline'}
        title={isBotNotifications ? 'Centro de avisos de SubastAR' : 'Canal de consulta'}
        message={isBotNotifications ? 'Avisos sobre compras, pujas, bienes, pagos y multas.' : 'Usá este espacio para coordinar soporte, entregas o consultas de póliza.'}
        tone="purple"
      />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : data?.map((msg) => (
        <View key={msg.id} style={[styles.bubble, msg.author === 'user' && styles.userBubble]}>
          <Text style={[styles.message, msg.author === 'user' && styles.userMessage]}>{msg.text}</Text>
          <Text style={[styles.time, msg.author === 'user' && styles.userTime]}>{msg.time}</Text>
        </View>
      ))}
      <View style={styles.compose}>
        <Input placeholder="Escribí tu consulta..." value={message} onChangeText={setMessage} />
        <Button label={send.isPending ? 'Enviando...' : 'Enviar'} disabled={!message.trim() || send.isPending} onPress={() => send.mutate()} />
      </View>
      {send.isError ? <Body muted>{errorToUserMessage(send.error, 'No fue posible enviar el mensaje.')}</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '84%', alignSelf: 'flex-start', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt, gap: spacing.xs },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  message: { color: colors.text, fontSize: typography.body, fontFamily: fonts.regular },
  userMessage: { color: '#FFF' },
  time: { color: colors.textMuted, fontSize: typography.caption, fontFamily: fonts.regular },
  userTime: { color: '#DED9FF' },
  compose: { marginTop: spacing.lg, gap: spacing.sm },
});
