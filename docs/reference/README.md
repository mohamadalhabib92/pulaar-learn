# Références internes (non embarquées)

Ces documents ont été fournis par Mohamed le 03.11.2026. Ils servent **uniquement de référence interne**
pour vérifier le vocabulaire. Ils ne sont **pas** dans ce dépôt (qui est public), **pas** dans l’app et
**pas** dans la build web (GitHub Pages). Aucun extrait n’est reproduit dans l’app sans accord des ayants droit.

| Document | Taille | Statut |
|---|---|---|
| Dictionnaire pulaar–anglais (Niang, Hippocrene) | 308 p. | © Hippocrene — référence interne uniquement |
| Dictionnaire pular–français « peeral » (Oumar Bah), pular du Fouta-Djallon | 290 p. | Droits de l’auteur — référence interne uniquement |
| Lexique pulaar–français | 13 p. | Droits à vérifier — référence interne uniquement |
| Pulareeje (proverbes peuls) | 29 p. | Droits à vérifier — référence interne uniquement |
| Guide pulaar–suisse allemand (alphabet, salutations) | 5 p. | Origine à confirmer — référence interne uniquement |

Règles :
- Ne jamais committer ces PDF (le `.gitignore` bloque `docs/reference/**/*.pdf`).
- Un mot vérifié dans ces sources peut corriger un texte de l’app, mais il reste « À relire » tant qu’un
  locuteur natif ne l’a pas validé.
- Pas de copie de définitions, d’exemples ou de proverbes dans l’app.

## Source utilisée dans l’app : manuel Taro CP

« Taro CP — Deftere duɗal (Pulaar) », Ministère de l’Éducation nationale du Sénégal, programme Lecture
Pour Tous, avec l’USAID, 2018. Licence **CC BY 4.0 IGO** (https://creativecommons.org/licenses/by/4.0/igo).

- Le PDF (≈ 10,7 Mo, 228 p.) n’est pas embarqué. L’app renvoie vers la source officielle :
  https://senprof.education.sn/PROGRAMME%20LECTURE%20POUR%20TOUS/documentation/CP/Manuels%20de%20classe%20CP/Manuels%20classe%20Pulaar%20CP_Complet.pdf
- Seule la progression des lettres par leçon est utilisée (`src/data/taro.ts`), avec attribution sur les
  écrans Contes et « Lettres pulaar ».
