import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';
import { chatService } from '@/services/api';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const { data: notificationsSummary } = useQuery({
    queryKey: ['notifications-summary'],
    queryFn: chatService.notificationsSummary,
    enabled: !!session,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.conversations,
    enabled: !!session,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
  const hasUnreadBotNotifications = notificationsSummary?.hasUnread
    || chats?.some((chat) => (chat.id === 'bot' || chat.id === 'notificaciones') && chat.unread > 0);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.medium },
        tabBarItemStyle: { paddingTop: 6, paddingBottom: 4 },
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: Math.max(spacing.sm, insets.bottom * 0.5),
          paddingTop: spacing.sm,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="auctions" options={{ title: 'Subastas', tabBarIcon: ({ color, size }) => <Ionicons name="hammer-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <View><Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />{hasUnreadBotNotifications ? <View style={styles.tabUnreadDot} /> : null}</View> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabUnreadDot: { position: 'absolute', right: -2, top: -2, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.surface },
});
