import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useVerre } from '../lib/verre';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function Highlight({ text, query, style, color }: { text: string; query?: string; style?: StyleProp<TextStyle>; color?: string }) {
  const { colors } = useVerre();
  const q = (query ?? '').trim();
  if (q.length < 2) return <Text allowFontScaling style={style}>{text}</Text>;
  const parts = text.split(new RegExp(`(${escape(q)})`, 'gi'));
  return (
    <Text allowFontScaling style={style}>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <Text key={i} style={{ backgroundColor: color ?? colors.highlight, color: colors.highlightInk, fontWeight: '700' }}>
            {p}
          </Text>
        ) : (
          <Text key={i}>{p}</Text>
        ),
      )}
    </Text>
  );
}
