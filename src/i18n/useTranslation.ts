import { useContext } from 'react';
import { I18nContext, I18nContextValue } from './context';

// Hook custom per tradurre: const { t, lang, setLang, locale } = useTranslation();
export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
