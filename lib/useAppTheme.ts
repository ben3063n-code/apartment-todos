import { useColorScheme } from 'react-native';

import { useStore } from './store';
import { buildTheme } from './theme';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const preference = useStore((state) => state.themePreference);
  const brightness = useStore((state) => state.brightness);
  const accentColor = useStore((state) => state.accentColor);

  const resolvedSystemScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const scheme = preference === 'auto' ? resolvedSystemScheme : preference;
  const colors = buildTheme(scheme, brightness, accentColor);

  return { scheme, colors, preference };
}
