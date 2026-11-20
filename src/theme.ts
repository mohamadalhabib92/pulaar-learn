/**
 * Verre — design system partagé de Pulaar Learn.
 * Surfaces translucides (clair et sombre), relief des boutons, tokens uniques.
 * Les contes (2–6 ans), le parcours et les quêtes utilisent les mêmes tokens :
 * texte de base 17, cibles 44 pt, contrastes WCAG 2.2 AA.
 *
 * Le vert de marque des boutons est un cran plus profond que le splash (#1F7A4D)
 * pour que le texte blanc et les liens restent au-dessus de 4,5:1.
 * Aucune clé de stockage n’est définie ici.
 */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

/** Tailles de base. Le texte natif suit Dynamic Type (allowFontScaling), sans second facteur. */
export const type = {
  h1: 32,
  h2: 22,
  h3: 18,
  body: 17,
  small: 14,
  pulaar: 22,
} as const;

/** Cibles tactiles. L’audio est plus grand que le minimum (44). */
export const hit = { min: 44, audio: 56 } as const;

export const motion = { fast: 150, normal: 280 } as const;

/** Aucun écran de démarrage ne dépasse cette durée. */
export const BOOT_TIMEOUT_MS = 8000;

/**
 * Noto Sans (SIL Open Font License), sous-ensemble latin + extensions IPA.
 * Couvre ɓ ɗ ƴ ŋ ñ et les capitales. Repli : police système si le fichier ne charge pas.
 */
export const fonts = {
  regular: 'NotoSans_400Regular',
  bold: 'NotoSans_700Bold',
} as const;

export type Mode = 'light' | 'dark';

type Tone = {
  bg: string;
  surfaceSolid: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryFill: string;
  primarySoft: string;
  onPrimary: string;
  onPrimaryMuted: string;
  accent: string;
  accentFill: string;
  accentSoft: string;
  accentText: string;
  accentInk: string;
  danger: string;
  dangerFill: string;
  dangerSoft: string;
  highlight: string;
  highlightInk: string;
  ok: string;
  okSoft: string;
  flame: string;
  glass: string;
  glassBorder: string;
  glassEdge: string;
  shadow: string;
  washA: string;
  washB: string;
};

export type Palette = Tone & {
  mode: Mode;
  translucent: boolean;
  /** Fond des cartes : verre, ou solide si « réduire la transparence ». */
  surface: string;
};

const light: Tone = {
  bg: '#E4EFE7',
  surfaceSolid: '#F7FBF8',
  surfaceAlt: '#DCE8E0',
  text: '#132019',
  muted: '#3C5146',
  border: '#D5E0D8',
  primary: '#1A6B40',
  primaryFill: '#1A6B40',
  primarySoft: '#D7F0E2',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#E7F6EE',
  accent: '#7A4A00',
  accentFill: '#F2A541',
  accentSoft: '#FDF0DC',
  accentText: '#7A4A00',
  accentInk: '#5C3700',
  danger: '#9E1B1B',
  dangerFill: '#9E1B1B',
  dangerSoft: '#FDECEA',
  highlight: '#F6D27A',
  highlightInk: '#1A1408',
  ok: '#1A6B40',
  okSoft: '#E3F6EA',
  flame: '#9A3412',
  glass: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(255,255,255,0.92)',
  glassEdge: 'rgba(255,255,255,0.98)',
  shadow: '#143024',
  washA: 'rgba(26,107,64,0.22)',
  washB: 'rgba(242,165,65,0.28)',
};

const dark: Tone = {
  bg: '#0E1612',
  surfaceSolid: '#1A2620',
  surfaceAlt: '#24332B',
  text: '#F4F7F5',
  muted: '#C5D5CC',
  border: '#2C3D34',
  primary: '#3DDB8A',
  primaryFill: '#1B7A45',
  primarySoft: '#1E3D2C',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#E5F6EC',
  accent: '#F2A541',
  accentFill: '#F0B45A',
  accentSoft: '#3A2C16',
  accentText: '#F6D7A2',
  accentInk: '#2A1A00',
  danger: '#FFB4AB',
  dangerFill: '#9E1B1B',
  dangerSoft: '#3A2220',
  highlight: '#F6D27A',
  highlightInk: '#1A1408',
  ok: '#7DDEA8',
  okSoft: '#163528',
  flame: '#FFB086',
  glass: 'rgba(26,40,33,0.78)',
  glassBorder: 'rgba(255,255,255,0.16)',
  glassEdge: 'rgba(255,255,255,0.38)',
  shadow: '#000000',
  washA: 'rgba(61,219,138,0.18)',
  washB: 'rgba(240,180,90,0.16)',
};

export function resolvePalette(mode: Mode, reduceTransparency: boolean): Palette {
  const tone = mode === 'dark' ? dark : light;
  return {
    ...tone,
    mode,
    translucent: !reduceTransparency,
    surface: reduceTransparency ? tone.surfaceSolid : tone.glass,
  };
}

/** Repli hors React (clair, verre). Les écrans passent par useVerre(). */
export const colors = resolvePalette('light', false);

export function glassChrome(p: Palette): { backgroundColor: string; borderColor: string; borderTopColor: string } {
  if (!p.translucent) {
    return { backgroundColor: p.surfaceSolid, borderColor: p.border, borderTopColor: p.border };
  }
  return { backgroundColor: p.glass, borderColor: p.glassBorder, borderTopColor: p.glassEdge };
}

type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

/** Ombre portée (couche basse) d’un bouton. S’aplatit à l’appui. */
export function relief(p: Palette, pressed: boolean): Shadow {
  const darkMode = p.mode === 'dark';
  if (pressed) {
    return {
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: darkMode ? 0.35 : 0.12,
      shadowRadius: 2,
      elevation: 1,
    };
  }
  return {
    shadowColor: p.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: darkMode ? 0.5 : 0.2,
    shadowRadius: 14,
    elevation: 6,
  };
}

/** Ombre de contact (couche haute), collée au bouton ou à la carte. */
export function contactShadow(p: Palette): Shadow {
  const darkMode = p.mode === 'dark';
  return {
    shadowColor: p.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: darkMode ? 0.4 : 0.14,
    shadowRadius: 3,
    elevation: 2,
  };
}
