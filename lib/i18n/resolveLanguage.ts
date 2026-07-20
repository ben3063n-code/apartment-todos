import * as Localization from 'expo-localization';

import { SUPPORTED_LANGUAGES, type Language } from '../models';

export function resolveLanguage(preference: Language): Exclude<Language, 'auto'> {
  if (preference !== 'auto') return preference;

  const deviceCode = Localization.getLocales()[0]?.languageCode;
  const match = SUPPORTED_LANGUAGES.find((code) => code === deviceCode);
  return match ?? 'en';
}
