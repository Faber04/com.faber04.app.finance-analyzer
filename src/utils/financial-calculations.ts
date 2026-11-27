import {
  CompanyFinancials,
  CriterionConfig,
  CriterionDirection,
  FinancialRatios,
  HistoricalMetrics,
  HistoricalTrend,
  ScoreCriterion,
  ValueInvestingScore,
} from '@/types';

const isValid = (v: number | null | undefined): v is number =>
  typeof v === 'number' && isFinite(v);

/** Divisione null-safe: mai zeri fittizi, null se un operando manca o il divisore è 0 */
const safeDiv = (a: number | null | undefined, b: number | null | undefined): number | null =>
  isValid(a) && isValid(b) && b !== 0 ? a / b : null;

/**
 * Calcola tutti i ratio finanziari fondamentali.
 * Ogni ratio è null-safe: torna null quando il dato manca, mai 0 arbitrario.
 */
export const calculateFinancialRatios = (data: CompanyFinancials): FinancialRatios => {
  // Market cap: prima da API (campo marketCap), altrimenti derivato da prezzo × azioni
  const marketCap =
    isValid(data.marketCap) && data.marketCap > 0
      ? data.marketCap
      : isValid(data.sharesOutstanding) && data.sharesOutstanding > 0 && isValid(data.currentPrice)
        ? data.currentPrice * data.sharesOutstanding
        : null;

  return {
    // Valutazione
    pe: isValid(data.eps) && data.eps > 0 ? safeDiv(data.currentPrice, data.eps) : null, // N/A se EPS ≤ 0
    pb: safeDiv(data.currentPrice, data.bookValuePerShare), // N/A se BVPS mancante
    ps: marketCap !== null ? safeDiv(marketCap, data.revenue) : null, // da marketCap, non da sharesOutstanding

    // Profittabilità
    roe: safeDiv(isValid(data.netIncome) ? data.netIncome * 100 : null, data.shareholdersEquity),
    roa: safeDiv(isValid(data.netIncome) ? data.netIncome * 100 : null, data.totalAssets),
    netProfitMargin: safeDiv(isValid(data.netIncome) ? data.netIncome * 100 : null, data.revenue),

    // Solidità finanziaria
    debtToEquity:
      isValid(data.shareholdersEquity) && data.shareholdersEquity > 0
        ? safeDiv(data.longTermDebt, data.shareholdersEquity)
        : null, // N/A se equity ≤ 0: un dato mancante non deve mai passare il test
    currentRatio: safeDiv(data.currentAssets, data.currentLiabilities),
    quickRatio:
      isValid(data.inventory)
        ? safeDiv(data.currentAssets - data.inventory, data.currentLiabilities)
        : null, // usa l'inventario reale; se manca il ratio è N/A

    // Dividendi
    dividendYield:
      isValid(data.dividendPerShare) && data.dividendPerShare > 0 && isValid(data.currentPrice) && data.currentPrice > 0
        ? (data.dividendPerShare / data.currentPrice) * 100
        : null,
    payoutRatio:
      isValid(data.dividendPerShare) && data.dividendPerShare > 0 && isValid(data.eps) && data.eps > 0
        ? (data.dividendPerShare / data.eps) * 100
        : null,
  };
};

// Soglie di default del Value Score v2 (PR7: editabili da UI, default = questi)
export const DEFAULT_CRITERIA: CriterionConfig[] = [
  { id: 'eps', nameKey: 'criteria.eps', weight: 10, threshold: 0, direction: 'gt', editable: true },
  { id: 'pe', nameKey: 'criteria.pe', weight: 10, threshold: 15, direction: 'lt', editable: true },
  { id: 'pb', nameKey: 'criteria.pb', weight: 5, threshold: 1.5, direction: 'lt', editable: true },
  { id: 'ps', nameKey: 'criteria.ps', weight: 5, threshold: 3, direction: 'lt', editable: true },
  { id: 'roe', nameKey: 'criteria.roe', weight: 10, threshold: 15, direction: 'ge', unit: '%', editable: true },
  { id: 'roe10y', nameKey: 'criteria.roe10y', weight: 10, threshold: 10, direction: 'ge', unit: '%', editable: true },
  { id: 'netMargin', nameKey: 'criteria.netMargin', weight: 5, threshold: 10, direction: 'ge', unit: '%', editable: true },
  { id: 'de', nameKey: 'criteria.de', weight: 10, threshold: 0.5, direction: 'lt', editable: true },
  { id: 'current', nameKey: 'criteria.current', weight: 5, threshold: 1.5, direction: 'ge', editable: true },
  { id: 'graham', nameKey: 'criteria.graham', weight: 10, threshold: null, direction: 'lt', editable: false },
  { id: 'ncav', nameKey: 'criteria.ncav', weight: 10, threshold: null, direction: 'lt', editable: false },
  { id: 'dcf', nameKey: 'criteria.dcf', weight: 10, threshold: null, direction: 'lt', editable: false },
];

