import React, { useCallback, useEffect, useState } from 'react';
import { Button, ErrorState } from '@/components/common';
import { useAppStore } from '@/store';
import {
  FinancialDataInput,
  RatiosDisplay,
  VerdictCard,
} from '@/components/modules/fundamental-analysis';
import {
  ScreenerInput,
  ScreenerComparisonTable,
  ScreenerResult,
} from '@/components/modules/screener';
import { TickerSearch, RecentAnalyses, AnalysisSkeleton } from '@/components/modules/analyze';
import { toFullFinancials } from '@/components/modules/analyze/toFullFinancials';
import { getCompanyFinancials } from '@/services';
import { calculateFinancialRatios, analyzeValueInvesting } from '@/utils/financial-calculations';
import { useTranslation } from '@/i18n';
import { CheckCircle2, Search, Layers } from 'lucide-react';

type AnalyzeTab = 'single' | 'compare';

// Home "cockpit": hero search ticker + tab Single | Compare + analisi recenti
export const AnalyzePage: React.FC = () => {
  const { currentAnalysis, currentRatios, currentScore, currentProvenance, currentHistory, isLoading } = useAppStore();
  const { t } = useTranslation();
  const [tab, setTab] = useState<AnalyzeTab>('single');
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Stato del Compare mode (screener multi-azienda dentro Analyze)
  const [isScreenerLoading, setIsScreenerLoading] = useState(false);
  const [screenerResults, setScreenerResults] = useState<ScreenerResult[]>([]);
  const [screenerErrors, setScreenerErrors] = useState<string[]>([]);
  const [lastScreenerSymbols, setLastScreenerSymbols] = useState<string[]>([]);

  const hasVisibleAnalysis = Boolean(
    showResults && currentRatios && currentScore && currentAnalysis
  );

  useEffect(() => {
    // Collapse only when an analysis is actually visible.
    if (hasVisibleAnalysis) {
      setIsInputCollapsed(true);
    }
  }, [hasVisibleAnalysis]);

  const handleAnalysisSuccess = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleStartNewSearch = useCallback(() => {
    setIsInputCollapsed(false);
    // Quando si riapre il pannello input, nasconde i risultati della precedente analisi.
    setShowResults(false);
  }, []);

  const handleScreenerRun = async (symbols: string[]) => {
    setIsScreenerLoading(true);
    setScreenerResults([]);
    setScreenerErrors([]);
    setLastScreenerSymbols(symbols);

    const settled = await Promise.allSettled(
      symbols.map((symbol) => getCompanyFinancials(symbol))
    );

    const nextResults: ScreenerResult[] = [];
    const nextErrors: string[] = [];

    settled.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        const financials = toFullFinancials(outcome.value.financials);
        const ratios = calculateFinancialRatios(financials);
        const score = analyzeValueInvesting(financials, ratios, outcome.value.history);
        nextResults.push({ financials, ratios, score });
      } else {
        const reason = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
        nextErrors.push(`${symbols[index]}: ${reason}`);
      }
    });

    setScreenerResults(nextResults);
    setScreenerErrors(nextErrors);
    setIsScreenerLoading(false);
  };

  const handleScreenerReset = () => {
    setScreenerResults([]);
    setScreenerErrors([]);
  };

  // PR5: durante la ricerca hero o l'analisi del form, mostra skeleton al posto dei risultati
  const showAnalysisSkeleton = tab === 'single' && (isSearching || isLoading);

  const tabs: { id: AnalyzeTab; label: string; icon: typeof Search }[] = [
    { id: 'single', label: t('analyze.tabSingle'), icon: Search },
    { id: 'compare', label: t('analyze.tabCompare'), icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Hero search — il gesto principale dell'app */}
      <TickerSearch onAnalyzed={handleAnalysisSuccess} onSearchingChange={setIsSearching} />

      {/* Tab Single | Compare */}
      <div className="flex gap-2 border-b border-gray-200" role="tablist" aria-label={t('analyze.tabsLabel')}>
        {tabs.map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = tab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(tabItem.id)}
              type="button"
              className={`
                flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold transition-colors
                ${isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {tab === 'single' && (
        <>
          <FinancialDataInput
            isCollapsed={isInputCollapsed}
            onStartNewSearch={handleStartNewSearch}
            onAnalysisSuccess={handleAnalysisSuccess}
          />

          {showAnalysisSkeleton && <AnalysisSkeleton />}

          <div className="ui-anim-fade-slide" data-state={hasVisibleAnalysis && !showAnalysisSkeleton ? 'open' : 'closed'}>
            {currentRatios && <RatiosDisplay ratios={currentRatios} />}
          </div>

          <div
            className="ui-anim-fade-slide"
            data-state={hasVisibleAnalysis && !showAnalysisSkeleton ? 'open' : 'closed'}
            style={{ transitionDelay: hasVisibleAnalysis ? '80ms' : '0ms' }}
          >
            {currentScore && (
              <VerdictCard
                score={currentScore}
                history={currentHistory}
                reportDate={currentAnalysis?.reportDate}
                provenance={currentProvenance}
              />
            )}
          </div>
        </>
      )}

      {tab === 'compare' && (
        <>
          <ScreenerInput onScreenerRun={handleScreenerRun} isLoading={isScreenerLoading} />

          {screenerErrors.length > 0 && (
            <ErrorState
              title={t('screener.errorTitle')}
              message={screenerErrors.join(' · ')}
              onRetry={() => handleScreenerRun(lastScreenerSymbols)}
              retryLabel={t('common.retry')}
            />
          )}

          {screenerResults.length > 0 && (
            <div className="ui-anim-fade-slide" data-state="open">
              <ScreenerComparisonTable results={screenerResults} />
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" onClick={handleScreenerReset} type="button">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {t('analyze.compareNew')}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Analisi recenti — righe di servizio in fondo alla home */}
      <RecentAnalyses />
    </div>
  );
};
