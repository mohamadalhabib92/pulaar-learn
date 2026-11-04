/**
 * Manuel « Taro CP — Deftere duɗal (Pulaar) », programme Lecture Pour Tous.
 * Licence CC BY 4.0 IGO : réutilisation autorisée avec attribution.
 * Le PDF (≈ 10,7 Mo) n’est PAS embarqué : l’app pointe vers la source officielle
 * et n’utilise que la progression des lettres (faits pédagogiques) comme fil des contes.
 */
export const TARO = {
  title: 'Taro CP — Deftere duɗal (Pulaar)',
  publisher: 'Ministère de l’Éducation nationale du Sénégal — programme Lecture Pour Tous, avec l’USAID',
  year: 2018,
  license: 'CC BY 4.0 IGO',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/igo',
  sourceUrl:
    'https://senprof.education.sn/PROGRAMME%20LECTURE%20POUR%20TOUS/documentation/CP/Manuels%20de%20classe%20CP/Manuels%20classe%20Pulaar%20CP_Complet.pdf',
  attribution: {
    fr: 'Progression des lettres d’après « Taro CP — Deftere duɗal (Pulaar) », Ministère de l’Éducation nationale du Sénégal / Lecture Pour Tous / USAID, 2018, sous licence CC BY 4.0 IGO. Adaptation pour les contes : Pulaar Learn (non approuvée par les auteurs).',
    en: 'Letter progression after “Taro CP — Deftere duɗal (Pulaar)”, Ministry of National Education of Senegal / Lecture Pour Tous / USAID, 2018, licensed CC BY 4.0 IGO. Adapted for the stories by Pulaar Learn (not endorsed by the authors).',
  },
};

export type TaroStep = { lessons: string; letters: string[]; note?: string };

/** Progression des graphèmes, leçon par leçon (relevée dans le manuel). */
export const TARO_PROGRESSION: TaroStep[] = [
  { lessons: '1', letters: ['m', 't', 'b', 'l', 'n', 'a', 'e', 'i', 'o', 'u'] },
  { lessons: '2', letters: ['d', 'ɓ', 'k', 'ɗ', 'f'] },
  { lessons: '3', letters: [], note: 'Révision' },
  { lessons: '4', letters: ['h', 'j', 'p', 'r', 's', 'aa', 'ee', 'ii', 'oo', 'uu'], note: 'Voyelles longues' },
  { lessons: '5', letters: ['y', 'c', 'ñ', 'g', 'w'] },
  { lessons: '7', letters: ['ŋ', 'ƴ'] },
  { lessons: '8', letters: ['bb', 'kk'] },
  { lessons: '10', letters: ['dd', 'ɗɗ'] },
  { lessons: '11', letters: ['ɓɓ', 'll'] },
  { lessons: '13', letters: ['jj', 'mm'] },
  { lessons: '14', letters: ['cc', 'gg'] },
  { lessons: '16', letters: ['tt', 'pp', 'nn'] },
  { lessons: '17', letters: ["'"], note: 'Coup de glotte' },
  { lessons: '19', letters: ['nd', 'ng'] },
  { lessons: '20', letters: ['nj', 'mb'] },
  { lessons: '22', letters: ['ŋŋ'] },
  { lessons: '23', letters: ['ññ', 'ƴƴ'] },
  { lessons: '25', letters: ['mmb', 'nnd', 'nnj', 'nng'] },
  { lessons: '26+', letters: [], note: 'Textes de lecture' },
];
