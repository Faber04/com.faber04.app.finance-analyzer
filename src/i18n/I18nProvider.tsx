import React, { useMemo, useState } from 'react';
import {
  I18nContext,
  I18nContextValue,
  Lang,
  createTranslator,
  dictionaries,
  getInitialLang,
  persistLang,
} from './context';

// Provider i18n custom (PR4): default EN, preferenza persistita su fa:v1:lang
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    persistLang(next);
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[lang];
    return {
      lang,
      locale: lang === 'it' ? 'it-IT' : 'en-US',
      setLang,
      t: createTranslator(dict),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
