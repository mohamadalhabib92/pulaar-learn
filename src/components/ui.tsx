import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  Platform,
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
import { useVerre } from '../lib/verre';
import { FadeIn, PressableScale } from './motion';

const READ_SCALE = 2.5;
const CONTROL_SCALE = 2;

function webBlur(on: boolean): ViewStyle {
  if (!on || Platform.OS !== 'web') return {};
  return { backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' } as ViewStyle;
}

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
  const { colors } = useVerre();
  const inner = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
      <View style={styles.maxWidth}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>
      <View style={[styles.maxWidth, { flex: 1 }]}>{children}</View>
    </View>
  );
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, { backgroundColor: colors.bg }, dir ? { direction: dir } : null, style]}>
      <Washes />
      <View style={styles.front}>{inner}</View>
    </SafeAreaView>
  );
}

function Washes() {
  const { colors } = useVerre();
  if (!colors.translucent) return null;
  const blur = Platform.OS === 'web' ? ({ filter: 'blur(36px)' } as ViewStyle) : null;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <View style={[styles.wash, { backgroundColor: colors.washA, top: -80, right: -90 }, blur]} />
      <View style={[styles.wash, styles.washB, { backgroundColor: colors.washB, bottom: 20, left: -120 }, blur]} />
    </View>
  );
}

type TProps = TextProps & { color?: string; center?: boolean };
function useText(role: 'h1' | 'h2' | 'h3' | 'body' | 'small', weight: TextStyle['fontWeight']) {
  const { colors, type } = useVerre();
  const size = type[role];
  const style: TextStyle = {
    fontSize: size,
    fontWeight: weight,
    color: colors.text,
    letterSpacing: role === 'h1' ? -0.5 : 0,
    lineHeight: role === 'body' ? 26 : role === 'small' ? 20 : undefined,
  };
  return { style, max: role === 'small' ? CONTROL_SCALE : READ_SCALE };
}

const mk = (role: 'h1' | 'h2' | 'h3' | 'body' | 'small', weight: TextStyle['fontWeight'], header = false, muted = false) =>
  function T({ style, color, center, ...p }: TProps) {
    const { colors } = useVerre();
    const base = useText(role, weight);
    return (
      <Text
        {...p}
        allowFontScaling
        maxFontSizeMultiplier={base.max}
        accessibilityRole={header ? 'header' : p.accessibilityRole}
        style={[base.style, { color: muted ? colors.muted : colors.text }, color ? { color } : null, center ? { textAlign: 'center' } : null, style]}
      />
    );
  };

export const H1 = mk('h1', '800', true);
export const H2 = mk('h2', '700', true);
export const H3 = mk('h3', '700');
export const Body = mk('body', '400');
export const Muted = mk('small', '400', false, true);

