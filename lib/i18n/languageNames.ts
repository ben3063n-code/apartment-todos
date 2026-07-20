import type { Language } from '../models';

export const LANGUAGE_NAMES: Record<Exclude<Language, 'auto'>, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  zh: '中文',
  ja: '日本語',
};
