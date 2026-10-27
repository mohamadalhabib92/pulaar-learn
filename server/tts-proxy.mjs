/**
 * Proxy de voix synthétique — PHASE 2, OPTIONNEL, NON DÉPLOYÉ.
 * Les clés restent ici, côté serveur, et ne sont jamais dans l'app (pas d'EXPO_PUBLIC_*).
 *
 *   ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY \
 *   ELEVENLABS_VOICE_ID=YOUR_ELEVENLABS_VOICE_ID \
 *   OPENAI_API_KEY=YOUR_OPENAI_API_KEY \
 *   node server/tts-proxy.mjs
 *
 * POST /tts  {"text": "Jam waali"}  → audio/mpeg
 * Renvoie 501 si aucune clé n'est configurée, et 402 si le fournisseur signale un problème de crédit.
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';
const real = (v) => (v && !v.startsWith('YOUR_') ? v : null);
const EL_KEY = real(process.env.ELEVENLABS_API_KEY);
const EL_VOICE = real(process.env.ELEVENLABS_VOICE_ID);
const OA_KEY = real(process.env.OPENAI_API_KEY);

async function synth(text) {
  if (EL_KEY && EL_VOICE) {
    return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}`, {
      method: 'POST',
      headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    });
  }
  if (OA_KEY) {
    return fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'alloy', input: text, response_format: 'mp3' }),
    });
  }
  return null;
}

http
  .createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.writeHead(204).end();
    if (req.method !== 'POST' || req.url !== '/tts') return res.writeHead(404).end();
    let body = '';
    for await (const c of req) body += c;
    let text = '';
    try {
      text = String(JSON.parse(body).text || '').slice(0, 300);
    } catch {
      return res.writeHead(400).end();
    }
    if (!text) return res.writeHead(400).end();
    try {
      const up = await synth(text);
      if (!up) return res.writeHead(501, { 'Content-Type': 'text/plain' }).end('Voix synthétique non configurée');
      if (up.status === 401 || up.status === 402 || up.status === 429) return res.writeHead(402).end();
      if (!up.ok) return res.writeHead(502).end();
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
      res.end(Buffer.from(await up.arrayBuffer()));
    } catch {
      res.writeHead(502).end();
    }
  })
  .listen(PORT, () => console.log(`tts-proxy sur :${PORT}`));
