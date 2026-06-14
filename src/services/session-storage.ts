import type { Session } from '@/types/domain';

export const SESSION_KEY = 'subastar.session';

let sessionCache: Session | null = null;

export async function readSessionValue() {
  return sessionCache ? JSON.stringify(sessionCache) : null;
}

export async function writeSessionValue(value: string | null) {
  if (!value) {
    sessionCache = null;
    return;
  }

  try {
    sessionCache = JSON.parse(value) as Session;
  } catch {
    sessionCache = null;
  }
}

export async function readSession() {
  return sessionCache;
}

export async function storeSession(session: Session | null) {
  sessionCache = session;
}

export async function getToken() {
  return sessionCache?.token;
}

