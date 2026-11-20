# Release `release/next`

Branche de préparation iOS / TestFlight. **Ne pas fusionner dans `main` sans accord explicite.** `main` déploie le site (GitHub Pages) via `.github/workflows/pages.yml`. Cette branche ne déclenche pas ce déploiement : le workflow Pages n’écoute que `main`.

Les branches d’origine restent en place. Rien n’est soumis à l’App Store depuis ce dépôt, et aucun build EAS n’est lancé par la CI.

## Ce que contient la branche

- La ligne TestFlight ouverte : `ux/passe-plaisir-2026-11-04` (PR #5), coupée après le correctif de démarrage du build 13.
- Le contenu déjà sur `main` depuis, notamment les corrections du conte ch. 3 (PR #4).
- La protection de la sauvegarde locale `pulaar:v1` (PR #6).
- Les contrôles CI et Dependabot (PR #7), étendus ici : typecheck, tests, recherche de secrets, et `expo export` web, sur **chaque push et chaque pull request**.

## CI

Fichier : `.github/workflows/pr-checks.yml`.

À chaque push et à chaque pull request :

1. `npm ci`
2. `npx tsc --noEmit`
3. `npm test`
4. `npm run check` (aucun secret dans le dépôt)
5. `npx expo export -p web`

Pas de clé, pas de signature, pas de profil de provisioning, pas de `eas build`, pas de `eas submit`.

## Envoyer un build sur TestFlight

À faire **à la main**, sur un poste qui a déjà le compte EAS `habib548` et les variables d’environnement. Ne pas coller de clé dans le dépôt ni dans le chat.

Le profil `production` de `eas.json` incrémente le numéro de build côté EAS (`autoIncrement`, `appVersionSource: remote`). Ne pas éditer `ios.buildNumber`, le bundle id, les entitlements ni la signature pour ce train.

`expo-haptics` (passe plaisir) et `userInterfaceStyle: automatic` (verre clair / sombre) ne sont pris en compte qu’au prochain binaire natif. L’export web de la CI ne les installe pas sur un iPhone.

```bash
git fetch origin
git checkout release/next
git pull origin release/next
npm ci
npm test
npx tsc --noEmit
npm run check

# Puis, seulement quand le contenu est validé :
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production --latest
```

`eas submit` lit le profil `submit.production.ios` déjà dans `eas.json` :

- `ascAppId` et `appleTeamId` sont ceux de la fiche existante ;
- la clé API App Store Connect vient des variables déjà prévues : `EXPO_ASC_API_KEY_PATH`, `EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`.

Aucun de ces secrets n’est écrit ici. `EXPO_NO_CAPABILITY_SYNC=1` est déjà dans le profil de build : ne pas resynchroniser les capabilities.

Après le build, le binaire apparaît dans TestFlight (App Store Connect, app `6796945492`). Ce document ne soumet pas l’app à la revue.

## Vérifier avant le build

- La CI de `release/next` est verte.
- Une copie de la clé locale `pulaar:v1` et des fichiers audio importés est faite sur un appareil de test. Les clés de stockage ne changent pas dans cette branche.
- Le thème suit le réglage clair/sombre du téléphone. « Réduire la transparence » rend les cartes opaques. « Réduire les animations » (réglage de l’app, sinon celui du téléphone) coupe ressorts et haptique visuelle.
