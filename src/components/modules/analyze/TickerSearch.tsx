import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button, ErrorState, translateError } from '@/components/common';
import { getCompanyFinancials } from '@/services';
import { useTranslation } from '@/i18n';
import { CompanyFinancials, FieldProvenance, HistoricalMetrics } from '@/types';
import { toFullFinancials } from './toFullFinancials';

interface TickerSearchProps {
  // PR7: l'hero CARICA i dati nel pannello (bozza editabile), non analizza
  onDataLoaded: (data: CompanyFinancials, history: HistoricalMetrics[], provenance: FieldProvenance) => void;
  onSearchingChange?: (searching: boolean) => void;
}

// Hero della home Analyze: un ticker -> auto-fill FMP nel pannello dati (analisi on-demand)
export const TickerSearch: React.FC<TickerSearchProps> = ({ onDataLoaded, onSearchingChange }) => {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const handleSearch = async () => {
    const clean = symbol.trim().toUpperCase();
    if (!clean || isLoading) return;

    setIsLoading(true);
    onSearchingChange?.(true);
    setError(null);
    try {
      const result = await getCompanyFinancials(clean);
      onDataLoaded(toFullFinancials(result.financials), result.history, result.provenance);
    } catch (err) {
      setError({ message: translateError(t, err, clean) });
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
    <div className="bg-gradient-to-r from-brand-navy/85 via-primary-900/85 to-primary-700/85 backdrop-blur-xl border border-white/20 rounded-lg p-6 sm:p-8 text-white shadow-card">
      <h1 className="text-3xl font-bold mb-2">{t('analyze.heroTitle')}</h1>
      <p className="text-primary-100 mb-6">
        {t('analyze.loadHint')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('analyze.heroPlaceholder')}
          aria-label={t('analyze.heroAria')}
          className="flex-1 rounded-lg border-0 px-4 py-3 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
        />
        <Button
          onClick={handleSearch}
          disabled={!symbol.trim() || isLoading}
          size="lg"
          type="button"
          className="bg-brand-teal text-brand-navy hover:bg-primary-400 shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> {t('analyze.heroSearching')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-5 h-5" /> {t('analyze.loadButton')}
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
          />
        </div>
      )}
    </div>
  );
};
