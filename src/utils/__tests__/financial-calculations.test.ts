import { describe, expect, it } from 'vitest';
import {
  analyzeValueInvesting,
  calculateFinancialRatios,
  calculateHistoricalTrend,
  formatCurrency,
} from '@/utils/financial-calculations';
import { CompanyFinancials, HistoricalMetrics } from '@/types';

const baseFinancials: CompanyFinancials = {
  symbol: 'TEST',
  companyName: 'Test Corp',
  revenue: 1000,
  netIncome: 100,
  totalAssets: 2000,
  totalLiabilities: 800,
  shareholdersEquity: 1200,
  longTermDebt: 300,
  currentAssets: 600,
  currentLiabilities: 300,
  inventory: 100,
  eps: 5,
  bookValuePerShare: 20,
  dividendPerShare: 1,
  currentPrice: 40,
  sharesOutstanding: 20,
  marketCap: 800,
  dcf: 100,
  currency: 'USD',
  reportDate: '2026-12-31',
};

describe('calculateFinancialRatios — null-safe', () => {
  it('calcola i ratio con dati validi', () => {
    const r = calculateFinancialRatios(baseFinancials);
    expect(r.pe).toBeCloseTo(8); // 40 / 5
    expect(r.pb).toBeCloseTo(2); // 40 / 20
    expect(r.ps).toBeCloseTo(0.8); // marketCap 800 / revenue 1000
    expect(r.roe).toBeCloseTo(100 * 100 / 1200);
    expect(r.debtToEquity).toBeCloseTo(0.25);
    expect(r.currentRatio).toBeCloseTo(2);
    expect(r.quickRatio).toBeCloseTo((600 - 100) / 300); // usa l'inventario reale, non il 30% arbitrario
  });

  it('pe è null con EPS zero o negativo (mai un valore negativo valido)', () => {
    expect(calculateFinancialRatios({ ...baseFinancials, eps: 0 }).pe).toBeNull();
    expect(calculateFinancialRatios({ ...baseFinancials, eps: -2 }).pe).toBeNull();
  });

  it('pb è null se BVPS manca (0)', () => {
    expect(calculateFinancialRatios({ ...baseFinancials, bookValuePerShare: 0 }).pb).toBeNull();
  });

  it('ps usa marketCap quando presente, non sharesOutstanding', () => {
    const r = calculateFinancialRatios({ ...baseFinancials, sharesOutstanding: 0, marketCap: 900 });
    expect(r.ps).toBeCloseTo(0.9); // 900 / 1000, non 0
  });

  it('ps deriva da price × shares solo se marketCap manca', () => {
    const noMc = { ...baseFinancials, marketCap: undefined };
    const r = calculateFinancialRatios(noMc);
    expect(r.ps).toBeCloseTo((40 * 20) / 1000); // 0.8
  });

  it('ps è null se mancano sia marketCap sia shares', () => {
    const r = calculateFinancialRatios({ ...baseFinancials, marketCap: undefined, sharesOutstanding: 0 });
    expect(r.ps).toBeNull();
  });

  it('debtToEquity è null se equity è 0 o negativa (mai pass con dato mancante)', () => {
    expect(calculateFinancialRatios({ ...baseFinancials, shareholdersEquity: 0 }).debtToEquity).toBeNull();
    expect(calculateFinancialRatios({ ...baseFinancials, shareholdersEquity: -50 }).debtToEquity).toBeNull();
  });

  it('roe è null se equity è 0', () => {
    expect(calculateFinancialRatios({ ...baseFinancials, shareholdersEquity: 0 }).roe).toBeNull();
  });

  it('currentRatio è null se currentLiabilities è 0', () => {
    expect(calculateFinancialRatios({ ...baseFinancials, currentLiabilities: 0 }).currentRatio).toBeNull();
  });

  it('quickRatio è null se manca inventory o currentLiabilities', () => {
    expect(
      calculateFinancialRatios({ ...baseFinancials, inventory: undefined }).quickRatio
    ).toBeNull();
    expect(
      calculateFinancialRatios({ ...baseFinancials, currentLiabilities: 0 }).quickRatio
    ).toBeNull();
  });

  it('dividendYield è null senza dividendo', () => {
    expect(calculateFinancialRatios({ ...baseFinancials, dividendPerShare: 0 }).dividendYield).toBeNull();
  });
});

