import { Platform } from 'react-native';

/**
 * Stockage local des imports audio.
 * Web : blob dans IndexedDB, puis URL objet au moment de la lecture.
 * Natif : copie dans <documents>/audio/.
 */
const DB = 'pulaar-learn-audio';
const STORE = 'blobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB indisponible'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB'));
  });
}

async function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB'));
  });
}

export const ACCEPTED = ['mp3', 'm4a', 'wav', 'aac', 'mp4'];
export const extOf = (name: string) => (name.split('.').pop() ?? '').toLowerCase();

/** Enregistre le fichier choisi. Renvoie l'URI native (ou null sur le web). */
export async function storeImport(id: string, asset: { uri: string; name: string; file?: Blob }): Promise<{ storage: 'idb' | 'file'; uri: string | null }> {
  if (Platform.OS === 'web') {
    const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
    await idb('readwrite', (s) => s.put(blob, id));
    return { storage: 'idb', uri: null };
  }
  const { Directory, File, Paths } = await import('expo-file-system');
  const dir = new Directory(Paths.document, 'audio');
  if (!dir.exists) dir.create({ intermediates: true });
  const dest = new File(dir, `${id}.${extOf(asset.name) || 'mp3'}`);
  new File(asset.uri).copy(dest);
  return { storage: 'file', uri: dest.uri };
}

export async function loadImportUri(m: { id: string; storage: 'idb' | 'file'; uri: string | null }): Promise<string | null> {
  if (m.storage === 'file') {
    if (!m.uri) return null;
    try {
      const { File } = await import('expo-file-system');
      return new File(m.uri).exists ? m.uri : null;
    } catch {
      return null;
    }
  }
  const blob = await idb<Blob | undefined>('readonly', (s) => s.get(m.id) as IDBRequest<Blob | undefined>);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteImportFile(m: { id: string; storage: 'idb' | 'file'; uri: string | null }) {
  try {
    if (m.storage === 'idb') await idb('readwrite', (s) => s.delete(m.id));
    else if (m.uri) {
      const { File } = await import('expo-file-system');
      const f = new File(m.uri);
      if (f.exists) f.delete();
    }
  } catch {
    // Fichier déjà absent : rien à faire.
  }
}

/** Durée d'un fichier audio sur le web (métadonnées HTMLAudioElement). */
export function probeDurationWeb(blob: Blob): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof Audio === 'undefined') return resolve(null);
    const url = URL.createObjectURL(blob);
    const a = new Audio();
    const done = (v: number | null) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    a.preload = 'metadata';
    a.onloadedmetadata = () => done(isFinite(a.duration) ? a.duration : null);
    a.onerror = () => done(null);
    setTimeout(() => done(null), 5000);
    a.src = url;
  });
}
