import React, { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { appStore } from './store';

/** Préférence « réduire les animations » : réglage de l’app, sinon celui du téléphone. */
export function useReduceMotion(): boolean {
  const pref = appStore.useStore().reduceMotion;
  const [system, setSystem] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (alive) setSystem(!!v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setSystem(!!v));
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  if (pref === 'on') return true;
  if (pref === 'off') return false;
  return system;
}
