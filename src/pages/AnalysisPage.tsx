import React, { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { 
  FinancialDataInput, 
  RatiosDisplay, 
  ValueScoreDisplay 
} from '@/components/modules/fundamental-analysis';

export const AnalysisPage: React.FC = () => {
  const { currentAnalysis, currentRatios, currentScore, clearAnalysis } = useAppStore();
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
    </div>
  );
};
