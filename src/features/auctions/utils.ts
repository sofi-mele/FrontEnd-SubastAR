import { useLocalSearchParams } from 'expo-router';

export function useId() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return id ?? '';
}

export function formatAuctionMoney(value: number, currency?: string) {
  return `${currency ?? 'ARS'} ${new Intl.NumberFormat('es-AR').format(value)}`;
}
