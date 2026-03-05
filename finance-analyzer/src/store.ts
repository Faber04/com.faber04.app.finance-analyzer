import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AppState, 
  CompanyFinancials, 
  PortfolioPosition, 
  JournalEntry 
} from '@/types';
import { calculateFinancialRatios, analyzeValueInvesting } from '@/utils/financial-calculations';

interface AppStore extends AppState {
  // Actions per analisi
  setAnalysis: (data: CompanyFinancials) => void;
  clearAnalysis: () => void;
  
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
    (set, get) => ({
      // Initial state
      currentAnalysis: null,
      currentRatios: null,
      currentScore: null,
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
      setAnalysis: (data) => {
        const ratios = calculateFinancialRatios(data);
        const score = analyzeValueInvesting(data, ratios);
        set({
          currentAnalysis: data,
          currentRatios: ratios,
          currentScore: score,
          error: null,
        });
      },

      clearAnalysis: () => {
        set({
          currentAnalysis: null,
          currentRatios: null,
          currentScore: null,
        });
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
      name: 'finance-analyzer-storage',
      partialize: (state) => ({
        portfolio: state.portfolio,
        journalEntries: state.journalEntries,
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
