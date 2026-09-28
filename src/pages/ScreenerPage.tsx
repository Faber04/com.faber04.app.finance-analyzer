import React, { useState } from 'react';
import { Card, Button } from '@/components/common';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScreenerInput, ScreenerComparisonTable, ScreenerResult } from '@/components/modules/screener';
import { getCompanyFinancials } from '@/services';
import { calculateFinancialRatios, analyzeValueInvesting } from '@/utils/financial-calculations';
import { CompanyFinancials } from '@/types';

const toFullFinancials = (partial: Partial<CompanyFinancials>): CompanyFinancials => ({
  symbol: partial.symbol ?? '',
  companyName: partial.companyName ?? '',
  sector: partial.sector,
  industry: partial.industry,
  revenue: partial.revenue ?? 0,
  netIncome: partial.netIncome ?? 0,
  totalAssets: partial.totalAssets ?? 0,
  totalLiabilities: partial.totalLiabilities ?? 0,
  shareholdersEquity: partial.shareholdersEquity ?? 0,
  longTermDebt: partial.longTermDebt ?? 0,
  currentAssets: partial.currentAssets ?? 0,
  currentLiabilities: partial.currentLiabilities ?? 0,
  eps: partial.eps ?? 0,
  bookValuePerShare: partial.bookValuePerShare ?? 0,
  dividendPerShare: partial.dividendPerShare,
  currentPrice: partial.currentPrice ?? 0,
  sharesOutstanding: partial.sharesOutstanding ?? 0,
  reportDate: partial.reportDate ?? '',
});

export const ScreenerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleScreenerRun = async (symbols: string[]) => {
    setIsLoading(true);
    setResults([]);
    setErrors([]);

    const settled = await Promise.allSettled(
      symbols.map((symbol) => getCompanyFinancials(symbol))
    );

    const nextResults: ScreenerResult[] = [];
    const nextErrors: string[] = [];

    settled.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        const financials = toFullFinancials(outcome.value);
        const ratios = calculateFinancialRatios(financials);
        const score = analyzeValueInvesting(financials, ratios);
        nextResults.push({ financials, ratios, score });
      } else {
        const reason = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
        nextErrors.push(`${symbols[index]}: ${reason}`);
      }
    });

    setResults(nextResults);
    setErrors(nextErrors);
    setIsLoading(false);
  };

  const handleReset = () => {
    setResults([]);
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Screener</h1>
        <p className="text-gray-600">
          Confronta più aziende fianco a fianco con i criteri di Value Investing
        </p>
      </div>

      <ScreenerInput onScreenerRun={handleScreenerRun} isLoading={isLoading} />

      {errors.length > 0 && (
        <Card className="border border-danger-200 bg-red-50">
          <div className="flex flex-col gap-2">
            {errors.map((error) => (
              <p key={error} className="flex items-start gap-2 text-sm text-danger-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </p>
            ))}
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <div className="ui-anim-fade-slide" data-state="open">
          <ScreenerComparisonTable results={results} />
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={handleReset} type="button">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Nuovo screener
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