/** Texte pulaar : Noto Sans si elle est prête, sinon la police du système. lang=ff pour le lecteur d’écran. */
export function PulaarText({ style, bold = false, center, ...p }: TextProps & { bold?: boolean; center?: boolean }) {
  const ready = usePulaarFontReady();
  const { colors, type, fonts } = useVerre();
  return (
    <Text
      {...p}
      allowFontScaling
      maxFontSizeMultiplier={READ_SCALE}
      accessibilityLanguage="ff"
      style={[
        { fontSize: bold ? type.pulaar : type.body, lineHeight: bold ? 30 : 26, color: colors.text },
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
  const { colors, radius, glassChrome, contactShadow } = useVerre();
  const chrome = glassChrome(colors);
  const face: ViewStyle = {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    ...chrome,
    ...contactShadow(colors),
    ...webBlur(colors.translucent),
  };
  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        scaleTo={0.985}
        hapticKind="select"
        style={({ pressed }) => [face, pressed && { opacity: 0.94 }, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={[face, style]}>{children}</View>;
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
  const { colors, radius, space, hit, type, relief } = useVerre();
  const reduce = useReduceMotion();
  const filled = variant === 'primary' || variant === 'accent' || variant === 'danger';
  const bg =
    variant === 'primary'
      ? colors.primaryFill
      : variant === 'accent'
        ? colors.accentFill
        : variant === 'secondary'
          ? colors.primarySoft
          : variant === 'danger'
            ? colors.dangerFill
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
        { borderRadius: radius.md, alignSelf: 'stretch' },
        !disabled && (filled || variant === 'secondary') && relief(colors, pressed),
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={{
            minHeight: hit.min,
            paddingHorizontal: small ? space.md : space.lg,
            paddingVertical: space.sm,
            borderRadius: radius.md,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            backgroundColor: bg,
            opacity: disabled ? 0.45 : 1,
            borderWidth: variant === 'ghost' || variant === 'secondary' ? 1 : 0,
            borderColor: variant === 'secondary' ? colors.primary : colors.border,
            transform: pressed && !reduce && !disabled ? [{ translateY: 1 }] : undefined,
          }}
        >
          {variant !== 'ghost' ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 14,
                right: 14,
                height: 1.5,
                borderRadius: 1,
                backgroundColor: colors.glassEdge,
                opacity: pressed || disabled ? 0.15 : 0.95,
              }}
            />
          ) : null}
          {pressed && !disabled ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)' }]} /> : null}
          {icon ? <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{icon}</View> : null}
          <Text
            allowFontScaling
            maxFontSizeMultiplier={CONTROL_SCALE}
            style={{ color: fg, fontSize: small ? type.small : type.body, fontWeight: '700', letterSpacing: 0.2, textAlign: 'center', flexShrink: 1 }}
          >
            {label}
          </Text>
        </View>
      )}
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
  const { colors, hit, type, contactShadow } = useVerre();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleTo={0.96}
      hapticKind="select"
      style={() => [
        {
          minHeight: hit.min,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? colors.primaryFill : colors.border,
          backgroundColor: active ? colors.primaryFill : colors.surfaceSolid,
          justifyContent: 'center',
          ...contactShadow(colors),
        },
      ]}
    >
      <Text
        allowFontScaling
        maxFontSizeMultiplier={CONTROL_SCALE}
        style={{ fontSize: type.small, fontWeight: '700', color: active ? colors.onPrimary : colors.text, textAlign: 'center' }}
      >
        {label}
      </Text>
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
  const { colors, radius } = useVerre();
  const map = {
    neutral: [colors.surfaceAlt, colors.muted],
    warn: [colors.accentSoft, colors.accentText],
    ok: [colors.okSoft, colors.ok],
    info: [colors.primarySoft, colors.primary],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, alignSelf: 'flex-start', backgroundColor: bg }}>
      <Text allowFontScaling maxFontSizeMultiplier={CONTROL_SCALE} style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.2, color: fg }}>
        {label}
      </Text>
    </View>
  );
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const { colors } = useVerre();
  const reduce = useReduceMotion();
  const v = Math.max(0, Math.min(1, value || 0));
  const w = useRef(new Animated.Value(v)).current;
  useEffect(() => {
    if (reduce) w.setValue(v);
    else Animated.spring(w, { toValue: v, speed: 12, bounciness: 4, useNativeDriver: false }).start();
  }, [v, w, reduce]);
  const fill = color ?? colors.primary;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={{ height, borderRadius: height, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={{ width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height, backgroundColor: fill, borderRadius: height }} />
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
  const { colors, hit, contactShadow } = useVerre();
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
        const next = Math.max(min, Math.min(max, value + d));
        onChange?.(next);
        onComplete?.(next);
      }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => onChange?.(compute(e))}
      onResponderMove={(e) => onChange?.(compute(e))}
      onResponderRelease={() => onComplete?.(last.current)}
      style={{ height: hit.audio, justifyContent: 'center' }}
    >
      <View pointerEvents="none" style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: 0, bottom: 0, width: `${ratio * 100}%`, backgroundColor: colors.primary, ...(rtl ? { right: 0 } : { left: 0 }) }} />
      </View>
      <View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surfaceSolid,
            borderWidth: 3,
            borderColor: colors.primaryFill,
            ...contactShadow(colors),
          },
          rtl ? { right: `${ratio * 100}%`, marginRight: -14 } : { left: `${ratio * 100}%`, marginLeft: -14 },
        ]}
      />
    </View>
  );
}

export function Skeleton({ height = 18, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const { colors, radius } = useVerre();
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
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[{ height, width, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, opacity: a }, style]}
    />
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  const { colors, space, glassChrome } = useVerre();
  const halo = glassChrome(colors);
  return (
    <FadeIn style={styles.empty}>
      {icon ? (
        <View style={[styles.emptyHalo, { backgroundColor: colors.primarySoft }]}>
          <View style={[styles.emptyIcon, { backgroundColor: halo.backgroundColor, borderColor: halo.borderColor, ...webBlur(colors.translucent) }]}>{icon}</View>
        </View>
      ) : null}
      <H3 center>{title}</H3>
      {text ? (
        <Muted center style={{ maxWidth: 420 }}>
          {text}
        </Muted>
      ) : null}
      {action ? <View style={{ marginTop: space.sm, alignSelf: 'stretch' }}>{action}</View> : null}
    </FadeIn>
  );
}

export function Row({ children, style, gap = 8 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Spacer({ h = 12 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export function BootScreen({ label }: { label?: string }) {
  const { space } = useVerre();
  return (
    <View style={{ flex: 1, padding: space.lg, gap: space.md }}>
      <Skeleton height={28} width="46%" />
      <Skeleton height={88} />
      <Skeleton height={72} />
      <Skeleton height={72} />
      <Skeleton height={72} />
      {label ? <Muted>{label}</Muted> : null}
    </View>
  );
}

/** Champ de saisie : fond solide (lisible), au moins 44 pt, texte qui suit Dynamic Type. */
export function useInputStyle(): TextStyle {
  const { colors, radius, space, type, hit } = useVerre();
  return {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.md,
    fontSize: type.body,
    color: colors.text,
    backgroundColor: colors.surfaceSolid,
    minHeight: hit.min,
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  front: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, alignItems: 'center' },
  maxWidth: { width: '100%', maxWidth: 760, gap: 12 },
  wash: { position: 'absolute', width: 320, height: 320, borderRadius: 160 },
  washB: { width: 380, height: 380, borderRadius: 190 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40, paddingHorizontal: 20 },
  emptyHalo: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