const DIRECTION_SYMBOL: Record<CriterionDirection, string> = { gt: '>', ge: '≥', lt: '<', le: '≤' };

const compare = (value: number, direction: CriterionDirection, threshold: number): boolean => {
  switch (direction) {
    case 'gt': return value > threshold;
    case 'ge': return value >= threshold;
    case 'lt': return value < threshold;
    case 'le': return value <= threshold;
  }
};

/**
 * Calcola il trend multi-anno dallo storico (FMP limit=10).
 */
export const calculateHistoricalTrend = (history: HistoricalMetrics[], minRoe: number = 10): HistoricalTrend => {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const years = sorted.length;
  const first = sorted[0];
  const last = sorted[years - 1];

  let epsCagr: number | null = null;
  if (years > 1 && isValid(first?.eps) && isValid(last?.eps) && first.eps > 0 && last.eps > 0) {
    epsCagr = (Math.pow(last.eps / first.eps, 1 / (years - 1)) - 1) * 100;
  }

  const roeByYear = sorted
    .filter((h) => isValid(h.roe))
    .map((h) => ({ year: h.date.slice(0, 4), roe: h.roe as number }));

  const last10 = sorted.slice(-10);
  const roeConsistent10y =
    last10.length >= 10 ? last10.every((h) => isValid(h.roe) && h.roe >= minRoe) : null;

  return { years, epsCagr, roeByYear, roeConsistent10y };
};

const crit = (
  name: string,
  weight: number,
  benchmark: string,
  value: string,
  status: ScoreCriterion['status']
): ScoreCriterion => ({ name, status, value, benchmark, weight });

/**
 * Value Score v2 — criteri Graham/Buffett pesati (somma 100).
 * Gli N/A sono esclusi dal totale: un dato mancante non fa mai passare né fallire il criterio.
 * PR7: `criteria` è configurabile (soglie/pesi editabili da UI); default = DEFAULT_CRITERIA.
 */
