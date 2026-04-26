// Types per l'analisi fondamentale
export interface CompanyFinancials {
  symbol: string;
  companyName: string;
  sector?: string;
  industry?: string;
  
  // Dati di bilancio
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  longTermDebt: number;
  currentAssets: number;
  currentLiabilities: number;
  
  // Dati per azione
  eps: number; // Earnings Per Share
  bookValuePerShare: number;
  dividendPerShare?: number;
  
  // Dati di mercato
  currentPrice: number;
  sharesOutstanding: number;
  
  // Date
  reportDate: string;
}

// Ratios calcolati
export interface FinancialRatios {
  // Valutazione
  pe: number; // Price to Earnings
  pb: number; // Price to Book
  ps: number; // Price to Sales
  
  // Profittabilità
  roe: number; // Return on Equity
  roa: number; // Return on Assets
  netProfitMargin: number;
  
  // Solidità finanziaria
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  
  // Dividendi
  dividendYield?: number;
  payoutRatio?: number;
}

// Analisi Graham/Buffett
export interface ValueInvestingScore {
  symbol: string;
  companyName: string;
  overallScore: number; // 0-100
  criteria: {
    name: string;
    passed: boolean;
    value: string;
    benchmark: string;
    weight: number;
  }[];
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'avoid';
  notes: string[];
}

// Portfolio
export interface PortfolioPosition {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  avgCostPerShare: number;
  currentPrice: number;
  sector?: string;
  purchaseDate: string;
  notes?: string;
}

export interface Portfolio {
  positions: PortfolioPosition[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

// Storico analisi recenti
export interface RecentAnalysis {
  id: string;
  symbol: string;
  companyName: string;
  sector?: string;
  currentPrice: number;
  overallScore: number;
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'avoid';
  analyzedAt: string; // ISO date
}

// Investment Journal
export interface JournalEntry {
  id: string;
  symbol: string;
  companyName: string;
  type: 'buy' | 'sell' | 'note';
  date: string;
  shares?: number;
  pricePerShare?: number;
  
  // Thesis di investimento
  thesis: string;
  targetPrice?: number;
  stopLoss?: number;
  
  // Retrospettiva
  outcome?: 'success' | 'failure' | 'learning';
  lessonsLearned?: string;
  
  tags?: string[];
}

// Store state
export interface AppState {
  // Analisi corrente
  currentAnalysis: CompanyFinancials | null;
  currentRatios: FinancialRatios | null;
  currentScore: ValueInvestingScore | null;

  // Storico analisi recenti
  recentAnalyses: RecentAnalysis[];
  
  // Portfolio
  portfolio: Portfolio;
  
  // Journal
  journalEntries: JournalEntry[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
}
