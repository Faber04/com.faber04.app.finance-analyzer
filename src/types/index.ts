// Types per l'analisi fondamentale
export interface CompanyFinancials {
  symbol: string;
  companyName: string;
  sector?: string;
  industry?: string;

  // Dati di bilancio (in milioni, come da UI)
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  longTermDebt: number;
  currentAssets: number;
  currentLiabilities: number;
  inventory?: number; // in milioni; se mancante il quickRatio è N/A

  // Dati per azione
  eps: number; // Earnings Per Share
  bookValuePerShare: number;
  dividendPerShare?: number;

  // Dati di mercato
  currentPrice: number;
  sharesOutstanding: number; // in milioni
  marketCap?: number; // in milioni; se presente il P/S si calcula da qui, non dalle azioni
  dcf?: number; // DCF per azione (FMP profile.dcf)
  currency?: string; // valuta del titolo (es. 'USD')

  // Date
  reportDate: string;
}

// Ratios calcolati: null-safe, mai zeri fittizi (null = dato mancante/non calcolabile)
export interface FinancialRatios {
  // Valutazione
  pe: number | null; // Price to Earnings (null se EPS <= 0)
  pb: number | null; // Price to Book (null se BVPS mancante)
  ps: number | null; // Price to Sales (da marketCap, non da sharesOutstanding)

  // Profittabilità
  roe: number | null; // Return on Equity %
  roa: number | null; // Return on Assets %
  netProfitMargin: number | null;

  // Solidità finanziaria
  debtToEquity: number | null; // null se equity <= 0: un dato mancante non deve mai passare il test
  currentRatio: number | null;
  quickRatio: number | null; // usa l'inventario reale, non una stima

  // Dividendi
  dividendYield?: number | null;
  payoutRatio?: number | null;
}

// Metriche storiche per anno (trend multi-anno, popolato da FMP con limit=10)
export interface HistoricalMetrics {
  date: string; // ISO date dell'anno fiscale
  eps: number | null;
  roe: number | null; // ROE % dell'anno
  revenue: number | null; // in milioni
  netIncome: number | null; // in milioni
  dividendPerShare: number | null;
  bookValuePerShare: number | null;
}

// Trend calcolato dallo storico
export interface HistoricalTrend {
  years: number;
  epsCagr: number | null; // CAGR EPS % primo -> ultimo anno
  roeByYear: { year: string; roe: number }[];
  roeConsistent10y: boolean | null; // true se ROE >= 10% in ognuno degli ultimi 10 anni; null se anni < 10
}

export type CriterionStatus = 'pass' | 'fail' | 'na';

export interface ScoreCriterion {
  name: string;
  status: CriterionStatus;
  value: string;
  benchmark: string;
  weight: number;
}

// Config di un criterio di valutazione editabile dall'utente (PR7):
// threshold null = derivato dai dati (Graham Number, NCAV, DCF), non editabile
export type CriterionDirection = 'gt' | 'ge' | 'lt' | 'le';

export interface CriterionConfig {
  id: string;
  nameKey: string; // chiave i18n per il nome (criteria.*)
  weight: number;
  threshold: number | null;
  direction: CriterionDirection;
  unit?: '%' | 'currency';
  editable: boolean;
}

// Analisi Graham/Buffett (Value Score v2)
export interface ValueInvestingScore {
  symbol: string;
  companyName: string;
  overallScore: number; // 0-100, N/A esclusi dal totale
  criteria: ScoreCriterion[];
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

// Provenance di ogni campo: api = preso dall'API, derived = calcolato/fallback, missing = assente, manual = inserito a mano
export type ProvenanceSource = 'api' | 'derived' | 'missing' | 'manual';
export type FieldProvenance = Record<string, ProvenanceSource>;

// Risultato dell'auto-fill FMP: dati + provenance + storico 10y
export interface CompanyFinancialsResult {
  financials: Partial<CompanyFinancials>;
  provenance: FieldProvenance;
  history: HistoricalMetrics[];
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
  currentProvenance: FieldProvenance | null;
  currentHistory: HistoricalMetrics[] | null;

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
