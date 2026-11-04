/**
 * Module « Contes pour enfants » — méthode de Mohamed (03.11.2026).
 * Série « Les aventures de Ahmad & Ibrahim » dans Joydaaru (le Pays de la Joie).
 *
 * RÈGLES
 * - Tous les textes pulaar de ce fichier ont été rédigés avec une IA : statut « a_relire », jamais « validé ».
 * - Une section absente vaut null : l’app affiche « À écrire », rien n’est inventé pour combler.
 * - Lettres pulaar : progression du manuel Taro CP (CC BY 4.0 IGO), voir taro.ts.
 * - Aucun dictionnaire ni lexique tiers n’est reproduit ici (référence interne seulement, voir docs/reference).
 * - Pas d’audio natif pour l’instant ; une voix synthétique éventuelle reste optionnelle et étiquetée.
 */

export type ContesReview = 'a_relire';

export type Word4 = {
  /** Sens (clé de la ligne). */
  key: string;
  pu: string;
  ar: string;
  fr: string;
  be: string;
  /** Prononciation simplifiée, quand elle est fournie par la méthode. */
  pron?: { pu?: string; ar?: string; fr?: string; be?: string };
};

export type ArabicLetter = { letter: string; name: string; sound: string; example: string };

export type Episode = {
  id: string;
  kind: 'serie' | 'conte_libre';
  volume: number | null;
  chapter: number | null;
  title: { fr: string; pu?: string };
  worlds: WorldId[];
  /** Durée de lecture visée (min). */
  minutes: string;
  moral: string | null;
  review: ContesReview;
  aiGenerated: true;
  /** D’où vient le texte. */
  origin: string;
  // 1. Histoire (pulaar puis français). pu = null : version pulaar encore à écrire.
  story: { pu: string[] | null; fr: string[] };
  // 2. Vocabulaire en 4 langues.
  vocab: { group: string; words: Word4[] }[] | null;
  // 3. Lettres du jour.
  letters: { taroLessons: number[]; pulaar: string[]; syllables: string[]; arabic: ArabicLetter[]; note?: string } | null;
  // 4. Dialogue à jouer en famille.
  dialogue: { who: string; line: string }[] | null;
  // 5. Mini-jeux.
  games: { title: string; text: string }[] | null;
  // 6. Chanson répétitive.
  song: string[] | null;
  // 7. Coin des parents.
  parents: { learned: string[]; tips: string[] } | null;
  /** Points précis à vérifier par un locuteur natif (relevés lors de l’intégration). */
  reviewNotes: string[];
};

export const SECTION_ORDER = ['story', 'vocab', 'letters', 'dialogue', 'games', 'song', 'parents'] as const;
export type SectionId = (typeof SECTION_ORDER)[number];

export type WorldId = 'desert' | 'fleuve' | 'suisse' | 'etoiles';
export const WORLDS: Record<WorldId, { emoji: string; fr: string; en: string }> = {
  desert: { emoji: '🏜️', fr: 'Désert de Mauritanie', en: 'Mauritanian desert' },
  fleuve: { emoji: '🌾', fr: 'Fleuve du Sénégal', en: 'Senegal river' },
  suisse: { emoji: '🏔️', fr: 'Montagnes de Suisse', en: 'Swiss mountains' },
  etoiles: { emoji: '✨', fr: 'Monde étoilé de Joydaaru', en: 'Starry world of Joydaaru' },
};

export const SERIES = {
  title: 'Les aventures de Ahmad & Ibrahim',
  subtitle: 'Un voyage magique en pulaar, arabe, français et bärndütsch',
  land: 'Joydaaru (le Pays de la Joie)',
  audience: 'Enfants de 2 à 6 ans — écoute à voix haute d’abord',
  ending: 'Waalee e jam',
  characters: [
    { name: 'Ahmad', emoji: '🧒', role: 'explorateur curieux, 6 ans — toujours le premier à poser des questions' },
    { name: 'Ibrahim', emoji: '👶', role: 'le petit frère rigolo, 2 ans — adore rire et faire des bêtises mignonnes' },
    { name: 'Njamal le chameau', emoji: '🐫', role: 'guide sage de Mauritanie — connaît tous les chemins du désert' },
    { name: 'Binta la gazelle', emoji: '🦌', role: 'rapide et joueuse — toujours prête pour une course' },
    { name: 'Kiki le singe', emoji: '🐒', role: 'farceur — crée des situations très drôles' },
    { name: 'Loulou le mouton', emoji: '🐑', role: 'doux et gentil — réconforte tout le monde' },
    { name: 'Bilal le faucon', emoji: '🦅', role: 'voyageur — vole entre tous les pays' },
    { name: 'Noor la luciole', emoji: '✨', role: 'enseigne les lettres arabes — brille dans la nuit' },
  ],
};

