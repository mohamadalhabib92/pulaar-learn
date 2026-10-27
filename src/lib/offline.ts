import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

/** Sur le web, met un MP3 dans le cache du service worker (lecture hors ligne, y compris par plages). */
const CACHE = 'pulaar-learn-runtime';

export const offlineSupported = () => Platform.OS === 'web' && typeof caches !== 'undefined';

export const assetUrl = (mod: number) => {
  try {
    return Asset.fromModule(mod).uri;
  } catch {
    return null;
  }
};

export async function isOffline(mod: number): Promise<boolean> {
  if (Platform.OS !== 'web') return true; // embarqué dans l'app native
  if (!offlineSupported()) return false;
  const url = assetUrl(mod);
  if (!url) return false;
  return !!(await caches.match(url));
}

export async function makeOffline(mod: number): Promise<boolean> {
  if (!offlineSupported()) return false;
  const url = assetUrl(mod);
  if (!url) return false;
  try {
    const c = await caches.open(CACHE);
    await c.add(new Request(url, { cache: 'reload' }));
    return true;
  } catch {
    return false;
  }
}
