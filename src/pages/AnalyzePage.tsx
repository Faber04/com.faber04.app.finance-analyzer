import React, { useCallback, useEffect, useState } from 'react';
import { Card, Button } from '@/components/common';
import { useAppStore } from '@/store';
import {
  FinancialDataInput,
  RatiosDisplay,
  ValueScoreDisplay,
} from '@/components/modules/fundamental-analysis';
import {
  ScreenerInput,
  ScreenerComparisonTable,
  ScreenerResult,
} from '@/components/modules/screener';
import { TickerSearch, RecentAnalyses } from '@/components/modules/analyze';
import { toFullFinancials } from '@/components/modules/analyze/toFullFinancials';
import { getCompanyFinancials } from '@/services';
import { calculateFinancialRatios, analyzeValueInvesting } from '@/utils/financial-calculations';
import { ProvenanceSource } from '@/types';
import { AlertCircle, CheckCircle2, Search, Layers } from 'lucide-react';

type AnalyzeTab = 'single' | 'compare';

const provenanceStyles: Record<ProvenanceSource, string> = {
  api: 'bg-success-100 text-success-800 border-success-300',
  derived: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  missing: 'bg-danger-100 text-danger-700 border-danger-300',
  manual: 'bg-gray-100 text-gray-700 border-gray-300',
};

const tabs: { id: AnalyzeTab; label: string; icon: typeof Search }[] = [
  { id: 'single', label: 'Single', icon: Search },
  { id: 'compare', label: 'Compare (≤6)', icon: Layers },
];

// Home "cockpit": hero search ticker + tab Single | Compare + analisi recenti
export const AnalyzePage: React.FC = () => {
  const { currentAnalysis, currentRatios, currentScore, currentProvenance } = useAppStore();
  const [tab, setTab] = useState<AnalyzeTab>('single');
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Stato del Compare mode (screener multi-azienda dentro Analyze)
  const [isScreenerLoading, setIsScreenerLoading] = useState(false);
  const [screenerResults, setScreenerResults] = useState<ScreenerResult[]>([]);
  const [screenerErrors, setScreenerErrors] = useState<string[]>([]);

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

  return (
    <div className="space-y-6">
      {/* Hero search — il gesto principale dell'app */}
      <TickerSearch onAnalyzed={handleAnalysisSuccess} />

      {/* Tab Single | Compare */}
      <div className="flex gap-2 border-b border-gray-200" role="tablist" aria-label="Modalità di analisi">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              type="button"
              className={`
                flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold transition-colors
                ${isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
              `}
            >
              <Icon className="w-4 h-4" />
              {t.label}
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

          <div className="ui-anim-fade-slide" data-state={hasVisibleAnalysis ? 'open' : 'closed'}>
            {currentRatios && <RatiosDisplay ratios={currentRatios} />}
          </div>

          <div
            className="ui-anim-fade-slide"
            data-state={hasVisibleAnalysis ? 'open' : 'closed'}
            style={{ transitionDelay: hasVisibleAnalysis ? '80ms' : '0ms' }}
          >
            {currentScore && <ValueScoreDisplay score={currentScore} />}
          </div>

          {hasVisibleAnalysis && currentProvenance && (
            <Card title="Provenance dati" subtitle="Origine di ogni numero: ogni valore è risalibile">
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentProvenance).map(([field, source]) => (
                  <span
                    key={field}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${provenanceStyles[source]}`}
                    title={`Fonte del campo ${field}`}
                  >
                    {field}: {source}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {tab === 'compare' && (
        <>
          <ScreenerInput onScreenerRun={handleScreenerRun} isLoading={isScreenerLoading} />

          {screenerErrors.length > 0 && (
            <Card className="border border-danger-200 bg-red-50">
              <div className="flex flex-col gap-2">
                {screenerErrors.map((error) => (
                  <p key={error} className="flex items-start gap-2 text-sm text-danger-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </p>
                ))}
              </div>
            </Card>
          )}

          {screenerResults.length > 0 && (
            <div className="ui-anim-fade-slide" data-state="open">
              <ScreenerComparisonTable results={screenerResults} />
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" onClick={handleScreenerReset} type="button">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Nuovo confronto
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
