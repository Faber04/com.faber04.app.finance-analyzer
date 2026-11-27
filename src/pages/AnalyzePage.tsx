import React, { useState } from 'react';
import { Button, EmptyState, ErrorState } from '@/components/common';
import { useAppStore } from '@/store';
import { RatiosDisplay, VerdictCard } from '@/components/modules/fundamental-analysis';
import {
  ScreenerInput,
  ScreenerComparisonTable,
  ScreenerResult,
} from '@/components/modules/screener';
import {
  TickerSearch,
  AnalysisSkeleton,
  FinancialsPanel,
  CriteriaPanel,
} from '@/components/modules/analyze';
import { toFullFinancials } from '@/components/modules/analyze/toFullFinancials';
import { getCompanyFinancials } from '@/services';
import { calculateFinancialRatios, analyzeValueInvesting, DEFAULT_CRITERIA } from '@/utils/financial-calculations';
import { useTranslation } from '@/i18n';
import {
  CompanyFinancials,
  CriterionConfig,
  FieldProvenance,
  HistoricalMetrics,
} from '@/types';
import { CheckCircle2, Search, Layers, Play, RotateCcw } from 'lucide-react';

type AnalyzeTab = 'single' | 'compare';

// PR7: home Analyze = hero "Carica dati" -> unico pannello dati editabili + criteri editabili -> "Analizza" on-demand
const emptyDraft = (): CompanyFinancials => ({
  symbol: '',
  companyName: '',
  sector: '',
  industry: '',
  revenue: 0,
  netIncome: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  shareholdersEquity: 0,
  longTermDebt: 0,
  currentAssets: 0,
  currentLiabilities: 0,
  inventory: 0,
  eps: 0,
  bookValuePerShare: 0,
  dividendPerShare: 0,
  currentPrice: 0,
  sharesOutstanding: 0,
  marketCap: 0,
  dcf: 0,
  currency: 'USD',
  reportDate: new Date().toISOString().split('T')[0],
});

export const AnalyzePage: React.FC = () => {
  const {
    currentAnalysis,
    currentRatios,
    currentScore,
    currentProvenance,
    currentHistory,
    isLoading,
    setAnalysis,
  } = useAppStore();
  const { t } = useTranslation();
  const [tab, setTab] = useState<AnalyzeTab>('single');
  const [isSearching, setIsSearching] = useState(false);

  // Bozza editabile: popolata dall'hero (FMP) o a mano; l'analisi parte solo su "Analizza"
  const [draft, setDraft] = useState<CompanyFinancials | null>(null);
  const [draftHistory, setDraftHistory] = useState<HistoricalMetrics[] | undefined>(undefined);
  const [draftProvenance, setDraftProvenance] = useState<FieldProvenance | null>(null);
  const [criteria, setCriteria] = useState<CriterionConfig[]>(DEFAULT_CRITERIA);
  const [showResults, setShowResults] = useState(false);

  // Stato del Compare mode (screener multi-azienda dentro Analyze)
  const [isScreenerLoading, setIsScreenerLoading] = useState(false);
  const [screenerResults, setScreenerResults] = useState<ScreenerResult[]>([]);
  const [screenerErrors, setScreenerErrors] = useState<string[]>([]);
  const [lastScreenerSymbols, setLastScreenerSymbols] = useState<string[]>([]);

  const hasVisibleAnalysis = Boolean(showResults && currentRatios && currentScore && currentAnalysis);
  const showAnalysisSkeleton = tab === 'single' && (isSearching || isLoading);

  const handleDataLoaded = (data: CompanyFinancials, history: HistoricalMetrics[], provenance: FieldProvenance) => {
    setDraft(data);
    setDraftHistory(history);
    setDraftProvenance(provenance);
    setShowResults(false);
  };

  const handleManualEntry = () => {
    setDraft(emptyDraft());
    setDraftHistory(undefined);
    setDraftProvenance(null);
    setShowResults(false);
  };

  const handleAnalyze = () => {
    if (!draft) return;
    setAnalysis(draft, draftHistory, draftProvenance ?? undefined, criteria);
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setDraft(null);
    setDraftHistory(undefined);
    setDraftProvenance(null);
    setShowResults(false);
  };

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

  const tabs: { id: AnalyzeTab; label: string; icon: typeof Search }[] = [
    { id: 'single', label: t('analyze.tabSingle'), icon: Search },
    { id: 'compare', label: t('analyze.tabCompare'), icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Hero: carica i dati nel pannello (non analizza) */}
      <TickerSearch onDataLoaded={handleDataLoaded} onSearchingChange={setIsSearching} />

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
          {showAnalysisSkeleton && <AnalysisSkeleton />}

          {!showAnalysisSkeleton && !draft && (
            <EmptyState
              icon={Search}
              title={t('analyze.emptyTitle')}
              text={t('analyze.emptyText')}
              action={
                <Button onClick={handleManualEntry} type="button" variant="secondary">
                  {t('analyze.manualEntry')}
                </Button>
              }
            />
          )}

          {!showAnalysisSkeleton && draft && (
            <>
              <FinancialsPanel
                value={draft}
                onChange={(patch) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev))}
              />
              <CriteriaPanel value={criteria} onChange={setCriteria} />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleNewSearch} type="button">
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> {t('form.newSearch')}
                  </span>
                </Button>
                <Button onClick={handleAnalyze} type="button" size="lg">
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" /> {t('form.analyze')}
                  </span>
                </Button>
              </div>
            </>
          )}

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

    </div>
  );
};
