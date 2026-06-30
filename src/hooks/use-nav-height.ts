import { usePathname } from 'expo-router';

export const PERSISTENT_NAV_HIDDEN_PATHS = new Set([
  '/',
  '/auctions',
  '/chat',
  '/profile',
  '/welcome',
  '/login',
  '/register',
  '/registration-pending',
  '/verify',
  '/password',
  '/forgot-password',
  '/reset-password',
  '/onboarding-payment',
  '/offline',
  '/payment-success',
]);

export const PERSISTENT_NAV_HEIGHT = 64;

export function useNavHeight(): number {
  const pathname = usePathname();
  return PERSISTENT_NAV_HIDDEN_PATHS.has(pathname) ? 0 : PERSISTENT_NAV_HEIGHT;
}
