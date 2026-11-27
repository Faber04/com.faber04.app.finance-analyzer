import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/i18n';

// PR8: toggle tema light/dark — classe .dark su <html>, persistenza fa:v1:theme, default = prefers-color-scheme
const THEME_KEY = 'fa:v1:theme';
type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* no storage */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch { /* no storage */ }
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-fast"
      title={t(isDark ? 'theme.light' : 'theme.dark')}
      aria-label={t('theme.toggle')}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
