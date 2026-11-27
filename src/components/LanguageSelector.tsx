import React, { useState } from 'react';
import { Globe } from 'lucide-react';

// Chiave versionata come da piano Cockpit (PR4 la userà per i dizionari i18n)
const LANG_KEY = 'fa:v1:lang';

export type Lang = 'it' | 'en';

// PR3: la UI è ancora in italiano, quindi il default resta 'it'.
// PR4 (i18n): il default diventerà 'en' e questo selettore piloterà i dizionari in src/i18n/.
const getInitialLang = (): Lang => {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'it';
  } catch {
    return 'it';
  }
};

export const LanguageSelector: React.FC = () => {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const select = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // localStorage non disponibile: la preferenza vive solo in memoria
    }
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Lingua / Language">
      <Globe className="w-4 h-4 text-gray-400 mr-1" />
      {(['it', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => select(l)}
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
