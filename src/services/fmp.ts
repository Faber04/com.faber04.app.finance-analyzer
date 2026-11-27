import { fetchFromFmp, FmpApiError } from './api';
import {
  FMPProfile,
  FMPIncomeStatement,
  FMPBalanceSheet,
  FMPKeyMetrics,
  FMPQuote
} from './types';
import { CompanyFinancialsResult, FieldProvenance, HistoricalMetrics, ProvenanceSource } from '@/types';

// Fetchers Specifici — history con limit=10 su income-statement e key-metrics, balance-sheet resta limit=1
export const fetchCompanyProfile = (symbol: string) =>
  fetchFromFmp<FMPProfile[]>(`/profile?symbol=${symbol.toUpperCase()}`);

export const fetchIncomeStatement = (symbol: string, limit = 10) =>
  fetchFromFmp<FMPIncomeStatement[]>(`/income-statement?symbol=${symbol.toUpperCase()}&limit=${limit}`);

export const fetchBalanceSheet = (symbol: string, limit = 1) =>
  fetchFromFmp<FMPBalanceSheet[]>(`/balance-sheet-statement?symbol=${symbol.toUpperCase()}&limit=${limit}`);

export const fetchKeyMetrics = (symbol: string, limit = 10) =>
  fetchFromFmp<FMPKeyMetrics[]>(`/key-metrics?symbol=${symbol.toUpperCase()}&limit=${limit}`);

export const fetchQuote = (symbol: string) =>
  fetchFromFmp<FMPQuote[]>(`/quote?symbol=${symbol.toUpperCase()}`);

// Cache in-memory ~60s sulle quote per non bruciare il rate limit in getBulkQuotes
const QUOTE_CACHE_TTL_MS = 60_000;
const quoteCache = new Map<string, { price: number; ts: number }>();
export const clearQuoteCache = (): void => quoteCache.clear();

const isNum = (v: unknown): v is number => typeof v === 'number' && isFinite(v);
// Le FMP API tornano importi assoluti (eccetto i dati per share): la UI usa "milioni"
const toMillions = (val: number | null | undefined): number | undefined =>
  isNum(val) ? val / 1000000 : undefined;

/**
 * Funzione aggregatrice tollerante: scarica gli endpoint in parallelo con
 * allSettled e non fallisce se uno di quelli "soft" manca. L'unico errore
 * bloccante è il ticker inesistente (profile/quote vuoti) o un errore grave
 * su profile/quote (key invalida, rate limit).
 */
