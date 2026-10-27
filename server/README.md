# Proxy de voix synthétique (Phase 2, optionnel)

L’app **fonctionne entièrement sans ce serveur**. Les enregistrements natifs passent toujours en premier.

- Les clés se configurent **uniquement côté serveur** : `YOUR_ELEVENLABS_API_KEY`, `YOUR_ELEVENLABS_VOICE_ID`, `YOUR_OPENAI_API_KEY`. Ce sont des valeurs à remplacer.
- N’utilisez **jamais** de variable `EXPO_PUBLIC_*` pour une clé.
- Sans clé, le serveur répond `501`. L’app affiche « Voix synthétique non configurée » et joue l’enregistrement natif.
- Si le fournisseur refuse (crédit épuisé, quota), le serveur répond `402`. L’app revient à l’audio natif.

```bash
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY ELEVENLABS_VOICE_ID=YOUR_ELEVENLABS_VOICE_ID node server/tts-proxy.mjs
```

Ensuite, mettez l’URL publique du proxy dans `src/lib/tts.ts` (`TTS_PROXY_URL`).

Ces services sont **payants** et ne sont pas activés.
