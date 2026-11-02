/**
 * Garde-fou : pas de secret client, identifiants d’app inchangés, placeholders YOUR_* seulement.
 * Échoue le processus si une régression est trouvée.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const errors = [];

const app = JSON.parse(read('app.json'));
const eas = JSON.parse(read('eas.json'));
if (app.expo.ios.bundleIdentifier !== 'com.vibecode.pulaarlearn-bdfkkx') errors.push('bundle iOS modifié');
if (app.expo.android.package !== 'ch.mohamadba.pulaarlearn') errors.push('package Android modifié');
if (app.expo.experiments?.baseUrl !== '/pulaar-learn') errors.push('baseUrl web modifié');
if (app.expo.ios.baseUrl || app.expo.android.baseUrl) errors.push('baseUrl ne doit pas être défini hors du web');
if (eas.submit?.production?.ios?.appleTeamId !== 'Y9XF9RY2BU') errors.push('équipe Apple modifiée');
for (const name of ['development', 'preview', 'production']) {
  if (eas.build?.[name]?.env?.EXPO_NO_CAPABILITY_SYNC !== '1') errors.push(`EXPO_NO_CAPABILITY_SYNC manquant sur ${name}`);
}
if (read('src/lib/store.ts').includes("export const STORAGE_KEY = 'pulaar:v1'") === false) errors.push('clé de stockage pulaar:v1 absente');

const skipDir = new Set(['node_modules', 'dist', '.git', '.expo']);
const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDir.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|mjs|json|md|html|yml|example|txt)$/.test(ent.name) || ent.name.startsWith('.env')) files.push(p);
  }
}
walk(root);

const forbidden = [
  [/EXPO_PUBLIC_EXAMPLE/i, 'EXPO_PUBLIC_EXAMPLE'],
  [/EXAMPLE_ENV_VAR/, 'EXAMPLE_ENV_VAR'],
  [/BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY/, 'clé privée'],
  [/\.p8\b/, 'chemin .p8'],
  [/sk-[A-Za-z0-9]{10,}/, 'clé sk-'],
  [/https:\/\/[a-z0-9-]+\.supabase\.co/, 'URL Supabase réelle'],
];

for (const file of files) {
  const rel = path.relative(root, file);
  if (rel === 'scripts/check-secrets.mjs') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const [re, label] of forbidden) {
    if (re.test(text)) errors.push(`${rel} contient ${label}`);
  }
  if (rel.startsWith('src/') && /ELEVENLABS_API_KEY\s*=\s*['"](?!YOUR_)/.test(text)) errors.push(`${rel} : clé ElevenLabs côté client`);
}

const env = read('.env.example');
if (!env.includes('USE_ELEVENLABS=false')) errors.push('.env.example : USE_ELEVENLABS');
if (!env.includes('REFERENCE_PULAAR_VOICE_ID=YOUR_ELEVENLABS_VOICE_ID')) errors.push('.env.example : REFERENCE_PULAAR_VOICE_ID');
if (!env.includes('EXPO_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN')) errors.push('.env.example : Sentry');
if (/EXPO_PUBLIC_(?!SENTRY_DSN|SUPABASE_URL|SUPABASE_ANON_KEY)/.test(env)) errors.push('.env.example : EXPO_PUBLIC inattendu');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('check-secrets: ok');
