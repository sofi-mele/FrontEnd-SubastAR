import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter } from 'expo-router';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConnectivityProvider } from '@/providers/connectivity-provider';
import type { RegistrationDraft, Session, UserNotification } from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { setUnauthorizedHandler } from '@/services/http';
import { appendLocalNotification } from '@/services/local-notifications';
import { disconnectRealtime, subscribeToUserNotifications } from '@/services/realtime';
import { readSession, storeSession } from '@/services/session-storage';

const PUBLIC_QUERY_STALE_TIME = 2 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: PUBLIC_QUERY_STALE_TIME } },
});

type SessionValue = {
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  registration: RegistrationDraft | null;
  setRegistration: (draft: RegistrationDraft | null) => void;
  signIn: (session: Session) => Promise<void>;
  enterAsGuest: () => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setGuest] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readSession()
      .then((stored) => stored && setSession(stored))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      setSession(null);
      setGuest(false);
      await storeSession(null);
      queryClient.clear();
      router.replace('/');
    });
    return () => setUnauthorizedHandler(undefined);
  }, [pathname, router]);

  const value = useMemo<SessionValue>(() => ({
    session,
    isGuest,
    registration,
    setRegistration,
    loading,
    async signIn(nextSession) {
      setSession(nextSession);
      setGuest(false);
      await storeSession(nextSession);
    },
    enterAsGuest() {
      setGuest(true);
    },
    async signOut() {
      setSession(null);
      setGuest(false);
      await storeSession(null);
      queryClient.clear();
    },
  }), [isGuest, loading, registration, session]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectivityProvider>
        <SessionContext.Provider value={value}>
          {children}
          <RealtimeNotificationsBridge session={session} />
        </SessionContext.Provider>
      </ConnectivityProvider>
    </QueryClientProvider>
  );
}

function RealtimeNotificationsBridge({ session }: { session: Session | null }) {
  const [banner, setBanner] = useState<UserNotification | null>(null);

  useEffect(() => {
    if (!session) {
      void disconnectRealtime();
      return;
    }

    const unsubscribe = subscribeToUserNotifications((event) => {
      const notification = { ...event.notification, read: false };
      setBanner(notification);
      void appendLocalNotification(notification);
      queryClient.setQueryData<UserNotification[]>(['notifications'], (current) => {
        if (!current) return [notification];
        if (current.some((item) => item.id === notification.id)) return current;
        return [notification, ...current];
      });
      queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => unsubscribe();
  }, [session]);

  useEffect(() => {
    if (!banner) return;
    const timeout = setTimeout(() => setBanner(null), 4500);
    return () => clearTimeout(timeout);
  }, [banner]);

  if (!banner) return null;

  return (
    <View pointerEvents="box-none" style={styles.realtimeBannerWrap}>
      <Pressable style={styles.realtimeBanner} onPress={() => setBanner(null)}>
        <Text style={styles.realtimeBannerTitle}>{banner.title}</Text>
        <Text style={styles.realtimeBannerText} numberOfLines={2}>{banner.content}</Text>
      </Pressable>
    </View>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within AppProvider');
  return context;
}

const styles = StyleSheet.create({
  realtimeBannerWrap: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  realtimeBanner: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
    shadowColor: colors.textStrong,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  realtimeBannerTitle: {
    color: colors.primaryDark,
    fontFamily: fonts.black,
    fontSize: typography.body,
  },
  realtimeBannerText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: typography.caption,
  },
});