export const analyzeValueInvesting = (
  data: CompanyFinancials,
  ratios: FinancialRatios,
  historical?: HistoricalMetrics[],
  criteria: CriterionConfig[] = DEFAULT_CRITERIA
): ValueInvestingScore => {
  const roe10yMin = criteria.find((c) => c.id === 'roe10y')?.threshold ?? 10;
  const trend = historical ? calculateHistoricalTrend(historical, roe10yMin) : null;
  const currency = data.currency ?? 'USD';
  const price = isValid(data.currentPrice) ? data.currentPrice : null;
  const fmtC = (v: number | null): string => (v === null ? 'N/A' : formatCurrency(v, 2, false, currency));

  // Graham Number: √(22.5 · EPS · BVPS), valido solo con EPS > 0 e BVPS > 0
  const grahamNumber =
    isValid(data.eps) && data.eps > 0 && isValid(data.bookValuePerShare) && data.bookValuePerShare > 0
      ? Math.sqrt(22.5 * data.eps * data.bookValuePerShare)
      : null;

  // NCAV net-net per azione: ⅔ · (currentAssets − totalLiabilities) / shares
  const ncavPerShare =
    isValid(data.sharesOutstanding) && data.sharesOutstanding > 0
      ? safeDiv(data.currentAssets - data.totalLiabilities, data.sharesOutstanding)
      : null;
  const ncavThreshold = ncavPerShare !== null ? (2 / 3) * ncavPerShare : null;

  // Valore numerico grezzo per ogni criterio (null = N/A)
  const rawValue: Record<string, number | null> = {
    eps: isValid(data.eps) ? data.eps : null,
    pe: ratios.pe,
    pb: ratios.pb,
    ps: ratios.ps,
    roe: ratios.roe,
    netMargin: ratios.netProfitMargin,
    de: ratios.debtToEquity,
    current: ratios.currentRatio,
    // criteri derivati: rapporto prezzo/soglia (pass se < 1)
    graham: price !== null && grahamNumber !== null && grahamNumber > 0 ? price / grahamNumber : null,
    ncav: price !== null && ncavThreshold !== null && ncavThreshold > 0 ? price / ncavThreshold : null,
    dcf: price !== null && isValid(data.dcf) && data.dcf > 0 ? price / (0.7 * data.dcf) : null,
  };

  const criteriaOut: ScoreCriterion[] = criteria.map((cfg) => {
    // ROE 10y: il confronto avviene dentro calculateHistoricalTrend (soglia minRoe editabile)
    if (cfg.id === 'roe10y') {
      const ok = trend?.roeConsistent10y;
      return crit(
        cfg.nameKey,
        cfg.weight,
        `≥ ${cfg.threshold ?? 10}% ogni anno`,
        ok === null || ok === undefined ? 'N/A' : `${trend?.years ?? 0} anni analizzati`,
        ok === null || ok === undefined ? 'na' : ok ? 'pass' : 'fail'
      );
    }

    let status: ScoreCriterion['status'];
    let valueStr: string;
    let benchmarkStr: string;

    if (cfg.id === 'graham' || cfg.id === 'ncav' || cfg.id === 'dcf') {
      // criteri derivati: confronto diretto prezzo vs soglia calcolata dai dati
      const derived =
        cfg.id === 'graham' ? grahamNumber
        : cfg.id === 'ncav' ? ncavThreshold
        : isValid(data.dcf) && data.dcf > 0 ? 0.7 * data.dcf
        : null;
      if (price === null || derived === null) status = 'na';
      else if (derived <= 0) status = 'fail'; // soglia derivata ≤ 0: il prezzo non può stare sotto
      else status = price < derived ? 'pass' : 'fail';
      valueStr = derived !== null && price !== null ? `${fmtC(derived)} vs ${fmtC(price)}` : 'N/A';
      benchmarkStr =
        cfg.id === 'graham' ? 'prezzo < √(22.5·EPS·BVPS)'
        : cfg.id === 'ncav' ? 'prezzo < ⅔·NCAV/share'
        : 'prezzo < 70% DCF';
    } else {
      const value = rawValue[cfg.id] ?? null;
      status = value === null ? 'na' : compare(value, cfg.direction, cfg.threshold ?? 1) ? 'pass' : 'fail';
      valueStr =
        cfg.unit === '%' ? (value !== null ? `${value.toFixed(2)}%` : 'N/A')
        : cfg.id === 'eps' ? fmtC(value)
        : value !== null ? value.toFixed(2) : 'N/A';
      benchmarkStr = `${DIRECTION_SYMBOL[cfg.direction]} ${cfg.threshold}${cfg.unit === '%' ? '%' : ''}`;
    }

    return crit(cfg.nameKey, cfg.weight, benchmarkStr, valueStr, status);
  });
  const scoreCriteria: ScoreCriterion[] = criteriaOut;

  // Score pesato: gli N/A sono esclusi dal totale
  const totalWeight = scoreCriteria
    .filter((c) => c.status !== 'na')
    .reduce((sum, c) => sum + c.weight, 0);
  const achievedWeight = scoreCriteria
    .filter((c) => c.status === 'pass')
    .reduce((sum, c) => sum + c.weight, 0);

  const overallScore = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;

  let recommendation: ValueInvestingScore['recommendation'];
  if (overallScore >= 80) recommendation = 'strong-buy';
  else if (overallScore >= 60) recommendation = 'buy';
  else if (overallScore >= 40) recommendation = 'hold';
  else recommendation = 'avoid';

  // le note sono chiavi i18n (notes.*), tradotte in UI
  const notes: string[] = [];
  if (ratios.pe !== null && ratios.pe < 10) {
    notes.push('notes.peLow');
  }
  if (ratios.roe !== null && ratios.roe > 20) {
    notes.push('notes.roeHigh');
  }
  if (ratios.debtToEquity !== null && ratios.debtToEquity > 1) {
    notes.push('notes.debtHigh');
  }
  if (ratios.currentRatio !== null && ratios.currentRatio < 1) {
    notes.push('notes.liquidityLow');
  }

  return {
    symbol: data.symbol,
    companyName: data.companyName,
    overallScore: Math.round(overallScore),
    criteria: scoreCriteria,
    recommendation,
    notes,
  };
};

/**
 * Formatta valori monetari nella valuta dichiarata (default EUR per il portfolio;
 * per i dati del titolo passare la valuta del titolo, es. 'USD').
 */
export const formatCurrency = (
  value: number,
  decimals: number = 2,
  includeSign: boolean = false,
  currency: string = 'EUR'
): string => {
  const formatted = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  if (includeSign && value >= 0) {
    return `+${formatted}`;
  }
  return formatted;
};

/**
 * Formatta percentuali
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Formatta numeri grandi (es. market cap)
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};
