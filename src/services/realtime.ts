import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

import { getApiBaseUrl } from '@/services/http';
import { getToken } from '@/services/session-storage';
import type { AuctionRealtimeEvent, UserNotificationRealtimeEvent } from '@/types/domain';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type Callback<T> = (event: T) => void;
type StatusCallback = (status: RealtimeStatus) => void;
type SubscriptionEntry<T> = {
  callbacks: Set<Callback<T>>;
  subscription?: StompSubscription;
  parse: (message: IMessage) => T | undefined;
};

let client: Client | undefined;
let status: RealtimeStatus = 'idle';
const statusListeners = new Set<StatusCallback>();
const subscriptions = new Map<string, SubscriptionEntry<unknown>>();
const isDev = process.env.NODE_ENV !== 'production';

function realtimeLog(message: string, payload?: unknown) {
  if (!isDev) return;
  if (payload === undefined) {
    console.log(`[realtime] ${message}`);
    return;
  }
  console.log(`[realtime] ${message}`, payload);
}

function setStatus(nextStatus: RealtimeStatus) {
  status = nextStatus;
  statusListeners.forEach((listener) => listener(nextStatus));
}

function parseJson<T>(message: IMessage): T | undefined {
  try {
    return JSON.parse(message.body) as T;
  } catch (error) {
    realtimeLog('evento invalido', error);
    return undefined;
  }
}

