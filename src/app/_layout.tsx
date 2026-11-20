import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootFallback, BootIncompatible, BootSkeleton } from '../components/Boot';
import { AppErrorBoundary } from '../components/ErrorBoundary';
import { FeedbackProvider } from '../components/motion';
import { I18nProvider } from '../lib/i18n';
import { initCrashReporting } from '../lib/crash';
import { FontProvider } from '../lib/fonts';
import { useReduceMotion } from '../lib/motion';
import { DELETE_CONFIRMATION } from '../lib/preserve';
import { appStore } from '../lib/store';
import { VerreProvider, useVerre } from '../lib/verre';

function Gate({ children }: { children: React.ReactNode }) {
  const status = appStore.useBoot();
  const reason = appStore.usePreserve().reason;
  if (status === 'incompatible') {
    return (
      <BootIncompatible
        reason={reason}
        readRaw={() => appStore.exportRaw()}
        onPlan={(plan) => {
          if (plan.removeUnreadableKey) appStore.discardUnreadable(DELETE_CONFIRMATION);
        }}
        onRetry={() => appStore.retryHydration()}
        onOffline={() => appStore.continueOffline()}
      />
    );
  }
  if (status === 'timedOut') {
    return <BootFallback onRetry={() => appStore.retryHydration()} onOffline={() => appStore.continueOffline()} />;
  }
  if (status !== 'ready' && status !== 'offline') return <BootSkeleton />;
  return <FeedbackProvider>{children}</FeedbackProvider>;
}

function ThemedTree() {
  const { colors } = useVerre();
  const reduce = useReduceMotion();
  return (
    <Gate>
      <StatusBar style={colors.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: reduce ? 'none' : 'default',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="practice/[id]" />
        <Stack.Screen name="recording/[id]" />
        <Stack.Screen name="contes/index" />
        <Stack.Screen name="contes/[id]" />
        <Stack.Screen name="contes/taro" />
        <Stack.Screen name="import" options={{ presentation: 'modal' }} />
      </Stack>
    </Gate>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initCrashReporting();
  }, []);
  return (
    <SafeAreaProvider>
      <VerreProvider>
        <AppErrorBoundary>
          <FontProvider>
            <I18nProvider>
              <ThemedTree />
            </I18nProvider>
          </FontProvider>
        </AppErrorBoundary>
      </VerreProvider>
    </SafeAreaProvider>
  );
}