const ch1: Episode = {
  id: 'conte-v1-ch1',
  kind: 'serie',
  volume: 1,
  chapter: 1,
  title: { fr: 'Bienvenue dans Joydaaru' },
  worlds: ['desert', 'fleuve', 'suisse', 'etoiles'],
  minutes: '3',
  moral: null,
  review: 'a_relire',
  aiGenerated: true,
  origin: 'Document de Mohamed « aventures-ahmad-ibrahim-vol1-ch1 » (modèle d’épisode)',
  story: {
    pu: null,
    fr: [
      'Un matin, Ahmad et Ibrahim se réveillent et entendent une petite voix qui chante. C’est Noor la luciole ! Elle brille devant leur fenêtre et leur dit : « Salaam ! Aujourd’hui, je vous emmène dans quatre mondes merveilleux. Êtes-vous prêts ? »',
      'Ahmad répond avec un grand sourire : « Eey ! Oui ! Nous sommes prêts ! »',
      '🏜️ Noor les transporte dans le désert doré. Là, ils rencontrent Njamal le chameau, qui se repose près d’une oasis fraîche entourée de palmiers. Njamal s’incline doucement pour qu’Ahmad et Ibrahim montent sur son dos.',
      'Njamal dit : « Jam tan, mes amis ! Bienvenue dans mon désert. Buvez de l’ndiyam (eau) avant de partir, le soleil est chaud aujourd’hui ! »',
      'Ibrahim rit et tape des mains : « Ngelooba ! Ngelooba ! » (Chameau ! Chameau !)',
      '🌾 Le voyage continue vers le grand fleuve. Le village est plein de vie : les femmes portent des paniers colorés, les enfants jouent, et Bilal le faucon survole le village en criant un salut joyeux depuis le ciel.',
      'Bilal s’écrie : « Je viens de Suisse, et je vais bientôt y retourner ! Voulez-vous voir les montagnes et la neige ? » Ahmad répond : « Eey, avec plaisir ! Merci Bilal ! »',
      '🏔️ Soudain, l’air devient frais. Ils sont dans les montagnes suisses ! Une grande vache brune avec une cloche les regarde avec curiosité. Kiki le singe, déjà installé sur une barrière avec un petit chapeau, fait une grimace rigolote.',
      'Kiki rigole : « Grüessech les amis ! Ici, la vache s’appelle « Chue » en bärndütsch ! Vous voulez la caresser ? » Ahmad touche doucement le nez de la vache. Elle souffle gentiment. Ibrahim applaudit de joie.',
      '✨ Pour finir, Noor les emmène dans le monde magique de Joydaaru, sous un grand croissant de lune souriant. Toutes les lucioles dansent et forment des petites lettres arabes lumineuses dans le ciel.',
      'Noor chante : « Regardez ! La première lettre arabe s’appelle Alif. Elle fait le son “a”, comme dans “asad”, le lion ! » Ahmad et Ibrahim répètent ensemble : « Alif ! Aaaa ! »',
      'Tous leurs amis applaudissent. Le grand voyage de Joydaaru vient de commencer — et il y a encore beaucoup à découvrir !',
    ],
  },
  vocab: [
    {
      group: '👋 Salutations',
      words: [
        { key: 'Bonjour', pu: 'Jam tan', ar: 'السلام عليكم', fr: 'Bonjour', be: 'Grüessech', pron: { pu: 'Djam-tan', ar: 'As-sa-la-mu a-lay-kum', fr: 'Bon-jour', be: 'Grü-e-ssech' } },
        { key: 'Merci', pu: 'A jaaraama', ar: 'شكراً', fr: 'Merci', be: 'Merci viu mau', pron: { pu: 'A-djaa-raa-ma', ar: 'Shu-kran', fr: 'Mer-ci', be: 'Mer-ci vyu maw' } },
        { key: 'Oui', pu: 'Eey', ar: 'نعم', fr: 'Oui', be: 'Ja', pron: { pu: 'Ééy', ar: 'Na-am', fr: 'Wi', be: 'Ya' } },
        { key: 'Non', pu: 'Alaa', ar: 'لا', fr: 'Non', be: 'Nei', pron: { pu: 'A-laa', ar: 'Laa', fr: 'Non', be: 'Nay' } },
      ],
    },
    {
      group: '🎨 Les couleurs',
      words: [
        { key: 'Rouge', pu: 'Bodeejo', ar: 'أحمر', fr: 'Rouge', be: 'Rot', pron: { pu: 'Bo-dèè-djo', ar: 'Ah-mar', fr: 'Rouj', be: 'Root' } },
        { key: 'Bleu', pu: 'Bulewo', ar: 'أزرق', fr: 'Bleu', be: 'Blau', pron: { pu: 'Bu-lé-wo', ar: 'Az-raq', fr: 'Bleu', be: 'Blaw' } },
        { key: 'Jaune', pu: 'Oroonjo', ar: 'أصفر', fr: 'Jaune', be: 'Gäub', pron: { pu: 'O-roon-djo', ar: 'As-far', fr: 'Jaun', be: 'Gä-oub' } },
        { key: 'Vert', pu: 'Wuɗiniijo', ar: 'أخضر', fr: 'Vert', be: 'Grüen', pron: { pu: 'Wu-dini-djo', ar: 'Akh-dar', fr: 'Ver', be: 'Grüen' } },
        { key: 'Blanc', pu: 'Raneejo', ar: 'أبيض', fr: 'Blanc', be: 'Wiis', pron: { pu: 'Ra-née-djo', ar: 'Ab-yad', fr: 'Blan', be: 'Vees' } },
        { key: 'Noir', pu: 'Baleejo', ar: 'أسود', fr: 'Noir', be: 'Schwarz', pron: { pu: 'Ba-lée-djo', ar: 'As-wad', fr: 'Nwar', be: 'Shvarts' } },
      ],
    },
    {
      group: '🐾 Les animaux',
      words: [
        { key: 'Chameau', pu: 'Ngelooba', ar: 'جمل', fr: 'Chameau', be: 'Kamel', pron: { pu: 'Nge-loo-ba', ar: 'Ja-mal', fr: 'Sha-mo', be: 'Ka-mél' } },
        { key: 'Gazelle', pu: 'Lella', ar: 'غزال', fr: 'Gazelle', be: 'Gazälle', pron: { pu: 'Lel-la', ar: 'Gha-zaal', fr: 'Ga-zèl', be: 'Ga-zä-le' } },
        { key: 'Mouton', pu: 'Mbaala', ar: 'خروف', fr: 'Mouton', be: 'Schaf', pron: { pu: 'Mbaa-la', ar: 'Kha-roof', fr: 'Mou-ton', be: 'Shaf' } },
        { key: 'Singe', pu: 'Waandu', ar: 'قرد', fr: 'Singe', be: 'Aff', pron: { pu: 'Waan-du', ar: 'Qird', fr: 'Sinj', be: 'Aff' } },
        { key: 'Faucon', pu: 'Ciilal', ar: 'صقر', fr: 'Faucon', be: 'Falke', pron: { pu: 'Chii-lal', ar: 'Saqr', fr: 'Fo-kon', be: 'Fal-ke' } },
        { key: 'Vache', pu: 'Nagge', ar: 'بقرة', fr: 'Vache', be: 'Chue', pron: { pu: 'Nag-gè', ar: 'Ba-qa-rah', fr: 'Vash', be: 'Khu-e' } },
      ],
    },
    {
      group: '👨‍👩‍👦 La famille',
      words: [
        { key: 'Papa', pu: 'Baaba', ar: 'أبي', fr: 'Papa', be: 'Papi', pron: { pu: 'Baa-ba', ar: 'A-bi', fr: 'Pa-pa', be: 'Pa-pi' } },
        { key: 'Maman', pu: 'Yumma', ar: 'أمي', fr: 'Maman', be: 'Mami', pron: { pu: 'Yum-ma', ar: 'Um-mi', fr: 'Ma-man', be: 'Ma-mi' } },
        { key: 'Grand frère', pu: 'Mawniraaɗo', ar: 'أخي الكبير', fr: 'Grand frère', be: 'Großi Brüeder', pron: { pu: 'Maw-ni-raa-do', ar: 'A-khi al-ka-bir', fr: 'Gran-frèr', be: 'Gross-i Brüe-der' } },
        { key: 'Petit frère', pu: 'Miñiraaɗo', ar: 'أخي الصغير', fr: 'Petit frère', be: 'Chliine Brüeder', pron: { pu: 'Mi-nyi-raa-do', ar: 'A-khi as-sa-ghir', fr: 'Pe-ti-frèr', be: 'Khlii-ne Brüe-der' } },
        { key: 'Grand-père', pu: 'Taaniraaɗo', ar: 'جدي', fr: 'Grand-père', be: 'Grossvatter', pron: { pu: 'Taa-ni-raa-do', ar: 'Jad-di', fr: 'Gran-pèr', be: 'Gross-fa-ter' } },
        { key: 'Eau', pu: 'Ndiyam', ar: 'ماء', fr: 'Eau', be: 'Wasser', pron: { pu: 'Ndi-yam', ar: 'Maa', fr: 'O', be: 'Va-sser' } },
      ],
    },
  ],
  letters: {
    taroLessons: [1, 2, 3],
    pulaar: ['a', 'm', 't', 'b', 'l', 'n', 'ɓ', 'ɗ'],
    syllables: ['ma', 'ba', 'ta', 'bi', 'lo', 'oti', 'lim', 'bil'],
    arabic: [
      { letter: 'أ', name: 'Alif', sound: 'a', example: 'أَسَد (asad — lion)' },
      { letter: 'ب', name: 'Baa', sound: 'b', example: 'بَيت (bayt — maison)' },
      { letter: 'ت', name: 'Taa', sound: 't', example: 'تَمر (tamr — datte)' },
    ],
    note: 'Aujourd’hui, seule la lettre Alif (أ) est découverte. Baa et Taa viendront dans les prochains chapitres avec des jeux de tracé.',
  },
  dialogue: [
    { who: 'Ahmad', line: 'Noor, merci pour ce voyage incroyable !' },
    { who: 'Noor', line: 'A jaaraama, Ahmad ! Vous avez bien appris aujourd’hui.' },
    { who: 'Ibrahim', line: 'Ngelooba ! Chue ! Alif !' },
    { who: 'Njamal', line: 'Jam tan, petits explorateurs. À demain pour une nouvelle aventure !' },
    { who: 'Tous ensemble', line: 'Merci viu mau, Joydaaru !' },
  ],
  games: [
    { title: '🔍 Trouve l’animal', text: 'Dans l’oasis, trouve Njamal, Binta, Loulou et Kiki cachés dans le décor.' },
    { title: '🔗 Associe le mot', text: 'Relie chaque image à son mot en français. Un adulte lit le mot dans les autres langues.' },
    { title: '🖍️ Colorie', text: 'Colorie la vache suisse en brun et sa cloche en jaune doré. N’oublie pas les fleurs roses du pré !' },
    { title: '⭕ Entoure la bonne réponse', text: 'Comment dit-on « eau » en pulaar ? Ndiyam — Ngelooba — Mbaala' },
    { title: '🧭 Labyrinthe', text: 'Aide Ahmad et Ibrahim à retrouver le chemin jusqu’à l’oasis où les attend Njamal.' },
  ],
  song: [
    '🎵 Jam tan, Salaam, Bonjour, Grüessech !',
    'Quatre langues dans notre cœur, eh oui !',
    '🎵 Ndiyam, ماء, Eau, Wasser !',
    'L’eau de la vie, partout sur la terre !',
    '🎵 Ngelooba, جمل, Chameau, Kamel !',
    'Notre ami du désert qui nous appelle !',
    '🎵 Alif, Alif, son « a » !',
    'Comme dans Asad, le lion qui rugit déjà !',
    '🎵 Jam tan, Salaam, Bonjour, Grüessech !',
    'À Joydaaru, on apprend, on rit, on grandit !',
  ],
  parents: {
    learned: [
      '4 salutations de base (bonjour, merci, oui, non) dans les 4 langues',
      '6 couleurs, 6 animaux et 6 mots de la famille dans les 4 langues',
      'Révision des lettres pulaar a, m, t, b, l, n, ɓ, ɗ (manuel Taro CP, leçons 1 à 3)',
      'Première lettre arabe : أ (Alif), son « a »',
    ],
    tips: [
      'Répétez la chanson plusieurs fois par jour : la répétition est essentielle entre 2 et 6 ans.',
      'Utilisez de vrais objets : montrez un verre d’eau et dites « ndiyam / ماء / eau / Wasser ».',
      'Pour Ibrahim (2 ans) : 2 à 3 mots par jour (eau, chameau, maman) plutôt que toute la liste.',
      'Pour Ahmad (6 ans) : l’encourager à tracer la lettre أ dans le sable, sur une ardoise ou avec son doigt.',
      'Jouez le dialogue en famille : chacun choisit un personnage et une langue.',
      'Revenez sur la carte des 4 mondes : demandez à l’enfant de nommer chaque pays et un mot appris là-bas.',
    ],
  },
  reviewNotes: [
    'Version pulaar de l’histoire à écrire (le modèle est en français avec des mots pulaar).',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : chameau = ngelooba (pl. gelooɗi), au lieu de « njamdi » (source : dictionnaires Niang/Hippocrene et peeral/Oumar Bah, lexique pulaar-français).',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : gazelle = lella (pl. lelli), au lieu de « loopo » (mêmes sources).',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : faucon = ciilal, au lieu de « buutuuru » (mêmes sources).',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : grand frère = mawniraaɗo (lexique), au lieu de « mawɗo ».',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : petit frère = miñiraaɗo, au lieu de « suka » (peeral : minnyiraawo en pular du Fouta-Djallon ; lexique : kodda = cadet).',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : grand-père = taaniraaɗo (Niang), au lieu de « mawniraawo ».',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : bärndütsch « Grüessech » (bernois) au lieu de « Grüessech » ; vache = « Chue » au lieu de « Chue ».',
  ],
};

