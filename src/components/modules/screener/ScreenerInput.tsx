import React, { useState } from 'react';
import { Card, Button } from '@/components/common';
import { Plus, X, Search, Loader2 } from 'lucide-react';

interface ScreenerInputProps {
  onScreenerRun: (symbols: string[]) => void;
  isLoading: boolean;
}

export const ScreenerInput: React.FC<ScreenerInputProps> = ({
  onScreenerRun,
  isLoading,
}) => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const addSymbol = () => {
    const value = currentInput.trim().toUpperCase();
    if (!value) return;
    if (!symbols.includes(value) && symbols.length < 6) {
      setSymbols([...symbols, value]);
    }
    setCurrentInput('');
  };

  const removeSymbol = (symbol: string) => {
    setSymbols(symbols.filter((s) => s !== symbol));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSymbol();
    }
  };

  const handleSubmit = () => {
    if (symbols.length === 0) return;
    onScreenerRun(symbols);
  };

  return (
    <Card
      title="Screener Multi-Azienda"
      subtitle="Confronta fino a 6 aziende secondo i criteri Graham/Buffett"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Inserisci un ticker (es. AAPL) e premi Invio"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={symbols.length >= 6}
          />
          <Button
            variant="secondary"
            onClick={addSymbol}
            disabled={symbols.length >= 6}
            type="button"
          >
            <span className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Aggiungi
            </span>
          </Button>
        </div>

        {symbols.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {symbols.map((symbol) => (
              <span
                key={symbol}
                className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold"
              >
                {symbol}
                <button
                  onClick={() => removeSymbol(symbol)}
                  className="text-primary-600 hover:text-primary-800"
                  aria-label={`Rimuovi ${symbol}`}
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={symbols.length === 0 || isLoading}
            type="button"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Analisi in corso...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" /> Avvia Screener
              </span>
            )}
          </Button>
          <span className="text-sm text-gray-500">
            {symbols.length}/6 aziende selezionate
          </span>
        </div>
      </div>
    </Card>
  );
};
