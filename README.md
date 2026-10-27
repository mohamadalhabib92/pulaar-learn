# Pulaar Learn

Application pour apprendre le **pulaar** avec des voix authentiques. Elle tourne sur iOS, Android et le web (PWA installable).

- Fonctionne **hors ligne**, sans compte et sans API payante. Toutes les données restent sur l’appareil.
- Construite avec Expo (React Native, expo-router, TypeScript). Interface en français par défaut, anglais disponible.

## Fonctionnalités

- **Apprendre** :
  - Parcours de 10 leçons, de l’alphabet aux expressions utiles (environ 250 éléments en pulaar, français et anglais).
  - Bouton « Écouter la leçon 1 » pour une première écoute en moins d’une minute.
- **Lecteur audio** :
  - Lecture/pause, ±5 s, barre de position, vitesse 0,75× / 1× / 1,25×.
  - Message clair si un fichier manque ou est illisible, sans plantage.
- **Transcriptions** : éditables pour chaque enregistrement, « À compléter » par défaut. Elles ne sont jamais générées par IA.
- **Entraînement** :
  - QCM pulaar→français et français→pulaar.
  - Leçon « maîtrisée » à partir de 80 %.
- **Boss phonétique** : sons implosifs (ɓ ɗ ƴ), nasales (ñ ŋ), prénasales (mb nd ng nj) et voyelles longues, avec l’audio natif à 0,75×.
- **Mode Pulaar Quest** (désactivable) :
  - XP, série de jours et objectif quotidien.
  - 11 badges ; chaque quête renvoie à une vraie leçon.
- **Audio** :
  - Pack « Uploads Mohamed » : 8 MP3 embarqués.
  - Import de vos fichiers .mp3/.m4a/.wav avec titre, thème, leçon associée et transcription.
  - Métadonnées : langue pulaar, source « Upload Mohamed », date, durée.
  - Stockage des imports : IndexedDB sur le web, dossier documents sur mobile.
- **Accent** :
  - Liens vers **Janngu** (site, Telegram, TikTok, e-mail) avec la mention « Pour l’accent pulaar, écoute aussi Janngu sur les réseaux. ».
  - Liens seulement : aucun contenu Janngu n’est copié.
  - Grille des sons propres au pulaar.
  - Carte « Prof de voix » : sans configuration, elle affiche « Voix synthétique non configurée » et joue l’enregistrement natif.
- **Lectures avancées** : *Wonnoo ɗoo — Tinndi e ɗemngal Pulaar* (15 contes). Le livre est seulement présenté, **en attente de vérification des droits** ; aucun texte n’est reproduit.
- **PWA** :
  - Manifeste, icônes et service worker.
  - Bouton « Rendre disponible hors ligne » pour chaque MP3 ; la lecture fonctionne par plages (206) depuis le cache.

## Sources et licences

| Contenu | Source | Statut |
|---|---|---|
| Leçons 1–10 (pulaar + anglais) | *Introduction to Pulaar — Peace Corps/Mauritania* (P.DOT Pulaar Lessons), hébergé gratuitement sur livelingua.com | Œuvre du gouvernement américain : **domaine public aux États-Unis** |
| Traductions françaises | Rédigées pour l’app | À relire |
| 8 MP3 (`assets/audio/`) | Uploads de Mohamed | Contenu propre à Mohamed |
| Janngu | Liens externes uniquement | Aucun contenu repris |
| Wonnoo ɗoo | PDF fourni | **Droits à vérifier** : non intégré |

## À valider (limites connues)

- **Orthographe provisoire — à valider** : variante mauritanienne recopiée depuis le PDF. Elle doit être relue par un·e locuteur·rice natif·ve.
- **Correspondance MP3 → leçons provisoire** : `upload-01…08` sont associés aux leçons 1–8 par hypothèse (ordre des durées). À confirmer dans `src/data/recordings.ts`.
- **Transcriptions** des 8 MP3 : à compléter.
- Les **20 enregistrements natifs gambiens** de la version Vibecode n’étaient pas accessibles. Ils peuvent être importés depuis l’onglet Audio.
- La lecture hors ligne d’un MP3 dans la PWA demande un appui sur « Rendre disponible hors ligne ». Les fichiers de 1,5 Mo ou moins sont précachés automatiquement.

## Développement

```bash
npm install
npm run web          # ou: npx expo start
npm run typecheck    # tsc --noEmit
npm run export:web   # expo export -p web + manifest/service worker -> dist/
```

Pour régénérer les icônes : `python3 scripts/make-icons.py "#1F7A4D" "#FFFFFF" "Pu" "#F2A541"` (supprimez ensuite `assets/android-icon-monochrome.png`).

## Publication sur GitHub Pages (à faire par vous)

1. Créez un dépôt GitHub nommé **`pulaar-learn`** (`experiments.baseUrl` = `/pulaar-learn`).
2. Ajoutez le dépôt distant et poussez : `git remote add origin git@github.com:<vous>/pulaar-learn.git && git push -u origin main`.
3. Dans *Settings → Pages*, choisissez **Source : GitHub Actions**. Le workflow `.github/workflows/pages.yml` construit et déploie l’app.
4. L’app est alors disponible sur `https://<vous>.github.io/pulaar-learn/`.

## Phase 2 (optionnelle, non activée)

Voix synthétique via `server/tts-proxy.mjs` (voir `server/README.md`).

- Clés **côté serveur uniquement** : `YOUR_ELEVENLABS_API_KEY`, `YOUR_ELEVENLABS_VOICE_ID`, `YOUR_OPENAI_API_KEY`. Ce sont des valeurs à remplacer.
- Jamais de variable `EXPO_PUBLIC_*`.
- Ces services sont payants. L’app reste utilisable sans eux.

## Structure

```
src/app/            routes (onglets Apprendre, Audio, Accent, Quest, Réglages ; lesson/, practice/, recording/, import)
src/data/           leçons Peace Corps, enregistrements, liens Janngu
src/lib/            store persistant, quêtes/badges, imports audio, hors ligne, TTS (Phase 2)
src/components/     lecteur audio, éléments d’interface
scripts/pwa.mjs     manifeste + service worker après export
server/             proxy TTS optionnel (non déployé)
```
