import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Body, Card, EmptyState, ErrorState, Header, LoadingState, Screen, StatusState } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { chatService } from '@/services/api';
import { notificationIcon } from '@/features/account/utils';

export function NotificationCenterScreen() {
  const back = useSafeBack();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['notifications'], queryFn: chatService.notifications });
  const markRead = useMutation({
    mutationFn: () => chatService.markNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const hasUnreadNotifications = data?.some((notification) => !notification.read) ?? false;
  useEffect(() => {
    if (hasUnreadNotifications && !markRead.isPending) markRead.mutate();
  }, [hasUnreadNotifications, markRead]);
  return (
    <Screen>
      <Header title="Bot - Notificaciones" onBack={back} />
      <StatusState icon="hardware-chip-outline" title="Centro de avisos de SubastAR" message="Acá vas a encontrar avisos sobre compras, pujas, bienes, pagos y multas." tone="purple" />
      {isLoading ? <LoadingState /> : isError ? <ErrorState onRetry={() => refetch()} /> : data?.length ? data.map((notification) => (
        <Card key={notification.id} style={styles.notificationCard}>
          <View style={styles.notificationIconWrap}>
            <Ionicons name={notificationIcon(notification.type)} size={22} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <View style={styles.notificationTitleRow}>
              <Text style={styles.cardTitle}>{notification.title}</Text>
              {!notification.read ? <Badge label="Nuevo" tone="red" /> : null}
            </View>
            <Body muted>{notification.content}</Body>
            <Text style={styles.time}>{notification.timestamp}</Text>
          </View>
        </Card>
      )) : <EmptyState title="Sin notificaciones" message="Los avisos importantes aparecerán acá." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notificationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  notificationIconWrap: { position: 'relative', width: 42, height: 42, backgroundColor: colors.primarySoft, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  notificationTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: fonts.bold },
  time: { color: colors.textMuted, fontSize: typography.caption, fontFamily: fonts.regular },
});
