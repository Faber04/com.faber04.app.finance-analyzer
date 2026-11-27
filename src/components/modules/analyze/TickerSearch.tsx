import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { useAppStore } from '@/store';
import { getCompanyFinancials } from '@/services';
import { toFullFinancials } from './toFullFinancials';

interface TickerSearchProps {
  onAnalyzed?: () => void;
}

// Hero search della home Analyze: un ticker -> auto-fill FMP + Value Score in un gesto
export const TickerSearch: React.FC<TickerSearchProps> = ({ onAnalyzed }) => {
  const { setAnalysis } = useAppStore();
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const clean = symbol.trim().toUpperCase();
    if (!clean || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getCompanyFinancials(clean);
      const financials = toFullFinancials(result.financials);
      setAnalysis(financials, result.history, result.provenance);
      onAnalyzed?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante l'analisi. Verifica il ticker e l'API key."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 sm:p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Analyze</h1>
      <p className="text-primary-100 mb-6">
        Inserisci un ticker: l'app recupera i dati di bilancio e calcola il Value Score secondo i criteri Graham/Buffett
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ticker (es. AAPL)"
          aria-label="Ticker da analizzare"
          className="flex-1 rounded-lg border-0 px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
        />
        <Button
          onClick={handleSearch}
          disabled={!symbol.trim() || isLoading}
          size="lg"
          type="button"
          className="bg-white text-primary-700 hover:bg-primary-50 shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Analisi in corso...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5" /> Analizza
            </span>
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-3 flex items-start gap-2 text-sm text-red-100">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
