import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { fonts } from '../theme';

const regular = require('../../assets/fonts/NotoSans-Regular.ttf');
const bold = require('../../assets/fonts/NotoSans-Bold.ttf');

const FontReady = createContext(false);

/**
 * Charge Noto Sans sans bloquer le démarrage.
 * Sur le web, une police de repli en unicode-range couvre ɓ ɗ ƴ ŋ ñ
 * dans n’importe quel texte, même mélangé au français.
 * Si le fichier échoue, la police système reste en place.
 */
export function FontProvider({ children }: { children: React.ReactNode }) {
  const [loaded, error] = useFonts({
    [fonts.regular]: regular,
    [fonts.bold]: bold,
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || !loaded || error || typeof document === 'undefined') return;
    const id = 'pulaar-noto-unicode';
    if (document.getElementById(id)) return;
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(regular);
        await asset.downloadAsync();
        if (cancelled || !asset.uri) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `@font-face{font-family:"Pulaar Fallback";src:url("${asset.uri}") format("truetype");unicode-range:U+00C0-024F,U+0250-02AF,U+1E00-1EFF;font-display:swap}html,body,input,textarea,button{font-family:"Pulaar Fallback",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}`;
        document.head.appendChild(style);
      } catch {
        // Repli système : pas de blocage.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, error]);

  return <FontReady.Provider value={!!loaded && !error}>{children}</FontReady.Provider>;
}

export function usePulaarFontReady(): boolean {
  return useContext(FontReady);
}
