import { CompanyFinancials, FinancialRatios, ValueInvestingScore } from '@/types';

/**
 * Calcola tutti i ratio finanziari fondamentali
 */
export const calculateFinancialRatios = (data: CompanyFinancials): FinancialRatios => {
  const marketCap = data.currentPrice * data.sharesOutstanding;
  
  return {
    // Valutazione
    pe: data.eps !== 0 ? data.currentPrice / data.eps : 0,
    pb: data.bookValuePerShare !== 0 ? data.currentPrice / data.bookValuePerShare : 0,
    ps: data.revenue !== 0 ? marketCap / data.revenue : 0,
    
    // Profittabilità
    roe: data.shareholdersEquity !== 0 ? (data.netIncome / data.shareholdersEquity) * 100 : 0,
    roa: data.totalAssets !== 0 ? (data.netIncome / data.totalAssets) * 100 : 0,
    netProfitMargin: data.revenue !== 0 ? (data.netIncome / data.revenue) * 100 : 0,
    
    // Solidità finanziaria
    debtToEquity: data.shareholdersEquity !== 0 ? data.longTermDebt / data.shareholdersEquity : 0,
    currentRatio: data.currentLiabilities !== 0 ? data.currentAssets / data.currentLiabilities : 0,
    quickRatio: data.currentLiabilities !== 0 ? 
      (data.currentAssets - (data.currentAssets * 0.3)) / data.currentLiabilities : 0, // Stima conservativa
    
    // Dividendi
    dividendYield: data.dividendPerShare ? (data.dividendPerShare / data.currentPrice) * 100 : undefined,
    payoutRatio: data.dividendPerShare && data.eps !== 0 ? 
      (data.dividendPerShare / data.eps) * 100 : undefined,
  };
};

/**
 * Analisi Value Investing secondo i criteri di Graham e Buffett
 */
export const analyzeValueInvesting = (
  data: CompanyFinancials,
  ratios: FinancialRatios
): ValueInvestingScore => {
  const criteria = [
    {
      name: 'P/E Ratio ragionevole',
      passed: ratios.pe > 0 && ratios.pe < 15,
      value: ratios.pe.toFixed(2),
      benchmark: '< 15',
      weight: 15,
    },
    {
      name: 'P/B Ratio attraente',
      passed: ratios.pb > 0 && ratios.pb < 1.5,
      value: ratios.pb.toFixed(2),
      benchmark: '< 1.5',
      weight: 10,
    },
    {
      name: 'ROE solido',
      passed: ratios.roe >= 15,
      value: `${ratios.roe.toFixed(2)}%`,
      benchmark: '≥ 15%',
      weight: 15,
    },
    {
      name: 'Margine di profitto sano',
      passed: ratios.netProfitMargin >= 10,
      value: `${ratios.netProfitMargin.toFixed(2)}%`,
      benchmark: '≥ 10%',
      weight: 10,
    },
    {
      name: 'Debito sotto controllo',
      passed: ratios.debtToEquity < 0.5,
      value: ratios.debtToEquity.toFixed(2),
      benchmark: '< 0.5',
      weight: 20,
    },
    {
      name: 'Liquidità adeguata',
      passed: ratios.currentRatio >= 1.5,
      value: ratios.currentRatio.toFixed(2),
      benchmark: '≥ 1.5',
      weight: 15,
    },
    {
      name: 'Utili positivi',
      passed: data.eps > 0,
      value: `$${data.eps.toFixed(2)}`,
      benchmark: '> 0',
      weight: 15,
    },
  ];
  
  // Calcola score pesato
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const achievedWeight = criteria
    .filter(c => c.passed)
    .reduce((sum, c) => sum + c.weight, 0);
  
  const overallScore = (achievedWeight / totalWeight) * 100;
  
  // Determina raccomandazione
  let recommendation: ValueInvestingScore['recommendation'];
  if (overallScore >= 80) recommendation = 'strong-buy';
  else if (overallScore >= 60) recommendation = 'buy';
  else if (overallScore >= 40) recommendation = 'hold';
  else recommendation = 'avoid';
  
  // Note aggiuntive
  const notes: string[] = [];
  if (ratios.pe < 10 && ratios.pe > 0) {
    notes.push('P/E molto attraente - possibile sottovalutazione');
  }
  if (ratios.roe > 20) {
    notes.push('ROE eccellente - management efficiente');
  }
  if (ratios.debtToEquity > 1) {
    notes.push('⚠️ Livello di debito preoccupante');
  }
  if (ratios.currentRatio < 1) {
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
 * Formatta valori monetari
 */
export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
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