const ch2: Episode = {
  id: 'conte-v1-ch2',
  kind: 'serie',
  volume: 1,
  chapter: 2,
  title: { fr: 'Binta apprend à compter', pu: 'Ahmad, Ibrahim e Binta Lella' },
  worlds: ['desert', 'etoiles'],
  minutes: '2',
  moral: 'Compter ensemble, dire merci',
  review: 'a_relire',
  aiGenerated: true,
  origin: 'METHODE-CONTES.md de Mohamed (03.11.2026)',
  story: {
    pu: [
      'Ñalnde wootere, Ahmad e Ibrahim njahi ladde Joydaaru. Noor ina jalba e kammu.',
      "Binta Lella ina doga, ina fijja. Binta wi'i : Jam tan, Ahmad ! Jam tan, Ibrahim ! Ngaree, min limen !",
      "Ahmad wi'i : Eey ! Ibrahim ina jala.",
      "Binta yiyi Njamal e sehilaaɓe makko. Binta limi : go'o, ɗiɗi, tati !",
      "Ibrahim wi'i : Go'o ! Go'o ! Ɓe fof ɓe njali.",
      "Binta yiyi mbaali Loulou. Ahmad limi : go'o, ɗiɗi, tati, nayi, joyi !",
      "Noor wi'i : Ahmad, a waawii ! Limo haa sappo !",
      "Ahmad limi : go'o, ɗiɗi, tati, nayi, joyi, jeegom, jeeɗiɗi, jeetati, jeenayi, sappo !",
      "Ɓe fof ɓe ceyii. Ahmad wi'i : A jaaraama, Binta !",
      "Binta wi'i : Jam tan, sehilaaɓe am. Waalee e jam !",
    ],
    fr: ['Binta apprend à compter aux enfants : trois chameaux, cinq moutons, puis jusqu’à dix.'],
  },
  vocab: [
    {
      group: '🔢 Les nombres de 1 à 10',
      words: [
        { key: '1', pu: "go'o", ar: 'واحد', fr: 'un', be: 'eis', pron: { ar: 'wa-hid' } },
        { key: '2', pu: 'ɗiɗi', ar: 'اثنان', fr: 'deux', be: 'zwöi', pron: { ar: 'ith-naan' } },
        { key: '3', pu: 'tati', ar: 'ثلاثة', fr: 'trois', be: 'drü', pron: { ar: 'tha-laa-tha' } },
        { key: '4', pu: 'nayi', ar: 'أربعة', fr: 'quatre', be: 'vier', pron: { ar: 'ar-ba-a' } },
        { key: '5', pu: 'joyi', ar: 'خمسة', fr: 'cinq', be: 'föif', pron: { ar: 'kham-sa' } },
        { key: '6', pu: 'jeegom', ar: 'ستة', fr: 'six', be: 'sächs', pron: { ar: 'sit-ta' } },
        { key: '7', pu: 'jeeɗiɗi', ar: 'سبعة', fr: 'sept', be: 'sibe', pron: { ar: 'sab-a' } },
        { key: '8', pu: 'jeetati', ar: 'ثمانية', fr: 'huit', be: 'acht', pron: { ar: 'tha-maa-ni-ya' } },
        { key: '9', pu: 'jeenayi', ar: 'تسعة', fr: 'neuf', be: 'nüün', pron: { ar: 'tis-a' } },
        { key: '10', pu: 'sappo', ar: 'عشرة', fr: 'dix', be: 'zäh', pron: { ar: 'ash-ra' } },
      ],
    },
  ],
  letters: {
    taroLessons: [4],
    pulaar: ['h', 'j', 'p', 'r', 's', 'aa', 'ee', 'ii', 'oo', 'uu'],
    syllables: [],
    arabic: [{ letter: 'ب', name: 'Baa', sound: 'b', example: 'بَيت (bayt — maison)' }],
    note: 'Proposition d’intégration : suite logique du chapitre 1 (Taro CP leçon 4, lettre arabe Baa). À confirmer par Mohamed.',
  },
  dialogue: null,
  games: null,
  song: null,
  parents: null,
  reviewNotes: [
    'Texte pulaar entièrement rédigé avec une IA : relecture par un locuteur natif nécessaire.',
    'Version française complète de l’histoire à écrire (seul un résumé est fourni).',
    'Les colonnes arabe et bärndütsch du vocabulaire ont été ajoutées à l’intégration : à relire.',
    'Dialogue, mini-jeux, chanson et coin des parents : à écrire selon le format.',
  ],
};