describe('analyzeValueInvesting — Value Score v2', () => {
  it('i pesi dei criteri sommano 100', () => {
    const score = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials));
    const total = score.criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBe(100);
    expect(score.criteria).toHaveLength(12);
  });

  it('gli N/A sono esclusi dal totale dello score', () => {
    // equity 0 → D/E N/A (peso 10 escluso); dcf mancante → margin of safety N/A (peso 10 escluso)
    const data: CompanyFinancials = {
      ...baseFinancials,
      shareholdersEquity: 0,
      dcf: undefined,
    };
    const score = analyzeValueInvesting(data, calculateFinancialRatios(data));
    const de = score.criteria.find(c => c.name === 'Debito sotto controllo');
    const mos = score.criteria.find(c => c.name === 'Margin of safety vs DCF');
    expect(de?.status).toBe('na');
    expect(mos?.status).toBe('na');
    // N/A attesi: D/E (equity 0), ROE (equity 0), MoS (no dcf), ROE 10y (no storico) → pesi 10+10+10+10 = 40
    const naWeight = score.criteria.filter(c => c.status === 'na').reduce((s, c) => s + c.weight, 0);
    expect(naWeight).toBe(40);
  });

  it('score 100 quando tutti i criteri applicabili passano', () => {
    const data: CompanyFinancials = {
      ...baseFinancials,
      currentPrice: 10, // sotto tutte le soglie
      marketCap: 200,
      revenue: 1000,
      netIncome: 200, // net margin 20%
      shareholdersEquity: 1000, // ROE 20%
      totalLiabilities: 100, // NCAV/share = (900-100)/20 = 40 → ⅔·40 ≈ 26.7 > 10
      longTermDebt: 100, // D/E 0.1
      currentAssets: 900,
      currentLiabilities: 300, // current 3
      inventory: 100, // quick (900-100)/300 = 2.67
      eps: 5,
      bookValuePerShare: 40, // P/B 0.25
      dcf: 100, // 70% = 70 > 10
    };
    const score = analyzeValueInvesting(data, calculateFinancialRatios(data));
    const applicable = score.criteria.filter(c => c.status !== 'na');
    expect(applicable.every(c => c.status === 'pass')).toBe(true);
    expect(score.overallScore).toBe(100);
    expect(score.recommendation).toBe('strong-buy');
  });

  it('score 0 quando tutti i criteri applicabili falliscono', () => {
    const data: CompanyFinancials = {
      ...baseFinancials,
      eps: -1, // EPS fail, P/E na
      currentPrice: 1000,
      marketCap: 20000,
      bookValuePerShare: 1, // P/B 1000 fail
      netIncome: -50, // margin negativo, ROE negativo
      longTermDebt: 5000, // D/E > 0.5 fail
      currentAssets: 100,
      currentLiabilities: 1000, // current 0.1 fail
      inventory: 0,
      dcf: 10, // 70% = 7 < 1000 fail
      dividendPerShare: 0,
    };
    const score = analyzeValueInvesting(data, calculateFinancialRatios(data));
    const applicable = score.criteria.filter(c => c.status !== 'na');
    expect(applicable.length).toBeGreaterThan(0);
    expect(applicable.every(c => c.status === 'fail')).toBe(true);
    expect(score.overallScore).toBe(0);
    expect(score.recommendation).toBe('avoid');
  });

  it('Graham Number: pass sotto √(22.5·EPS·BVPS), fail sopra, N/A con EPS ≤ 0', () => {
    // √(22.5·5·20) = √2250 ≈ 47.43
    const pass = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials));
    expect(pass.criteria.find(c => c.name === 'Graham Number')?.status).toBe('pass'); // 40 < 47.43

    const fail = analyzeValueInvesting(
      { ...baseFinancials, currentPrice: 50 },
      calculateFinancialRatios({ ...baseFinancials, currentPrice: 50 })
    );
    expect(fail.criteria.find(c => c.name === 'Graham Number')?.status).toBe('fail');

    const na = analyzeValueInvesting(
      { ...baseFinancials, eps: -1 },
      calculateFinancialRatios({ ...baseFinancials, eps: -1 })
    );
    expect(na.criteria.find(c => c.name === 'Graham Number')?.status).toBe('na');
  });

  it('NCAV net-net: pass sotto ⅔·NCAV/share, N/A se shares mancanti', () => {
    // NCAV/share = (600-800)/20 = -10 → threshold negativo → prezzo mai sotto → fail
    const r = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials));
    expect(r.criteria.find(c => c.name === 'NCAV net-net')?.status).toBe('fail');

    const deepNetNet: CompanyFinancials = {
      ...baseFinancials,
      currentAssets: 1000,
      totalLiabilities: 200,
      sharesOutstanding: 10,
      currentPrice: 10,
    };
    // NCAV/share = 800/10 = 80 → ⅔·80 ≈ 53.33 > 10 → pass
    const r2 = analyzeValueInvesting(deepNetNet, calculateFinancialRatios(deepNetNet));
    expect(r2.criteria.find(c => c.name === 'NCAV net-net')?.status).toBe('pass');

    const noShares = analyzeValueInvesting(
      { ...baseFinancials, sharesOutstanding: 0 },
      calculateFinancialRatios({ ...baseFinancials, sharesOutstanding: 0 })
    );
    expect(noShares.criteria.find(c => c.name === 'NCAV net-net')?.status).toBe('na');
  });

  it('margin of safety vs DCF: pass se prezzo < 70% del DCF, N/A senza DCF', () => {
    const r = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials));
    expect(r.criteria.find(c => c.name === 'Margin of safety vs DCF')?.status).toBe('pass'); // 40 < 70

    const fail = analyzeValueInvesting(
      { ...baseFinancials, currentPrice: 80 },
      calculateFinancialRatios({ ...baseFinancials, currentPrice: 80 })
    );
    expect(fail.criteria.find(c => c.name === 'Margin of safety vs DCF')?.status).toBe('fail'); // 80 > 70

    const na = analyzeValueInvesting(
      { ...baseFinancials, dcf: undefined },
      calculateFinancialRatios({ ...baseFinancials, dcf: undefined })
    );
    expect(na.criteria.find(c => c.name === 'Margin of safety vs DCF')?.status).toBe('na');
  });

  it('ROE costante 10y: pass/fail/na secondo lo storico', () => {
    const hist10ok: HistoricalMetrics[] = Array.from({ length: 10 }, (_, i) => ({
      date: `${2016 + i}-12-31`,
      eps: 1,
      roe: 12,
      revenue: 100,
      netIncome: 10,
      dividendPerShare: 0.5,
      bookValuePerShare: 8,
    }));
    const s1 = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials), hist10ok);
    expect(s1.criteria.find(c => c.name === 'ROE costante 10 anni')?.status).toBe('pass');

    const histOneLow = [...hist10ok];
    histOneLow[3] = { ...histOneLow[3], roe: 8 };
    const s2 = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials), histOneLow);
    expect(s2.criteria.find(c => c.name === 'ROE costante 10 anni')?.status).toBe('fail');

    const hist5 = hist10ok.slice(0, 5);
    const s3 = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials), hist5);
    expect(s3.criteria.find(c => c.name === 'ROE costante 10 anni')?.status).toBe('na');

    // senza storico → N/A
    const s4 = analyzeValueInvesting(baseFinancials, calculateFinancialRatios(baseFinancials));
    expect(s4.criteria.find(c => c.name === 'ROE costante 10 anni')?.status).toBe('na');
  });
});

