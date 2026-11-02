/**
 * Design system unique de Pulaar Learn.
 * Palette conservée : fond #F7F5EF, texte #1B1F1C, accent de marque #1F7A4D.
 * L’orange #F2A541 reste la couleur d’accent secondaire (déjà dans l’app).
 *
 * Contrastes WCAG 2.2 AA (texte normal ≥ 4,5:1), mesurés :
 * - text / bg 15,30 · text / surface 16,68 · muted / bg 5,68 · muted / surface 6,19
 * - onPrimary / primary 5,32 · primary / bg 4,88 · accentInk / accent 5,11
 * - accentText / accentSoft 6,65 · onPrimaryMuted / primary 4,78
 */
export const colors = {
  bg: '#F7F5EF',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEAE0',
  text: '#1B1F1C',
  muted: '#5B635E',
  border: '#E0DCCF',
  primary: '#1F7A4D',
  primarySoft: '#E2F2E9',
  onPrimary: '#FFFFFF',
  /** Petit texte sur le vert. #E8F6EF sur #1F7A4D = 4,78:1. */
  onPrimaryMuted: '#E8F6EF',
  accent: '#F2A541',
  accentSoft: '#FDF0DC',
  /** Texte sur fond accentSoft. #7A4A00 sur #FDF0DC = 6,65:1. */
  accentText: '#7A4A00',
  /** Texte et icônes posés sur le fond accent. #5C3700 sur #F2A541 = 5,11:1. */
  accentInk: '#5C3700',
  danger: '#B3261E',
  highlight: '#F9D68A',
  ok: '#1F7A4D',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 18 };

export const type = {
  h1: 28,
  h2: 20,
  h3: 16,
  body: 15,
  small: 13,
  pulaar: 18,
};

/** Cibles tactiles. L’audio est plus grand que le minimum WCAG (44). */
export const hit = { min: 44, audio: 56 };

export const motion = { fast: 150, normal: 280 };

/** Aucun écran de démarrage ne dépasse cette durée. */
export const BOOT_TIMEOUT_MS = 8000;

/**
 * Noto Sans (SIL Open Font License), sous-ensemble latin + extensions IPA.
 * Couvre ɓ ɗ ƴ ŋ ñ et les capitales. Repli : police système si le fichier ne charge pas.
 * Les voyelles longues du cours sont des lettres doublées (aa, ii, …), pas un caractère spécial.
 */
export const fonts = {
  regular: 'NotoSans_400Regular',
  bold: 'NotoSans_700Bold',
};
