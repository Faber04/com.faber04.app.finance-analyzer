import {
  CompanyFinancials,
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

/**
 * Calcola il trend multi-anno dallo storico (FMP limit=10).
 */
export const calculateHistoricalTrend = (history: HistoricalMetrics[]): HistoricalTrend => {
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
    last10.length >= 10 ? last10.every((h) => isValid(h.roe) && h.roe >= 10) : null;

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
 */
export const analyzeValueInvesting = (
  data: CompanyFinancials,
  ratios: FinancialRatios,
  historical?: HistoricalMetrics[]
): ValueInvestingScore => {
  const trend = historical ? calculateHistoricalTrend(historical) : null;
  const currency = data.currency ?? 'USD';
  const price = isValid(data.currentPrice) ? data.currentPrice : null;

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

  const criteria: ScoreCriterion[] = [
    crit(
      'EPS positivo',
      10,
      '> 0',
      isValid(data.eps) ? formatCurrency(data.eps, 2, false, currency) : 'N/A',
      !isValid(data.eps) ? 'na' : data.eps > 0 ? 'pass' : 'fail'
    ),
    crit(
      'P/E ragionevole',
      10,
      '< 15',
      ratios.pe !== null ? ratios.pe.toFixed(2) : 'N/A',
      ratios.pe === null ? 'na' : ratios.pe < 15 ? 'pass' : 'fail'
    ),
    crit(
      'P/B attraente',
      5,
      '< 1.5',
      ratios.pb !== null ? ratios.pb.toFixed(2) : 'N/A',
      ratios.pb === null ? 'na' : ratios.pb < 1.5 ? 'pass' : 'fail'
    ),
    crit(
      'P/S attraente',
      5,
      '< 3',
      ratios.ps !== null ? ratios.ps.toFixed(2) : 'N/A',
      ratios.ps === null ? 'na' : ratios.ps < 3 ? 'pass' : 'fail'
    ),
    crit(
      'ROE solido',
      10,
      '≥ 15%',
      ratios.roe !== null ? `${ratios.roe.toFixed(2)}%` : 'N/A',
      ratios.roe === null ? 'na' : ratios.roe >= 15 ? 'pass' : 'fail'
    ),
    crit(
      'ROE costante 10 anni',
      10,
      '≥ 10% in ognuno degli ultimi 10 anni',
      trend?.roeConsistent10y !== null && trend?.roeConsistent10y !== undefined
        ? `${trend.years} anni analizzati`
        : 'N/A',
      trend?.roeConsistent10y === null || trend?.roeConsistent10y === undefined
        ? 'na'
        : trend.roeConsistent10y
          ? 'pass'
          : 'fail'
    ),
    crit(
      'Margine netto sano',
      5,
      '≥ 10%',
      ratios.netProfitMargin !== null ? `${ratios.netProfitMargin.toFixed(2)}%` : 'N/A',
      ratios.netProfitMargin === null ? 'na' : ratios.netProfitMargin >= 10 ? 'pass' : 'fail'
    ),
    crit(
      'Debito sotto controllo',
      10,
      '< 0.5',
      ratios.debtToEquity !== null ? ratios.debtToEquity.toFixed(2) : 'N/A',
      ratios.debtToEquity === null ? 'na' : ratios.debtToEquity < 0.5 ? 'pass' : 'fail'
    ),
    crit(
      'Liquidità adeguata',
      5,
      '≥ 1.5',
      ratios.currentRatio !== null ? ratios.currentRatio.toFixed(2) : 'N/A',
      ratios.currentRatio === null ? 'na' : ratios.currentRatio >= 1.5 ? 'pass' : 'fail'
    ),
    crit(
      'Graham Number',
      10,
      `prezzo < √(22.5 · EPS · BVPS)`,
      grahamNumber !== null
        ? `${formatCurrency(grahamNumber, 2, false, currency)} vs ${formatCurrency(price ?? 0, 2, false, currency)}`
        : 'N/A',
      grahamNumber === null || price === null ? 'na' : price < grahamNumber ? 'pass' : 'fail'
    ),
    crit(
      'NCAV net-net',
      10,
      `prezzo < ⅔ · NCAV/share`,
      ncavThreshold !== null
        ? `${formatCurrency(ncavThreshold, 2, false, currency)} vs ${formatCurrency(price ?? 0, 2, false, currency)}`
        : 'N/A',
      ncavThreshold === null || price === null ? 'na' : price < ncavThreshold ? 'pass' : 'fail'
    ),
    crit(
      'Margin of safety vs DCF',
      10,
      '< 70% del DCF',
      isValid(data.dcf) && data.dcf > 0
        ? `${formatCurrency(0.7 * data.dcf, 2, false, currency)} vs ${formatCurrency(price ?? 0, 2, false, currency)}`
        : 'N/A',
      !isValid(data.dcf) || data.dcf <= 0 || price === null
        ? 'na'
        : price < 0.7 * data.dcf
          ? 'pass'
          : 'fail'
    ),
  ];

  // Score pesato: gli N/A sono esclusi dal totale
  const totalWeight = criteria
    .filter((c) => c.status !== 'na')
    .reduce((sum, c) => sum + c.weight, 0);
  const achievedWeight = criteria
    .filter((c) => c.status === 'pass')
    .reduce((sum, c) => sum + c.weight, 0);

  const overallScore = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;

  let recommendation: ValueInvestingScore['recommendation'];
  if (overallScore >= 80) recommendation = 'strong-buy';
  else if (overallScore >= 60) recommendation = 'buy';
  else if (overallScore >= 40) recommendation = 'hold';
  else recommendation = 'avoid';

  const notes: string[] = [];
  if (ratios.pe !== null && ratios.pe < 10) {
    notes.push('P/E molto attraente - possibile sottovalutazione');
  }
  if (ratios.roe !== null && ratios.roe > 20) {
    notes.push('ROE eccellente - management efficiente');
  }
  if (ratios.debtToEquity !== null && ratios.debtToEquity > 1) {
    notes.push('⚠️ Livello di debito preoccupante');
  }
  if (ratios.currentRatio !== null && ratios.currentRatio < 1) {
    notes.push('⚠️ Possibili problemi di liquidità a breve termine');
  }

  return {
    symbol: data.symbol,
    companyName: data.companyName,
    overallScore: Math.round(overallScore),
    criteria,
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
