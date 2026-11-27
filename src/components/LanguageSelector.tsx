import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation, Lang } from '@/i18n';

// Selettore lingua in nav: default EN, preferenza persistita su fa:v1:lang (PR4 i18n)
export const LanguageSelector: React.FC = () => {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('nav.language')}>
      <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
      {(['it', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`
            px-2 py-1 rounded-md text-xs font-semibold transition-colors
            ${lang === l ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
          `}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
