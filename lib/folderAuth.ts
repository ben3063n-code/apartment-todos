import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import i18n from './i18n';

export async function authenticateForFolder(folderName: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return window.confirm(
      `${i18n.t('folderModal.webAuthNote')}\n\n${i18n.t('folderModal.unlockPrompt', { name: folderName })}`
    );
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: i18n.t('folderModal.unlockPrompt', { name: folderName }),
    disableDeviceFallback: false,
  });
  return result.success;
}
