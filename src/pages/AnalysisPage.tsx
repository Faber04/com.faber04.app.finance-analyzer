import React, { useEffect } from 'react';
import { useAppStore } from '@/store';
import { 
  FinancialDataInput, 
  RatiosDisplay, 
  ValueScoreDisplay 
} from '@/components/modules/fundamental-analysis';

export const AnalysisPage: React.FC = () => {
  const { currentAnalysis, currentRatios, currentScore, clearAnalysis } = useAppStore();

  useEffect(() => {
    clearAnalysis();
  }, [clearAnalysis]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analisi Fondamentale</h1>
        <p className="text-gray-600">
          Inserisci i dati di bilancio per ottenere un'analisi completa secondo i criteri di Graham e Buffett
        </p>
      </div>

      <FinancialDataInput />

      {currentRatios && currentScore && currentAnalysis && (
        <>
          <RatiosDisplay ratios={currentRatios} />
          <ValueScoreDisplay score={currentScore} />
        </>
      )}
    </div>
  );
};
