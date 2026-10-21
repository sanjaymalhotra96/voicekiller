import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from '@/i18n/locales/ar.json';
import de from '@/i18n/locales/de.json';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';
import fr from '@/i18n/locales/fr.json';
import he from '@/i18n/locales/he.json';
import it from '@/i18n/locales/it.json';
import ja from '@/i18n/locales/ja.json';
import ko from '@/i18n/locales/ko.json';
import nl from '@/i18n/locales/nl.json';
import pl from '@/i18n/locales/pl.json';
import ptBR from '@/i18n/locales/pt-BR.json';
import ptPT from '@/i18n/locales/pt-PT.json';
import sv from '@/i18n/locales/sv.json';
import tr from '@/i18n/locales/tr.json';
import vi from '@/i18n/locales/vi.json';
import zhCN from '@/i18n/locales/zh-CN.json';
import zhTW from '@/i18n/locales/zh-TW.json';

// To add a language: create locales/<code>.json with the same keys as en.json
// and register it here. The device language is picked automatically.
const resources = {
  ar: { translation: ar },
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  he: { translation: he },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  nl: { translation: nl },
  pl: { translation: pl },
  'pt-BR': { translation: ptBR },
  'pt-PT': { translation: ptPT },
  sv: { translation: sv },
  tr: { translation: tr },
  vi: { translation: vi },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
} as const;

type Language = keyof typeof resources;

const defaultLanguage: Language = 'en';
const languages = Object.keys(resources) as Language[];

function normalizeTag(tag: string) {
  const [code, rest] = tag.replace(/_/g, '-').split('-');
  if (!rest) return code.toLowerCase();
  const regionOrScript =
    rest.length === 2
      ? rest.toUpperCase()
      : rest.charAt(0).toUpperCase() + rest.slice(1).toLowerCase();
  return `${code.toLowerCase()}-${regionOrScript}`;
}

// Map device tags (zh-Hans, pt-AO) onto the locale files we ship.
function resolveLanguage(tag: string | null | undefined): Language | null {
  if (!tag) return null;
  const normalized = normalizeTag(tag);
  if (normalized in resources) return normalized as Language;

  const [code, rest] = normalized.split('-');
  if (code === 'pt') return rest && rest !== 'BR' ? 'pt-PT' : 'pt-BR';
  if (code === 'zh') {
    return rest === 'Hant' || rest === 'TW' || rest === 'HK' || rest === 'MO'
      ? 'zh-TW'
      : 'zh-CN';
  }
  if (code in resources) return code as Language;
  return languages.find(language => language.startsWith(`${code}-`)) ?? null;
}

function deviceLanguage(): Language {
  for (const locale of getLocales()) {
    const candidates = [
      locale.languageTag,
      locale.languageCode && locale.languageScriptCode
        ? `${locale.languageCode}-${locale.languageScriptCode}`
        : null,
      locale.languageCode && (locale.languageRegionCode ?? locale.regionCode)
        ? `${locale.languageCode}-${
            locale.languageRegionCode ?? locale.regionCode
          }`
        : null,
      locale.languageCode,
    ];
    for (const candidate of candidates) {
      const match = resolveLanguage(candidate);
      if (match) return match;
    }
  }
  return defaultLanguage;
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});
