import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation, Lang } from '@/i18n';

// Selettore lingua in nav: default EN, preferenza persistita su fa:v1:lang (PR4 i18n)
export const LanguageSelector: React.FC = () => {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('nav.language')}>
      <Globe className="w-4 h-4 text-gray-400 mr-1" />
      {(['it', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`
            px-2 py-1 rounded-md text-xs font-semibold transition-colors
            ${lang === l ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}
          `}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
