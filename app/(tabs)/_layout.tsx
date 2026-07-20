import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabBarButton } from '../../components/TabBarButton';
import { APP_NAME } from '../../lib/constants';
import { useAppTheme } from '../../lib/useAppTheme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="folders"
        options={{
          title: APP_NAME,
          headerTitleAlign: 'left',
          tabBarButton: (props) => (
            <TabBarButton {...props} label={t('tabs.folders')} imageSource={require('../../assets/logo-transparent.png')} />
          ),
        }}
      />
      <Tabs.Screen
        name="now"
        options={{
          title: t('tabs.now'),
          tabBarButton: (props) => <TabBarButton {...props} label={t('tabs.now')} />,
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: t('tabs.trash'),
          tabBarButton: (props) => <TabBarButton {...props} label="🗑️" iconOnly />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarButton: (props) => <TabBarButton {...props} label="⚙️" iconOnly />,
        }}
      />
    </Tabs>
  );
}