describe('calculateHistoricalTrend', () => {
  it('calcola EPS CAGR e ROE per anno', () => {
    const history: HistoricalMetrics[] = [
      { date: '2024-12-31', eps: 2, roe: 15, revenue: 100, netIncome: 10, dividendPerShare: 0.5, bookValuePerShare: 8 },
      { date: '2026-12-31', eps: 4, roe: 18, revenue: 120, netIncome: 12, dividendPerShare: 0.6, bookValuePerShare: 9 },
    ];
    const t = calculateHistoricalTrend(history);
    expect(t.years).toBe(2);
    expect(t.epsCagr).toBeCloseTo(100); // 2 → 4 in 1 intervallo di 1 anno
    expect(t.roeByYear).toEqual([
      { year: '2024', roe: 15 },
      { year: '2026', roe: 18 },
    ]);
    expect(t.roeConsistent10y).toBeNull(); // meno di 10 anni
  });

  it('roeConsistent10y true solo se ≥ 10% in ognuno degli ultimi 10 anni', () => {
    const ok: HistoricalMetrics[] = Array.from({ length: 10 }, (_, i) => ({
      date: `${2016 + i}-12-31`,
      eps: 1,
      roe: 10,
      revenue: 1,
      netIncome: 1,
      dividendPerShare: 0,
      bookValuePerShare: 1,
    }));
    expect(calculateHistoricalTrend(ok).roeConsistent10y).toBe(true);

    const ko = ok.map((h, i) => (i === 5 ? { ...h, roe: 9.9 } : h));
    expect(calculateHistoricalTrend(ko).roeConsistent10y).toBe(false);
  });

  it('epsCagr null se EPS primo/ultimo mancante o ≤ 0', () => {
    const t = calculateHistoricalTrend([
      { date: '2024-12-31', eps: -1, roe: 10, revenue: 1, netIncome: 1, dividendPerShare: 0, bookValuePerShare: 1 },
      { date: '2025-12-31', eps: 2, roe: 10, revenue: 1, netIncome: 1, dividendPerShare: 0, bookValuePerShare: 1 },
    ]);
    expect(t.epsCagr).toBeNull();
  });
});

describe('formatCurrency — valuta dichiarata', () => {
  it('formatta in EUR di default e nella valuta passata', () => {
    expect(formatCurrency(1234.5)).toContain('€');
    expect(formatCurrency(1234.5, 2, false, 'USD')).toContain('USD');
  });

  it('aggiunge il segno + quando richiesto', () => {
    expect(formatCurrency(10, 2, true, 'USD')).toMatch(/^\+/);
    expect(formatCurrency(-10, 2, true, 'USD')).not.toMatch(/^\+\s*-/);
  });
});
