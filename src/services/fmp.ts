import { fetchFromFmp } from './api';
import { 
  FMPProfile, 
  FMPIncomeStatement, 
  FMPBalanceSheet, 
  FMPKeyMetrics, 
  FMPQuote 
} from './types';
import { CompanyFinancials } from '@/types';

// Fetchers Specifici
export const fetchCompanyProfile = (symbol: string) => 
  fetchFromFmp<FMPProfile[]>(`/profile?symbol=${symbol.toUpperCase()}`);

export const fetchIncomeStatement = (symbol: string) => 
  fetchFromFmp<FMPIncomeStatement[]>(`/income-statement?symbol=${symbol.toUpperCase()}&limit=1`);

export const fetchBalanceSheet = (symbol: string) => 
  fetchFromFmp<FMPBalanceSheet[]>(`/balance-sheet-statement?symbol=${symbol.toUpperCase()}&limit=1`);

export const fetchKeyMetrics = (symbol: string) => 
  fetchFromFmp<FMPKeyMetrics[]>(`/key-metrics?symbol=${symbol.toUpperCase()}&limit=1`);

export const fetchQuote = (symbol: string) => 
  fetchFromFmp<FMPQuote[]>(`/quote?symbol=${symbol.toUpperCase()}`);

/**
 * Funzione aggregatrice che scarica tutti i dati fondamentali da FMP
 * e li mappa sull'interfaccia `CompanyFinancials` usata dalla UI.
 */
export async function getCompanyFinancials(symbol: string): Promise<Partial<CompanyFinancials>> {
  const sym = symbol.toUpperCase().trim();
  
  if (!sym) {
    throw new Error("Simbolo non valido.");
  }

  // Scarica tutti i dati in parallelo
  const [profileData, incomeData, balanceData, metricsData, quoteData] = await Promise.all([
    fetchCompanyProfile(sym),
    fetchIncomeStatement(sym),
    fetchBalanceSheet(sym),
    fetchKeyMetrics(sym),
    fetchQuote(sym),
  ]);

  // Controlla che i dati esistano (le API tornano array vuoti se il ticker non esiste)
  if (!profileData.length || !incomeData.length || !balanceData.length || !metricsData.length || !quoteData.length) {
    throw new Error(`Non è stato possibile recuperare tutti i dati finanziari per il ticker ${sym}. Verifica che esista o che sia una stock valida in USA.`);
  }

  const p = profileData[0];
  const i = incomeData[0];
  const b = balanceData[0];
  const m = metricsData[0];
  const q = quoteData[0];

  // Le FMP API tornano importi assoluti (eccetto per dati per share).
  // La UI usa "milioni" come unità di misura standard.
  const toMillions = (val: number) => val / 1000000;

  return {
    symbol: sym,
    companyName: p.companyName || q.name,
    sector: p.sector,
    industry: p.industry,
    
    // Conto Economico in milioni
    revenue: toMillions(i.revenue),
    netIncome: toMillions(i.netIncome),
    
    // Stato Patrimoniale in milioni
    totalAssets: toMillions(b.totalAssets),
    totalLiabilities: toMillions(b.totalLiabilities),
    shareholdersEquity: toMillions(b.totalStockholdersEquity),
    longTermDebt: toMillions(b.longTermDebt || 0),
    currentAssets: toMillions(b.totalCurrentAssets),
    currentLiabilities: toMillions(b.totalCurrentLiabilities),
    
    // Metriche per share
    eps: i.eps,
    bookValuePerShare: m.bookValuePerShare,
    dividendPerShare: m.dividendPerShare || 0,
    
    // Dati mercato
    currentPrice: q.price || p.price,
    sharesOutstanding: toMillions(q.sharesOutstanding), // Convertiamo in milioni anche le azioni in circolazione
    
    // Date
    reportDate: i.date // La data dell'ultimo Income Statement
  };
}

/**
 * Funzione d'utilità per i refresh batch nel portfolio
 * Prende un array di simboli, li chiama, e restituisce una mappa {symbol: currentPrice}
 */
export async function getBulkQuotes(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const uniqueSymbols = Array.from(new Set(symbols));
  
  // Fetch ogni quotazione singolarmente per rispettare i limiti del piano Free di FMP
  // (che non permette batch requests separate da virgola)
  const quotesPromises = uniqueSymbols.map(sym => fetchQuote(sym));
  const quotesResults = await Promise.all(quotesPromises);
  
  // Appiattiamo l'array di array (dato che fetchQuote torna FMPQuote[])
  const allQuotes = quotesResults.flat();
  
  const priceMap: Record<string, number> = {};
  allQuotes.forEach(q => {
    priceMap[q.symbol] = q.price;
  });

  return priceMap;
}
