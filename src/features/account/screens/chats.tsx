import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Body, Card, EmptyState, ErrorState, Header, LoadingState, Screen } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';
import { chatService } from '@/services/api';
import { chatIcon } from '@/features/account/utils';
import { GuestNotice } from '@/features/account/components/guest-notice';

export function ChatsScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['chats'], queryFn: chatService.conversations, enabled: !!session });
  const { data: notificationsSummary } = useQuery({ queryKey: ['notifications-summary'], queryFn: chatService.notificationsSummary, enabled: !!session });
  const notificationChats = data?.filter((chat) => chat.id === 'bot' || chat.id === 'notificaciones') ?? [];
  const regularChats = data?.filter((chat) => chat.id !== 'bot' && chat.id !== 'notificaciones') ?? [];
  const botNotifications = {
    id: 'bot',
    name: 'Bot - Notificaciones',
    lastMessage: notificationChats.find((chat) => chat.id === 'notificaciones')?.lastMessage
      || notificationChats.find((chat) => chat.id === 'bot')?.lastMessage
      || 'Avisos sobre compras, pujas, bienes, pagos y multas',
    unread: Math.max(
      notificationChats.reduce((total, chat) => total + chat.unread, 0),
      notificationsSummary?.totalUnread ?? 0,
    ),
  };
  const visibleChats = data ? [botNotifications, ...regularChats] : [];
  return (
    <Screen>
      <Header title="Chats" />
      {!session ? <GuestNotice /> : isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : visibleChats.length ? visibleChats.map((chat) => {
        const isBotNotifications = chat.id === 'bot';
        return (
          <Pressable key={chat.id} onPress={() => router.push(isBotNotifications ? '/chat/notificaciones' : `/chat/${chat.id}`)}>
            <Card style={[styles.chatRow, isBotNotifications && styles.botNotificationsRow]}>
              <View style={[styles.chatIcon, isBotNotifications && styles.botNotificationsIcon]}>
                <Ionicons name={isBotNotifications ? 'notifications-outline' : chatIcon(chat.id)} size={20} color={colors.primary} />
                {isBotNotifications && chat.unread > 0 ? <View style={styles.notificationDot} /> : null}
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{chat.name}</Text>
                <Body muted>{chat.lastMessage}</Body>
              </View>
              {chat.unread ? <Badge label={String(chat.unread)} tone="red" /> : null}
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Card>
          </Pressable>
        );
      }) : <EmptyState title="Sin conversaciones" message="Tus consultas aparecerán acá." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chatRow: { flexDirection: 'row', alignItems: 'center' },
  chatIcon: { width: 42, height: 42, backgroundColor: colors.primarySoft, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  botNotificationsRow: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  botNotificationsIcon: { borderWidth: 1, borderColor: colors.primaryBorder },
  notificationDot: { position: 'absolute', right: 1, top: 1, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.surface },
  flex: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
});
