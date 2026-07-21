import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabBarButton } from '../../components/TabBarButton';
import { APP_NAME } from '../../lib/constants';
import { useStore } from '../../lib/store';
import { ACCENT_SWATCH_PREVIEW } from '../../lib/theme';
import { useAppTheme } from '../../lib/useAppTheme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const tabBarAccentColor = useStore((state) => state.tabBarAccentColor);
  const indicatorColor = tabBarAccentColor === 'auto' ? colors.accent : ACCENT_SWATCH_PREVIEW[tabBarAccentColor];

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="folders"
        options={{
          title: APP_NAME,
          headerTitleAlign: 'left',
          tabBarButton: (props) => (
            <TabBarButton {...props} label={t('tabs.folders')} imageSource={require('../../assets/logo-transparent.png')} indicatorColor={indicatorColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="now"
        options={{
          title: t('tabs.now'),
          tabBarButton: (props) => (
            <TabBarButton {...props} label={t('tabs.now')} imageSource={require('../../assets/focus-icon.png')} indicatorColor={indicatorColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: t('tabs.trash'),
          tabBarButton: (props) => (
            <TabBarButton {...props} label={t('tabs.trash')} imageSource={require('../../assets/trash-icon.png')} indicatorColor={indicatorColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarButton: (props) => (
            <TabBarButton {...props} label={t('tabs.settings')} imageSource={require('../../assets/settings-icon.png')} indicatorColor={indicatorColor} />
          ),
        }}
      />
    </Tabs>
  );
}
