import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserNotification } from '@/types/domain';

const LOCAL_NOTIFICATIONS_KEY = 'subastar.local-notifications';

export async function readLocalNotifications(): Promise<UserNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is UserNotification => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Record<string, unknown>;
      return typeof candidate.id === 'string'
        && typeof candidate.type === 'string'
        && typeof candidate.title === 'string'
        && typeof candidate.content === 'string'
        && typeof candidate.timestamp === 'string'
        && typeof candidate.read === 'boolean';
    });
  } catch {
    return [];
  }
}

export async function saveLocalNotifications(notifications: UserNotification[]) {
  try {
    await AsyncStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {
    // Best effort persistence.
  }
}

export async function appendLocalNotification(notification: UserNotification): Promise<UserNotification[]> {
  const current = await readLocalNotifications();
  const exists = current.some((item) => item.id === notification.id);
  const next = exists ? current : [notification, ...current];
  await saveLocalNotifications(next);
  return next;
}

export async function markAllLocalNotificationsRead(): Promise<UserNotification[]> {
  const current = await readLocalNotifications();
  const next = current.map((notification) => ({ ...notification, read: true }));
  await saveLocalNotifications(next);
  return next;
}
