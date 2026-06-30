import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { PERSISTENT_NAV_HIDDEN_PATHS as HIDDEN_PATHS } from '@/hooks/use-nav-height';
import { useSession } from '@/providers/app-provider';
import { chatService } from '@/services/api';

const TABS = [
  { key: 'inicio',    label: 'Inicio',    icon: 'home-outline'                  as const, href: '/(tabs)'          },
  { key: 'subastas',  label: 'Subastas',  icon: 'hammer-outline'                as const, href: '/(tabs)/auctions'  },
  { key: 'chat',      label: 'Chat',      icon: 'chatbubble-ellipses-outline'   as const, href: '/(tabs)/chat'      },
  { key: 'perfil',    label: 'Perfil',    icon: 'person-outline'                as const, href: '/(tabs)/profile'   },
];

function resolveActiveTab(pathname: string): string {
  if (pathname.startsWith('/auction') || pathname.startsWith('/live') || pathname.startsWith('/lot') || pathname.startsWith('/result')) return 'subastas';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/profile') || pathname.startsWith('/purchases') || pathname.startsWith('/sell') || pathname.startsWith('/policy')) return 'perfil';
  return 'inicio';
}

export function PersistentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useSession();

  const enabled = !!session && !HIDDEN_PATHS.has(pathname);

  const { data: notificationsSummary } = useQuery({
    queryKey: ['notifications-summary'],
    queryFn: chatService.notificationsSummary,
    enabled,
    staleTime: 15000,
  });
  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.conversations,
    enabled,
    staleTime: 15000,
  });

  if (HIDDEN_PATHS.has(pathname)) return null;

  const active = resolveActiveTab(pathname);
  const hasUnread = notificationsSummary?.hasUnread
    || chats?.some((c) => (c.id === 'bot' || c.id === 'notificaciones') && c.unread > 0);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(spacing.sm, insets.bottom * 0.5), height: 64 + insets.bottom }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => router.push(tab.href as never)}>
            <View>
              <Ionicons name={tab.icon} size={22} color={isActive ? colors.primary : colors.textMuted} />
              {tab.key === 'chat' && hasUnread ? <View style={styles.dot} /> : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 6,
    paddingBottom: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
  },
  dot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
