import React from 'react';
import { View } from 'react-native';
import { dictionaries } from '../i18n/strings';
import { captureException } from '../lib/crash';
import { useVerre } from '../lib/verre';
import { Body, Button, H1 } from './ui';

function CrashScreen({ onRetry }: { onRetry: () => void }) {
  const { colors, space } = useVerre();
  const t = dictionaries.fr;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
      <H1 center>{t.crashTitle}</H1>
      <Body center color={colors.muted}>{t.crashText}</Body>
      <Button label={t.bootRetry} onPress={onRetry} />
    </View>
  );
}

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Filet global : un écran plante, l’app propose de réessayer au lieu d’une page blanche. */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    captureException(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <CrashScreen onRetry={() => this.setState({ error: null })} />;
  }
}
