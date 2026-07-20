import { Alert, Platform } from 'react-native';

import i18n from './i18n';

export function confirmDestructive(
  title: string,
  message: string | undefined,
  confirmLabel: string,
  onConfirm: () => void
) {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (window.confirm(text)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: i18n.t('common.cancel'), style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
