import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePulaarFontReady } from '../lib/fonts';
import { useReduceMotion } from '../lib/motion';
import { FadeIn, PressableScale, springs } from './motion';
import { colors, fonts, hit, radius, space, type as typeScale } from '../theme';

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
  dir,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  dir?: 'ltr' | 'rtl';
}) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.maxWidth}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>
      <View style={[styles.maxWidth, { flex: 1 }]}>{children}</View>
    </View>
  );
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, dir ? { direction: dir } : null, style]}>
      {inner}
    </SafeAreaView>
  );
}

type TProps = TextProps & { color?: string; center?: boolean };
const mk = (base: TextStyle) =>
  function T({ style, color, center, ...p }: TProps) {
    return (
      <Text
        {...p}
        style={[base, color ? { color } : null, center ? { textAlign: 'center' } : null, style]}
      />
    );
  };
export const H1 = mk({ fontSize: typeScale.h1, fontWeight: '800', color: colors.text, letterSpacing: -0.5 });
export const H2 = mk({ fontSize: typeScale.h2, fontWeight: '700', color: colors.text });
export const H3 = mk({ fontSize: typeScale.h3, fontWeight: '700', color: colors.text });
export const Body = mk({ fontSize: typeScale.body, lineHeight: 22, color: colors.text });
export const Muted = mk({ fontSize: typeScale.small, lineHeight: 18, color: colors.muted });

/** Texte pulaar : Noto Sans si elle est prête, sinon la police du système. lang=ff pour le lecteur d’écran. */
export function PulaarText({ style, bold = false, center, ...p }: TextProps & { bold?: boolean; center?: boolean }) {
  const ready = usePulaarFontReady();
  return (
    <Text
      {...p}
      accessibilityLanguage="ff"
      style={[
        { fontSize: bold ? typeScale.pulaar : typeScale.body, color: colors.text },
        center ? { textAlign: 'center' } : null,
        style,
        ready ? { fontFamily: bold ? fonts.bold : fonts.regular, fontWeight: 'normal' } : null,
      ]}
    />
  );
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        scaleTo={0.985}
        hapticKind="select"
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.94 }, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'accent'
        ? colors.accent
        : variant === 'secondary'
          ? colors.primarySoft
          : variant === 'danger'
            ? colors.danger
            : 'transparent';
  const fg = variant === 'accent' ? colors.accentInk : variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hapticKind={disabled ? null : variant === 'danger' ? 'warning' : 'tap'}
      style={({ pressed }) => [
        styles.button,
        small && { minHeight: hit.min, paddingHorizontal: space.md },
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.9 : 1 },
        (variant === 'primary' || variant === 'accent') && !disabled && [styles.buttonLift, { shadowColor: bg }],
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: fg }, small && { fontSize: 13 }]}>{label}</Text>
    </PressableScale>
  );
}

export function Chip({
  label,
  active,
  onPress,
  onLongPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleTo={0.95}
      hapticKind="select"
      style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[styles.chipText, active && { color: colors.onPrimary }]}>{label}</Text>
    </PressableScale>
  );
}

/** Drapeau toujours accompagné du nom du dialecte, lisible sans l’emoji. */
export function DialectBadge({ flag, label, tone = 'info' }: { flag?: string; label: string; tone?: 'neutral' | 'warn' | 'ok' | 'info' }) {
  const text = flag ? `${flag} ${label}` : label;
  return (
    <View accessibilityLabel={label}>
      <Badge label={text} tone={tone} />
    </View>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'warn' | 'ok' | 'info' }) {
  const map = {
    neutral: [colors.surfaceAlt, colors.muted],
    warn: ['#FFF4DB', '#8A5A00'],
    ok: ['#E3F6EA', '#1D6B3A'],
    info: [colors.primarySoft, colors.primary],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary, height = 6 }: { value: number; color?: string; height?: number }) {
  const v = Math.max(0, Math.min(1, value || 0));
  const reduce = useReduceMotion();
  const w = useRef(new Animated.Value(v)).current;
  useEffect(() => {
    // Remplissage en ressort doux (largeur en % : pas de pilote natif).
    if (reduce) w.setValue(v);
    else Animated.spring(w, { toValue: v, ...springs.gentle, useNativeDriver: false }).start();
  }, [v, w, reduce]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={{ height, borderRadius: height, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={{ width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

/** Slider maison (pas de dépendance native) : fonctionne sur iOS, Android et web. */
export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0,
  onChange,
  onComplete,
  accessibilityLabel,
  rtl,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (v: number) => void;
  onComplete?: (v: number) => void;
  accessibilityLabel?: string;
  rtl?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const last = useRef(value);
  const range = max - min || 1;
  const ratio = Math.max(0, Math.min(1, (value - min) / range));
  const compute = (e: GestureResponderEvent) => {
    if (!width) return value;
    let r = Math.max(0, Math.min(1, e.nativeEvent.locationX / width));
    if (rtl) r = 1 - r;
    let v = min + r * range;
    if (step) v = Math.round(v / step) * step;
    last.current = v;
    return v;
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: Math.round(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const d = (step || range / 20) * (e.nativeEvent.actionName === 'increment' ? 1 : -1);
        const v = Math.max(min, Math.min(max, value + d));
        onChange?.(v);
        onComplete?.(v);
      }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => onChange?.(compute(e))}
      onResponderMove={(e) => onChange?.(compute(e))}
      onResponderRelease={() => onComplete?.(last.current)}
      style={styles.sliderHit}
    >
      <View pointerEvents="none" style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            { width: `${ratio * 100}%` },
            rtl ? { right: 0 } : { left: 0 },
          ]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[styles.sliderThumb, rtl ? { right: `${ratio * 100}%`, marginRight: -11 } : { left: `${ratio * 100}%`, marginLeft: -11 }]}
      />
    </View>
  );
}

export function Skeleton({ height = 18, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(reduce ? 0.7 : 0.4)).current;
  useEffect(() => {
    if (reduce) {
      a.setValue(0.7);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0.4, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a, reduce]);
  return <Animated.View accessibilityElementsHidden style={[{ height, width, borderRadius: 8, backgroundColor: colors.surfaceAlt, opacity: a }, style]} />;
}

export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <FadeIn style={styles.empty}>
      {icon ? (
        <View style={styles.emptyHalo}>
          <View style={styles.emptyIcon}>{icon}</View>
        </View>
      ) : null}
      <H3 center>{title}</H3>
      {text ? <Muted center style={{ maxWidth: 420 }}>{text}</Muted> : null}
      {action ? <View style={{ marginTop: space.sm }}>{action}</View> : null}
    </FadeIn>
  );
}

export function Row({ children, style, gap = space.sm }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Spacer({ h = space.md }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export function BootScreen({ label }: { label?: string }) {
  return (
    <View style={[styles.screen, { padding: space.lg, gap: space.md }]}>
      <Skeleton height={28} width="46%" />
      <Skeleton height={88} />
      <Skeleton height={72} />
      <Skeleton height={72} />
      <Skeleton height={72} />
      {label ? <Muted>{label}</Muted> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 48, alignItems: 'center' },
  maxWidth: { width: '100%', maxWidth: 760, gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: space.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  button: {
    minHeight: hit.min,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  buttonLift: { shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  chip: {
    minHeight: hit.min,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  sliderHit: { height: hit.audio, justifyContent: 'center' },
  sliderTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  sliderFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: colors.primary },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40, paddingHorizontal: 20 },
  emptyHalo: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
