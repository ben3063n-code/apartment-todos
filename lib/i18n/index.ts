import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de';
import en from './locales/en';
import fr from './locales/fr';
import it from './locales/it';
import ja from './locales/ja';
import zh from './locales/zh';

i18next.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    fr: { translation: fr },
    it: { translation: it },
    zh: { translation: zh },
    ja: { translation: ja },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18next;
