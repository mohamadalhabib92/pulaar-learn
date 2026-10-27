/**
 * Voix synthétique (Phase 2, optionnelle). AUCUNE clé dans l'app.
 * Pour l'activer, déployez server/tts-proxy.mjs et mettez son URL ici, par exemple 'https://votre-serveur/tts'.
 * Les clés (YOUR_ELEVENLABS_API_KEY, YOUR_OPENAI_API_KEY) restent côté serveur.
 */
export const TTS_PROXY_URL = '';

export type TtsResult = { ok: true; uri: string } | { ok: false; reason: 'not_configured' | 'payment' | 'error' };

export async function synthesize(text: string): Promise<TtsResult> {
  if (!TTS_PROXY_URL) return { ok: false, reason: 'not_configured' };
  try {
    const res = await fetch(TTS_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: 'ff' }),
    });
    if (res.status === 402) return { ok: false, reason: 'payment' };
    if (res.status === 501) return { ok: false, reason: 'not_configured' };
    if (!res.ok) return { ok: false, reason: 'error' };
    const blob = await res.blob();
    return { ok: true, uri: URL.createObjectURL(blob) };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
