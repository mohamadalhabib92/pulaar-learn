/**
 * Journal de plantage. Aucun envoi si EXPO_PUBLIC_SENTRY_DSN est absent,
 * vide, ou un placeholder YOUR_*. Aucun appel réseau au démarrage.
 */
const raw = process.env.EXPO_PUBLIC_SENTRY_DSN;

function realDsn(value: string | undefined): URL | null {
  if (!value) return null;
  const v = value.trim();
  if (!v || v.includes('YOUR_')) return null;
  try {
    const url = new URL(v);
    if (url.protocol !== 'https:' || !url.username) return null;
    const project = url.pathname.replace(/^\//, '');
    if (!project) return null;
    return url;
  } catch {
    return null;
  }
}

const dsn = realDsn(raw);
let installed = false;

function eventId(): string {
  const bytes = new Uint8Array(16);
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) cryptoObj.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function sentryEnabled(): boolean {
  return dsn != null;
}

/** N’envoie rien tant qu’une exception n’est pas capturée, et jamais si le DSN n’est pas réel. */
export function captureException(error: unknown): void {
  if (!dsn) return;
  try {
    const project = dsn.pathname.replace(/^\//, '');
    const id = eventId();
    const message = error instanceof Error ? error.message : 'Erreur';
    const name = error instanceof Error ? error.name : 'Error';
    const header = JSON.stringify({ event_id: id, dsn: dsn.toString(), sent_at: new Date().toISOString() });
    const item = JSON.stringify({ type: 'event', content_type: 'application/json' });
    const event = {
      event_id: id,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level: 'error',
      exception: { values: [{ type: name, value: message.slice(0, 500) }] },
    };
    const url = `${dsn.protocol}//${dsn.host}/api/${project}/envelope/`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${decodeURIComponent(dsn.username)}, sentry_client=pulaar-learn/1.0.0`,
      },
      body: `${header}\n${item}\n${JSON.stringify(event)}`,
    }).catch(() => undefined);
  } catch {
    // Le journal ne doit jamais provoquer un second plantage.
  }
}

export function initCrashReporting(): void {
  if (installed) return;
  installed = true;
  if (!dsn) return;

  const g = globalThis as {
    addEventListener?: (type: string, fn: (ev: { error?: unknown; reason?: unknown }) => void) => void;
    ErrorUtils?: { getGlobalHandler?: () => (err: unknown, fatal?: boolean) => void; setGlobalHandler?: (fn: (err: unknown, fatal?: boolean) => void) => void };
  };
  g.addEventListener?.('error', (ev) => captureException(ev.error ?? ev));
  g.addEventListener?.('unhandledrejection', (ev) => captureException(ev.reason ?? ev));
  const prev = g.ErrorUtils?.getGlobalHandler?.();
  g.ErrorUtils?.setGlobalHandler?.((err, fatal) => {
    captureException(err);
    try {
      prev?.(err, fatal);
    } catch {
      // Le handler précédent a lui-même échoué.
    }
  });
}
