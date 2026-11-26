import React, { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Card } from '@/components/common';
import {
  FinancialDataInput,
  RatiosDisplay,
  ValueScoreDisplay
} from '@/components/modules/fundamental-analysis';
import { ProvenanceSource } from '@/types';

const provenanceStyles: Record<ProvenanceSource, string> = {
  api: 'bg-success-100 text-success-800 border-success-300',
  derived: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  missing: 'bg-danger-100 text-danger-700 border-danger-300',
  manual: 'bg-gray-100 text-gray-700 border-gray-300',
};

export const AnalysisPage: React.FC = () => {
  const { currentAnalysis, currentRatios, currentScore, currentProvenance, clearAnalysis } = useAppStore();
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    clearAnalysis();
    setIsInputCollapsed(false);
    setShowResults(false);
  }, [clearAnalysis]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analisi Fondamentale</h1>
        <p className="text-gray-600">
          Inserisci i dati di bilancio per ottenere un'analisi completa secondo i criteri di Graham e Buffett
        </p>
      </div>

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
    </div>
  );
};