const bojel: Episode = {
  id: 'conte-bojel-ndiyam',
  kind: 'conte_libre',
  volume: null,
  chapter: null,
  title: { fr: 'Le lièvre qui partage l’eau', pu: 'Bojel e ndiyam' },
  worlds: ['fleuve'],
  minutes: '1',
  moral: 'Partager, c’est bien (Feccude ko moƴƴi)',
  review: 'a_relire',
  aiGenerated: true,
  origin: 'METHODE-CONTES.md de Mohamed (03.11.2026) — histoire du soir',
  story: {
    pu: [
      'Ñalnde wootere, ladde fof yoori. Ndiyam alaa. Kullel fof ina ɗomka.',
      'Bojel, lekki mawki yiyi. Les lekki ki, ndiyam ina woodi ! Bojel weltii.',
      'Bojel noddi sehilaaɓe makko fof. Ɓe ngarii, ɓe njari ndiyam, ɓe ceyii.',
      "Bojel wi'i : Feccude ko moƴƴi. Waalee e jam !",
    ],
    fr: ['La brousse est sèche, le lièvre trouve de l’eau sous un grand arbre et la partage avec ses amis.'],
  },
  vocab: [
    {
      group: '🌳 Mots du conte',
      words: [
        { key: 'Lièvre', pu: 'bojel', ar: 'أرنب', fr: 'lièvre', be: 'Haas' },
        { key: 'Eau', pu: 'ndiyam', ar: 'ماء', fr: 'eau', be: 'Wasser' },
        { key: 'Arbre', pu: 'lekki', ar: 'شجرة', fr: 'arbre', be: 'Boum' },
        { key: 'Amis', pu: 'sehilaaɓe', ar: 'أصدقاء', fr: 'amis', be: 'Fründe' },
      ],
    },
  ],
  letters: null,
  dialogue: null,
  games: null,
  song: null,
  parents: null,
  reviewNotes: [
    'Texte pulaar entièrement rédigé avec une IA : relecture par un locuteur natif nécessaire.',
    'Corrigé par Mohamed le 04.11.2026, toujours à relire : « Ɓe ngarii, ɓe njari ndiyam » (ils vinrent, ils burent l’eau), au lieu de « ɓe njari, ɓe njari ndiyam ».',
    '« Bojel, lekki mawki yiyi » : tournure à vérifier.',
    'Version française complète à écrire (seul un résumé est fourni).',
    'Les colonnes arabe et bärndütsch du vocabulaire ont été ajoutées à l’intégration : à relire.',
  ],
};

export const EPISODES: Episode[] = [ch1, ch2, bojel];
export const findEpisode = (id: string) => EPISODES.find((e) => e.id === id);

/** Nombre de sections renseignées sur les 7 du format. */
export const filledSections = (e: Episode) => SECTION_ORDER.filter((k) => (k === 'story' ? e.story.fr.length > 0 || !!e.story.pu : e[k] !== null)).length;
