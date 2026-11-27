import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, ErrorState, translateError } from '@/components/common';
import { useAppStore } from '@/store';
import { getCompanyFinancials } from '@/services';
import { FmpApiError } from '@/services/api';
import { useTranslation } from '@/i18n';
import { toFullFinancials } from './toFullFinancials';

interface TickerSearchProps {
  onAnalyzed?: () => void;
  onSearchingChange?: (searching: boolean) => void;
}

// Hero search della home Analyze: un ticker -> auto-fill FMP + Value Score in un gesto
export const TickerSearch: React.FC<TickerSearchProps> = ({ onAnalyzed, onSearchingChange }) => {
  const { setAnalysis } = useAppStore();
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isInvalidKey: boolean } | null>(null);

  const handleSearch = async () => {
    const clean = symbol.trim().toUpperCase();
    if (!clean || isLoading) return;

    setIsLoading(true);
    onSearchingChange?.(true);
    setError(null);
    try {
      const result = await getCompanyFinancials(clean);
      const financials = toFullFinancials(result.financials);
      setAnalysis(financials, result.history, result.provenance);
      onAnalyzed?.();
    } catch (err) {
      setError({
        message: translateError(t, err, clean),
        isInvalidKey: err instanceof FmpApiError && err.code === 'invalid-key',
      });
    } finally {
      setIsLoading(false);
      onSearchingChange?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-navy via-primary-900 to-primary-700 rounded-lg p-6 sm:p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">{t('analyze.heroTitle')}</h1>
      <p className="text-primary-100 mb-6">
        {t('analyze.heroSubtitle')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('analyze.heroPlaceholder')}
          aria-label={t('analyze.heroAria')}
          className="flex-1 rounded-lg border-0 px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
        />
        <Button
          onClick={handleSearch}
          disabled={!symbol.trim() || isLoading}
          size="lg"
          type="button"
          className="bg-white text-brand-navy hover:bg-primary-50 shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> {t('analyze.heroSearching')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5" /> {t('analyze.heroButton')}
            </span>
          )}
        </Button>
      </div>
      {error && (
        <div className="mt-4">
          <ErrorState
            compact
            title={t('errors.title')}
            message={error.message}
            onRetry={handleSearch}
            retryLabel={t('common.retry')}
            action={
              error.isInvalidKey ? (
                <Link
                  to="/settings"
                  className="text-sm font-semibold text-red-100 underline hover:text-white"
                >
                  {t('errors.invalidKeyAction')}
                </Link>
              ) : undefined
            }
          />
        </div>
      )}
    </div>
  );
};
