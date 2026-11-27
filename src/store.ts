import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState,
  CompanyFinancials,
  CriterionConfig,
  FieldProvenance,
  HistoricalMetrics,
  PortfolioPosition,
  JournalEntry,
  RecentAnalysis
} from '@/types';
import { calculateFinancialRatios, analyzeValueInvesting } from '@/utils/financial-calculations';

// localStorage versionata fa:v1:* — migrazione best-effort dalla chiave legacy
const STORAGE_KEY = 'fa:v1:app';
const LEGACY_STORAGE_KEY = 'com.faber04.finance-analyzer-storage';

function migrateLegacyStorage(): void {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      const parsed = JSON.parse(raw);
      const legacyState = parsed?.state ?? parsed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: legacyState, version: 1 }));
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // migrazione best-effort: in caso di errore si riparte da zero
  }
}
migrateLegacyStorage();

interface AppStore extends AppState {
  // Actions per analisi (PR7: criteria opzionali, default DEFAULT_CRITERIA)
  setAnalysis: (data: CompanyFinancials, history?: HistoricalMetrics[], provenance?: FieldProvenance, criteria?: CriterionConfig[]) => void;
  clearAnalysis: () => void;
  removeRecentAnalysis: (id: string) => void;
  
  // Actions per portfolio
  addPosition: (position: Omit<PortfolioPosition, 'id'>) => void;
  updatePosition: (id: string, updates: Partial<PortfolioPosition>) => void;
  removePosition: (id: string) => void;
  updatePortfolioPrice: (symbol: string, newPrice: number) => void;
  
  // Actions per journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;
  
  // Actions per UI
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      currentAnalysis: null,
      currentRatios: null,
      currentScore: null,
      currentProvenance: null,
      currentHistory: null,
      recentAnalyses: [],
      portfolio: {
        positions: [],
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      },
      journalEntries: [],
      isLoading: false,
      error: null,

      // Analisi
      setAnalysis: (data, history, provenance, criteria) => {
        const ratios = calculateFinancialRatios(data);
        const score = analyzeValueInvesting(data, ratios, history, criteria);

        const newEntry: RecentAnalysis = {
          id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          symbol: data.symbol,
          companyName: data.companyName,
          sector: data.sector,
          currentPrice: data.currentPrice,
          overallScore: score.overallScore,
          recommendation: score.recommendation,
          analyzedAt: new Date().toISOString(),
        };

        set((state) => {
          // Rimuovi eventuale voce precedente per lo stesso symbol, poi aggiungi in cima (max 10)
          const filtered = state.recentAnalyses.filter((a) => a.symbol !== data.symbol);
          const updated = [newEntry, ...filtered].slice(0, 10);
          return {
            currentAnalysis: data,
            currentRatios: ratios,
            currentScore: score,
            currentProvenance: provenance ?? null,
            currentHistory: history ?? null,
            recentAnalyses: updated,
            error: null,
          };
        });
      },

      clearAnalysis: () => {
        set({
          currentAnalysis: null,
          currentRatios: null,
          currentScore: null,
          currentProvenance: null,
          currentHistory: null,
        });
      },

      removeRecentAnalysis: (id) => {
        set((state) => ({
          recentAnalyses: state.recentAnalyses.filter((a) => a.id !== id),
        }));
      },

      // Portfolio
      addPosition: (position) => {
        const id = `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPosition = { ...position, id };
        
        set((state) => {
          const positions = [...state.portfolio.positions, newPosition];
          return {
            portfolio: calculatePortfolioTotals(positions),
          };
        });
      },

      updatePosition: (id, updates) => {
        set((state) => {
          const positions = state.portfolio.positions.map((pos) =>
            pos.id === id ? { ...pos, ...updates } : pos
          );
          return {
            portfolio: calculatePortfolioTotals(positions),
          };
        });
      },

      removePosition: (id) => {
        set((state) => {
          const positions = state.portfolio.positions.filter((pos) => pos.id !== id);
          return {
            portfolio: calculatePortfolioTotals(positions),
          };
        });
      },

      updatePortfolioPrice: (symbol, newPrice) => {
        set((state) => {
          const positions = state.portfolio.positions.map((pos) =>
            pos.symbol === symbol ? { ...pos, currentPrice: newPrice } : pos
          );
          return {
            portfolio: calculatePortfolioTotals(positions),
          };
        });
      },

      // Journal
      addJournalEntry: (entry) => {
        const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          journalEntries: [{ ...entry, id }, ...state.journalEntries],
        }));
      },

      updateJournalEntry: (id, updates) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      removeJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
        }));
      },

      // UI
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        portfolio: state.portfolio,
        journalEntries: state.journalEntries,
        recentAnalyses: state.recentAnalyses,
      }),
    }
  )
);

// Helper per calcolare i totali del portfolio
function calculatePortfolioTotals(positions: PortfolioPosition[]) {
  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.shares * pos.currentPrice,
    0
  );
  const totalCost = positions.reduce(
    (sum, pos) => sum + pos.shares * pos.avgCostPerShare,
    0
  );
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    positions,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
  };
}
