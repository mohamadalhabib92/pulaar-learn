import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, useColorScheme } from 'react-native';
import {
  contactShadow,
  fonts,
  glassChrome,
  hit,
  radius,
  relief,
  resolvePalette,
  space,
  type as typeScale,
  type Palette,
} from '../theme';

type Verre = {
  colors: Palette;
  reduceTransparency: boolean;
  space: typeof space;
  radius: typeof radius;
  type: typeof typeScale;
  hit: typeof hit;
  fonts: typeof fonts;
  relief: typeof relief;
  contactShadow: typeof contactShadow;
  glassChrome: typeof glassChrome;
};

const Ctx = createContext<Verre | null>(null);

function useReduceTransparency(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    const info = AccessibilityInfo as typeof AccessibilityInfo & {
      isReduceTransparencyEnabled?: () => Promise<boolean>;
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(prefers-reduced-transparency: reduce)');
      setOn(mq.matches);
      const fn = () => setOn(mq.matches);
      mq.addEventListener?.('change', fn);
      return () => {
        alive = false;
        mq.removeEventListener?.('change', fn);
      };
    }
    info.isReduceTransparencyEnabled?.()
      .then((v) => {
        if (alive) setOn(!!v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener?.('reduceTransparencyChanged', (v: boolean) => setOn(!!v));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return on;
}

/** Thème verre clair/sombre, solide si l’utilisateur réduit la transparence. */
export function VerreProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const reduceTransparency = useReduceTransparency();
  const mode = scheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => resolvePalette(mode, reduceTransparency), [mode, reduceTransparency]);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = colors.bg;
    document.body.style.backgroundColor = colors.bg;
    document.documentElement.style.colorScheme = colors.mode;
  }, [colors]);
  const value = useMemo<Verre>(
    () => ({
      colors,
      reduceTransparency,
      space,
      radius,
      type: typeScale,
      hit,
      fonts,
      relief,
      contactShadow,
      glassChrome,
    }),
    [colors, reduceTransparency],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVerre(): Verre {
  const v = useContext(Ctx);
  if (v) return v;
  const colors = resolvePalette('light', true);
  return { colors, reduceTransparency: true, space, radius, type: typeScale, hit, fonts, relief, contactShadow, glassChrome };
}
