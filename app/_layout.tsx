import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '../lib/i18n';
import { resolveLanguage } from '../lib/i18n/resolveLanguage';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const hasHydrated = useStore((state) => state.hasHydrated);
  const language = useStore((state) => state.language);
  const { scheme, colors } = useAppTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (!hasHydrated) return;
    i18n.changeLanguage(resolveLanguage(language));
  }, [hasHydrated, language]);

  if (!hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="todo/[id]"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: t('todo.modalTitle'),
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen
            name="folder/[id]"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: t('folderModal.modalTitle'),
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen
            name="help"
            options={{
              headerShown: true,
              title: t('help.title'),
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
            }}
          />
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
