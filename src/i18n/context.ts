import { createContext } from 'react';
import { en, Dictionary } from './en';
import { it } from './it';

export type Lang = 'en' | 'it';

// Chiave versionata come da piano Cockpit (PR3 l'ha introdotta nel selettore, PR4 la usa per i dizionari)
export const LANG_KEY = 'fa:v1:lang';

export const dictionaries: Record<Lang, Dictionary> = { en, it };

export interface I18nContextValue {
  lang: Lang;
  locale: string; // es. 'en-US' / 'it-IT' per toLocaleDateString
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

// Traduttore custom senza librerie: fallback su EN, poi sulla chiave stessa
export function createTranslator(dict: Dictionary) {
  return (key: string, vars?: Record<string, string | number>): string => {
    let text: string = dict[key] ?? en[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.split(`{${name}}`).join(String(value));
      }
    }
    return text;
  };
}

export function getInitialLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'it' ? 'it' : 'en'; // default EN
  } catch {
    return 'en';
  }
}

export function persistLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // localStorage non disponibile: la preferenza vive solo in memoria
  }
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  locale: 'en-US',
  setLang: () => undefined,
  t: createTranslator(en),
});

// Re-export per comodità (i dizionari servono ai test/lint di parità chiavi)
export { en, it };