export async function getCompanyFinancials(symbol: string): Promise<CompanyFinancialsResult> {
  const sym = symbol.toUpperCase().trim();

  if (!sym) {
    throw new FmpApiError('unknown', 'Invalid ticker symbol.');
  }

  const [profileR, incomeR, balanceR, metricsR, quoteR] = await Promise.allSettled([
    fetchCompanyProfile(sym),
    fetchIncomeStatement(sym, 10),
    fetchBalanceSheet(sym, 1),
    fetchKeyMetrics(sym, 10),
    fetchQuote(sym),
  ]);

  const profileData = profileR.status === 'fulfilled' ? profileR.value : [];
  const quoteData = quoteR.status === 'fulfilled' ? quoteR.value : [];

  // Ticker proprio inesistente (o errore grave su profile/quote): l'unico caso che blocca
  if (!profileData.length || !quoteData.length) {
    const hardFailure = [profileR, quoteR].find((r) => r.status === 'rejected');
    if (hardFailure && hardFailure.status === 'rejected') throw hardFailure.reason;
    throw new FmpApiError(
      'not-found',
      `Ticker ${sym} not found. Check that it exists and is a valid stock.`
    );
  }

  const p = profileData[0];
  const q = quoteData[0];
  const income = incomeR.status === 'fulfilled' ? incomeR.value : [];
  const balance = balanceR.status === 'fulfilled' ? balanceR.value : [];
  const metrics = metricsR.status === 'fulfilled' ? metricsR.value : [];
  const i = income[0];
  const b = balance[0];
  const m = metrics[0];

  const provenance: FieldProvenance = {};
  const mark = (field: string, source: ProvenanceSource) => {
    provenance[field] = source;
  };

  // Fallback per campo con provenance: api = endpoint direto, derived = fallback, missing = assente
  const sharesRaw = isNum(q.sharesOutstanding) && q.sharesOutstanding > 0
    ? q.sharesOutstanding
    : isNum(i?.weightedAverageShsOutDil) && i.weightedAverageShsOutDil > 0
      ? i.weightedAverageShsOutDil
      : undefined;
  mark('sharesOutstanding', sharesRaw === undefined ? 'missing' : sharesRaw === q.sharesOutstanding ? 'api' : 'derived');

  const marketCapRaw = isNum(q.marketCap) && q.marketCap > 0
    ? q.marketCap
    : isNum(p.mktCap) && p.mktCap > 0
      ? p.mktCap
      : undefined;
  mark('marketCap', marketCapRaw === undefined ? 'missing' : marketCapRaw === q.marketCap ? 'api' : 'derived');

  const epsRaw = isNum(i?.epsdiluted) && i.epsdiluted !== 0
    ? i.epsdiluted
    : isNum(i?.eps)
      ? i.eps
      : undefined;
  mark('eps', epsRaw === undefined ? 'missing' : epsRaw === i?.epsdiluted ? 'api' : 'derived');

  const bvpsRaw = isNum(m?.bookValuePerShare) && m.bookValuePerShare !== 0
    ? m.bookValuePerShare
    : isNum(b?.totalStockholdersEquity) && isNum(sharesRaw) && sharesRaw > 0
      ? b.totalStockholdersEquity / sharesRaw
      : undefined;
  mark('bookValuePerShare', bvpsRaw === undefined ? 'missing' : bvpsRaw === m?.bookValuePerShare ? 'api' : 'derived');

  const divRaw = isNum(m?.dividendPerShare) && m.dividendPerShare > 0
    ? m.dividendPerShare
    : isNum(p.lastDiv) && p.lastDiv > 0
      ? p.lastDiv
      : undefined;
  mark('dividendPerShare', divRaw === undefined ? 'missing' : divRaw === m?.dividendPerShare ? 'api' : 'derived');

  const ltdRaw = isNum(b?.longTermDebt) && b.longTermDebt > 0
    ? b.longTermDebt
    : isNum(b?.totalDebt) && b.totalDebt > 0
      ? b.totalDebt
      : undefined;
  mark('longTermDebt', ltdRaw === undefined ? 'missing' : ltdRaw === b?.longTermDebt ? 'api' : 'derived');

  const balanceField = (key: 'totalAssets' | 'totalLiabilities' | 'shareholdersEquity' | 'currentAssets' | 'currentLiabilities' | 'inventory'): number | undefined => {
    const src =
      key === 'shareholdersEquity' ? b?.totalStockholdersEquity
      : key === 'currentAssets' ? b?.totalCurrentAssets
      : key === 'currentLiabilities' ? b?.totalCurrentLiabilities
      : b?.[key];
    const v = toMillions(src);
    mark(key, v !== undefined ? 'api' : 'missing');
    return v;
  };
  const incomeField = (key: 'revenue' | 'netIncome'): number | undefined => {
    const v = toMillions(i?.[key]);
    mark(key, v !== undefined ? 'api' : 'missing');
    return v;
  };

  mark('symbol', 'api');
  mark('companyName', 'api');
  mark('currentPrice', 'api');
  mark('currency', 'api');
  mark('dcf', isNum(p.dcf) ? 'api' : 'missing');
  mark('reportDate', i?.date ? 'api' : 'missing');

  const financials: CompanyFinancialsResult['financials'] = {
    symbol: sym,
    companyName: p.companyName || q.name,
    sector: p.sector,
    industry: p.industry,
    revenue: incomeField('revenue') ?? 0,
    netIncome: incomeField('netIncome') ?? 0,
    totalAssets: balanceField('totalAssets') ?? 0,
    totalLiabilities: balanceField('totalLiabilities') ?? 0,
    shareholdersEquity: balanceField('shareholdersEquity') ?? 0,
    longTermDebt: toMillions(ltdRaw) ?? 0,
    currentAssets: balanceField('currentAssets') ?? 0,
    currentLiabilities: balanceField('currentLiabilities') ?? 0,
    inventory: balanceField('inventory'),
    eps: epsRaw ?? 0,
    bookValuePerShare: bvpsRaw ?? 0,
    dividendPerShare: divRaw,
    currentPrice: q.price || p.price,
    sharesOutstanding: toMillions(sharesRaw) ?? 0,
    marketCap: toMillions(marketCapRaw),
    dcf: isNum(p.dcf) ? p.dcf : undefined,
    currency: p.currency || 'USD',
    reportDate: i?.date ?? '',
  };

  // Storico 10y: match income-statement ↔ key-metrics per data (i 10 più recenti)
  const metricsByDate = new Map(metrics.map((mm) => [mm.date, mm]));
  const history: HistoricalMetrics[] = income
    .map((ist) => {
      const km = metricsByDate.get(ist.date);
      return {
        date: ist.date,
        eps: isNum(ist.epsdiluted) ? ist.epsdiluted : isNum(ist.eps) ? ist.eps : null,
        roe: km && isNum(km.roe) ? km.roe : null,
        revenue: toMillions(ist.revenue) ?? null,
        netIncome: toMillions(ist.netIncome) ?? null,
        dividendPerShare: km && isNum(km.dividendPerShare) ? km.dividendPerShare : null,
        bookValuePerShare: km && isNum(km.bookValuePerShare) ? km.bookValuePerShare : null,
      };
    })
    .sort((a, b2) => b2.date.localeCompare(a.date))
    .slice(0, 10);

  return { financials, provenance, history };
}

/**
 * Refresh batch dei prezzi nel portfolio con cache in-memory ~60s:
 * un simbolo che fallisce non uccide gli altri.
 */
export async function getBulkQuotes(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));
  const now = Date.now();
  const priceMap: Record<string, number> = {};

  await Promise.all(
    uniqueSymbols.map(async (sym) => {
      const cached = quoteCache.get(sym);
      if (cached && now - cached.ts < QUOTE_CACHE_TTL_MS) {
        priceMap[sym] = cached.price;
        return;
      }
      try {
        const quotes = await fetchQuote(sym);
        if (quotes.length > 0) {
          quoteCache.set(sym, { price: quotes[0].price, ts: now });
          priceMap[sym] = quotes[0].price;
        }
      } catch {
        // simbolo non raggiungibile: saltato, gli altri continuano
      }
    })
  );

  return priceMap;
}