function numberFrom(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function stringFrom(value: unknown): string | undefined {
  if (value == null) return undefined;
  return String(value);
}

function buildRealtimeUrl() {
  const wsBaseUrl = getApiBaseUrl()
    .replace(/\/+$/, '')
    .replace(/^http:\/\//, 'ws://')
    .replace(/^https:\/\//, 'wss://');
  return wsBaseUrl.endsWith('/ws') ? wsBaseUrl : `${wsBaseUrl}/ws`;
}

function normalizeAuctionEvent(raw: Record<string, unknown>): AuctionRealtimeEvent | undefined {
  const type = stringFrom(raw.type ?? raw.tipo ?? raw.eventType ?? raw.evento) as AuctionRealtimeEvent['type'] | undefined;
  if (!type) return undefined;
  return {
    type,
    auctionId: stringFrom(raw.auctionId ?? raw.subastaId ?? raw.subasta_id),
    lotId: stringFrom(raw.lotId ?? raw.itemId ?? raw.item_id ?? raw.loteId ?? raw.lote_id),
    bidId: stringFrom(raw.bidId ?? raw.pujaId ?? raw.puja_id ?? raw.id),
    bidder: stringFrom(raw.bidder ?? raw.nombreUsuario ?? raw.nombre_usuario ?? raw.usuario),
    bidderEmail: stringFrom(raw.bidderEmail ?? raw.emailUsuario ?? raw.email_usuario ?? raw.email),
    previousLeader: stringFrom(raw.previousLeader ?? raw.previousBidder ?? raw.usuarioAnterior ?? raw.usuario_anterior),
    previousLeaderEmail: stringFrom(raw.previousLeaderEmail ?? raw.previousBidderEmail ?? raw.emailUsuarioAnterior ?? raw.email_usuario_anterior),
    amount: numberFrom(raw.amount ?? raw.monto),
    bestBid: numberFrom(raw.bestBid ?? raw.mejorOferta ?? raw.mejor_oferta ?? raw.monto),
    minBid: numberFrom(raw.minBid ?? raw.pujaMinima ?? raw.puja_minima),
    maxBid: numberFrom(raw.maxBid ?? raw.pujaMaxima ?? raw.puja_maxima),
    secondsLeft: numberFrom(raw.secondsLeft ?? raw.segundosRestantes ?? raw.segundos_restantes),
    timestamp: stringFrom(raw.timestamp ?? raw.fecha ?? raw.createdAt ?? raw.created_at),
    title: stringFrom(raw.title ?? raw.titulo),
    message: stringFrom(raw.message ?? raw.mensaje ?? raw.contenido),
  };
}

function normalizeNotificationEvent(raw: Record<string, unknown>): UserNotificationRealtimeEvent | undefined {
  const type = stringFrom(raw.type ?? raw.tipo ?? raw.eventType ?? raw.evento);
  if (type !== 'NOTIFICATION_CREATED') return undefined;
  const source = (raw.notification && typeof raw.notification === 'object')
    ? raw.notification as Record<string, unknown>
    : raw;
  return {
    type: 'NOTIFICATION_CREATED',
    notification: {
      id: stringFrom(source.id ?? source.notificationId ?? source.notificacionId) ?? String(Date.now()),
      type: stringFrom(source.notificationType ?? source.tipoNotificacion ?? source.tipo) ?? 'bot',
      title: stringFrom(source.title ?? source.titulo) ?? 'Nueva notificacion',
      content: stringFrom(source.content ?? source.contenido ?? source.message ?? source.mensaje) ?? '',
      timestamp: stringFrom(source.timestamp ?? source.fecha ?? source.createdAt ?? source.created_at) ?? new Date().toISOString(),
      read: Boolean(source.read ?? source.leido ?? false),
    },
  };
}

function subscribeDestination<T>(destination: string, callback: Callback<T>, parse: (message: IMessage) => T | undefined) {
  let entry = subscriptions.get(destination) as SubscriptionEntry<T> | undefined;
  if (!entry) {
    entry = { callbacks: new Set(), parse };
    subscriptions.set(destination, entry as SubscriptionEntry<unknown>);
  }
  entry.callbacks.add(callback);
  attachSubscription(destination, entry);
  void connectRealtime();

  return () => {
    const current = subscriptions.get(destination) as SubscriptionEntry<T> | undefined;
    if (!current) return;
    current.callbacks.delete(callback);
    if (current.callbacks.size === 0) {
      current.subscription?.unsubscribe();
      subscriptions.delete(destination);
      realtimeLog('suscripcion removida', destination);
    }
  };
}

function attachSubscription<T>(destination: string, entry: SubscriptionEntry<T>) {
  if (!client?.connected || entry.subscription) return;
  entry.subscription = client.subscribe(destination, (message) => {
    const event = entry.parse(message);
    if (!event) return;
    realtimeLog('evento recibido', { destination, event });
    entry.callbacks.forEach((callback) => callback(event));
  });
  realtimeLog('suscripcion activa', destination);
}

function attachAllSubscriptions() {
  subscriptions.forEach((entry, destination) => {
    entry.subscription = undefined;
    attachSubscription(destination, entry);
  });
}

export function getRealtimeUrl() {
  return buildRealtimeUrl();
}

export function getRealtimeStatus() {
  return status;
}

export function addRealtimeStatusListener(callback: StatusCallback) {
  statusListeners.add(callback);
  return () => statusListeners.delete(callback);
}

export async function connectRealtime() {
  if (client?.active) return;

  let brokerURL: string;
  try {
    brokerURL = buildRealtimeUrl();
  } catch (error) {
    realtimeLog('configuracion realtime invalida', error);
    setStatus('error');
    return;
  }

  client = new Client({
    brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: async () => {
      const token = await getToken();
      client!.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      realtimeLog('conectando', brokerURL);
      setStatus('connecting');
    },
    onConnect: () => {
      realtimeLog('conexion establecida');
      setStatus('connected');
      attachAllSubscriptions();
    },
    onDisconnect: () => {
      realtimeLog('desconexion');
      setStatus('disconnected');
    },
    onStompError: (frame) => {
      realtimeLog('error stomp', frame.headers.message ?? frame.body);
      setStatus('error');
    },
    onWebSocketClose: () => {
      realtimeLog('websocket cerrado; reconectando si corresponde');
      setStatus('disconnected');
    },
    onWebSocketError: (event) => {
      realtimeLog('error websocket', event);
      setStatus('error');
    },
  });

  client.activate();
}

export async function disconnectRealtime() {
  subscriptions.forEach((entry) => entry.subscription?.unsubscribe());
  subscriptions.clear();
  if (client?.active) await client.deactivate();
  client = undefined;
  setStatus('idle');
  realtimeLog('conexion cerrada manualmente');
}

export type AuctionListEvent = {
  type: 'AUCTION_CREATED' | 'AUCTION_UPDATED' | 'AUCTION_STATE_CHANGED';
  subastaId: number;
};

export function subscribeToAuctionList(callback: Callback<AuctionListEvent>) {
  return subscribeDestination('/topic/subastas', callback, (message) => {
    const raw = parseJson<Record<string, unknown>>(message);
    if (!raw) return undefined;
    const type = stringFrom(raw.type) as AuctionListEvent['type'] | undefined;
    if (!type) return undefined;
    return { type, subastaId: Number(raw.subastaId ?? raw.subasta_id ?? 0) };
  });
}

export function subscribeToAuction(subastaId: string, callback: Callback<AuctionRealtimeEvent>) {
  return subscribeDestination(`/topic/subastas/${subastaId}`, callback, (message) => {
    const raw = parseJson<Record<string, unknown>>(message);
    return raw ? normalizeAuctionEvent(raw) : undefined;
  });
}

export function subscribeToUserBidEvents(callback: Callback<AuctionRealtimeEvent>) {
  return subscribeDestination('/user/queue/pujas', callback, (message) => {
    const raw = parseJson<Record<string, unknown>>(message);
    return raw ? normalizeAuctionEvent(raw) : undefined;
  });
}

export function subscribeToUserNotifications(callback: Callback<UserNotificationRealtimeEvent>) {
  return subscribeDestination('/user/queue/notificaciones', callback, (message) => {
    const raw = parseJson<Record<string, unknown>>(message);
    return raw ? normalizeNotificationEvent(raw) : undefined;
  });
}
