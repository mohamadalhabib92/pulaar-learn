# Module « Contes pour enfants »

Méthode de Mohamed (03.11.2026). Série « Les aventures de Ahmad & Ibrahim » dans Joydaaru.

- Données : `src/data/contes.ts` (épisodes), `src/data/taro.ts` (progression Taro CP).
- Écrans : `/contes` (liste, personnages, mondes), `/contes/[id]` (épisode en 7 parties), `/contes/taro`.
- Tests : `src/data/contes.test.mjs` (7 parties, statut « à relire », 4 langues, attribution Taro).

## Format d’un épisode (7 parties, dans l’ordre)
1. Histoire — pulaar puis français, fin par « Waalee e jam »
2. Vocabulaire — pulaar, arabe, français, bärndütsch, prononciation simplifiée
3. Lettres du jour — progression Taro CP + une lettre arabe
4. Dialogue à jouer en famille
5. Mini-jeux
6. Chanson répétitive
7. Coin des parents

Une partie pas encore écrite vaut `null` : l’app affiche « À écrire ». On n’invente rien pour combler.

## Statut
Tous les textes pulaar sont rédigés avec une IA : badge « À relire », jamais « validé ». Les points
précis à vérifier sont listés dans `reviewNotes` de chaque épisode et affichés à l’écran.

## Volontairement exclu
- La dédicace du docx (nom de famille complet) : dépôt public.
- Les prompts d’illustration du docx : pas d’images générées pour l’instant.
- Toute voix synthétique : audio natif prioritaire ; une TTS éventuelle sera optionnelle et étiquetée.
