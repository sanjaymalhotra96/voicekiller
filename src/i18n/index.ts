import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';

// To add a language: create locales/<code>.json with the same keys as en.json
// and register it here. The device language is picked automatically.
const resources = {
  en: { translation: en },
} as const;

type Language = keyof typeof resources;

const defaultLanguage: Language = 'en';

function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code && code in resources ? (code as Language) : defaultLanguage;
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});

