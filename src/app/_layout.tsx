import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootFallback, BootSkeleton } from '../components/Boot';
import { AppErrorBoundary } from '../components/ErrorBoundary';
import { FeedbackProvider } from '../components/motion';
import { I18nProvider } from '../lib/i18n';
import { initCrashReporting } from '../lib/crash';
import { FontProvider } from '../lib/fonts';
import { appStore } from '../lib/store';
import { colors } from '../theme';

function Gate({ children }: { children: React.ReactNode }) {
  const status = appStore.useBoot();
  if (status === 'timedOut') {
    return <BootFallback onRetry={() => appStore.retryHydration()} onOffline={() => appStore.continueOffline()} />;
  }
  if (status !== 'ready' && status !== 'offline') return <BootSkeleton />;
  return <FeedbackProvider>{children}</FeedbackProvider>;
}

export default function RootLayout() {
  useEffect(() => {
    initCrashReporting();
  }, []);
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <FontProvider>
          <I18nProvider>
            <Gate>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
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
          </I18nProvider>
        </FontProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
