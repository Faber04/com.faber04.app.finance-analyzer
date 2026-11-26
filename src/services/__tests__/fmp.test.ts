import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBulkQuotes, getCompanyFinancials, clearQuoteCache } from '@/services/fmp';

// --- mock localStorage (per la API key) ---
const mem: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => (k in mem ? mem[k] : null),
  setItem: (k: string, v: string) => {
    mem[k] = String(v);
  },
  removeItem: (k: string) => {
    delete mem[k];
  },
  clear: () => {
    for (const k of Object.keys(mem)) delete mem[k];
  },
});

// --- mock fetch ---
type FetchReply = { status: number; body: unknown };
let fetchImpl: (url: string) => FetchReply = () => ({ status: 200, body: [] });
const fetchMock = vi.fn(async (url: string) => {
  const reply = fetchImpl(url);
  return {
    ok: reply.status >= 200 && reply.status < 300,
    status: reply.status,
    json: async () => reply.body,
  } as Response;
});
vi.stubGlobal('fetch', fetchMock);

const PROFILE = [
  { symbol: 'TEST', companyName: 'Test Corp', sector: 'Tech', industry: 'Software', price: 40, mktCap: 800e6, lastDiv: 0.5, dcf: 100, currency: 'USD' },
];
const QUOTE = [{ symbol: 'TEST', name: 'Test Corp', price: 40, marketCap: 800e6, sharesOutstanding: 20e6 }];
const QUOTE2 = [{ symbol: 'ACME', name: 'Acme Inc', price: 10, marketCap: 100e6, sharesOutstanding: 10e6 }];
const INCOME = [
  { date: '2026-12-31', revenue: 1000e6, netIncome: 100e6, eps: 5, epsdiluted: 5.2, weightedAverageShsOutDil: 20e6 },
  { date: '2025-12-31', revenue: 900e6, netIncome: 90e6, eps: 4.5, epsdiluted: 4.6, weightedAverageShsOutDil: 20e6 },
];
const BALANCE = [
  { date: '2026-12-31', totalAssets: 2000e6, totalLiabilities: 800e6, totalStockholdersEquity: 1200e6, longTermDebt: 300e6, totalDebt: 350e6, totalCurrentAssets: 600e6, totalCurrentLiabilities: 300e6, inventory: 100e6 },
];
const METRICS = [
  { date: '2026-12-31', roe: 8.3, bookValuePerShare: 60, dividendPerShare: 1 },
  { date: '2025-12-31', roe: 10, bookValuePerShare: 55, dividendPerShare: 0.9 },
];

const defaultImpl = (url: string): FetchReply => {
  if (url.includes('/profile?')) return { status: 200, body: PROFILE };
  if (url.includes('/quote?symbol=ACME')) return { status: 200, body: QUOTE2 };
  if (url.includes('/quote?')) return { status: 200, body: QUOTE };
  if (url.includes('/income-statement?')) return { status: 200, body: INCOME };
  if (url.includes('/balance-sheet-statement?')) return { status: 200, body: BALANCE };
  if (url.includes('/key-metrics?')) return { status: 200, body: METRICS };
  return { status: 200, body: [] };
};

beforeEach(() => {
  mem['FMP_API_KEY'] = 'test-key';
  clearQuoteCache();
  fetchMock.mockClear();
  fetchImpl = defaultImpl;
});

describe('getCompanyFinancials — aggregatore tollerante', () => {
  it('aggrega i dati con provenance api e history', async () => {
    const r = await getCompanyFinancials('test');
    expect(r.financials.symbol).toBe('TEST');
    expect(r.financials.marketCap).toBeCloseTo(800); // 800e6 → 800 milioni
    expect(r.financials.currentPrice).toBe(40);
    expect(r.financials.currency).toBe('USD');
    expect(r.financials.dcf).toBe(100);
    expect(r.provenance.marketCap).toBe('api');
    expect(r.provenance.currentPrice).toBe('api');
    expect(r.history).toHaveLength(2);
    expect(r.history[0].date).toBe('2026-12-31');
    expect(r.history[0].eps).toBe(5.2); // epsdiluted preferito a eps
    expect(r.history[0].roe).toBe(8.3);
  });

  it('chiede limit=10 agli endpoint dello storico', async () => {
    const urls: string[] = [];
    fetchImpl = (url) => {
      urls.push(url);
      return defaultImpl(url);
    };
    await getCompanyFinancials('TEST');
    expect(urls.find((u) => u.includes('/income-statement?'))).toContain('limit=10');
    expect(urls.find((u) => u.includes('/key-metrics?'))).toContain('limit=10');
    expect(urls.find((u) => u.includes('/balance-sheet-statement?'))).toContain('limit=1');
  });

  it('un endpoint mancante (array vuoto) non uccide l\'auto-fill: badge missing', async () => {
    fetchImpl = (url) => {
      if (url.includes('/balance-sheet-statement?')) return { status: 200, body: [] };
      return defaultImpl(url);
    };
    const r = await getCompanyFinancials('TEST');
    expect(r.financials.symbol).toBe('TEST'); // non ha lanciato
    expect(r.financials.currentAssets).toBe(0);
    expect(r.provenance.currentAssets).toBe('missing');
    expect(r.provenance.longTermDebt).toBe('missing');
    expect(r.provenance.inventory).toBe('missing');
    expect(r.provenance.marketCap).toBe('api'); // gli altri endpoint ci sono
  });

  it('fallback longTermDebt da totalDebt → provenance derived', async () => {
    fetchImpl = (url) => {
      if (url.includes('/balance-sheet-statement?')) {
        return { status: 200, body: [{ ...BALANCE[0], longTermDebt: 0, totalDebt: 350e6 }] };
      }
      return defaultImpl(url);
    };
    const r = await getCompanyFinancials('TEST');
    expect(r.financials.longTermDebt).toBeCloseTo(350);
    expect(r.provenance.longTermDebt).toBe('derived');
  });

  it('fallback marketCap da profile.mktCap se quote.marketCap manca → derived', async () => {
    fetchImpl = (url) => {
      if (url.includes('/quote?')) return { status: 200, body: [{ ...QUOTE[0], marketCap: 0 }] };
      return defaultImpl(url);
    };
    const r = await getCompanyFinancials('TEST');
    expect(r.financials.marketCap).toBeCloseTo(800); // da p.mktCap
    expect(r.provenance.marketCap).toBe('derived');
  });

  it('ticker inesistente (profile e quote vuoti) → FmpApiError not-found', async () => {
    fetchImpl = () => ({ status: 200, body: [] });
    await expect(getCompanyFinancials('NOPE')).rejects.toMatchObject({ name: 'FmpApiError', code: 'not-found' });
  });

  it('401/403 → invalid-key, 429 → rate-limit, fetch ko → network', async () => {
    fetchImpl = () => ({ status: 401, body: {} });
    await expect(getCompanyFinancials('TEST')).rejects.toMatchObject({ code: 'invalid-key', status: 401 });

    fetchImpl = () => ({ status: 429, body: {} });
    await expect(getCompanyFinancials('TEST')).rejects.toMatchObject({ code: 'rate-limit', status: 429 });

    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('fetch failed');
    }));
    await expect(getCompanyFinancials('TEST')).rejects.toMatchObject({ code: 'network' });
    vi.stubGlobal('fetch', fetchMock);
  });
});

describe('getBulkQuotes — cache 60s', () => {
  it('usa la cache in-memory entro 60s e salta i simboli che falliscono', async () => {
    let quoteCalls = 0;
    fetchImpl = (url) => {
      if (url.includes('/quote?')) quoteCalls++;
      if (url.includes('/quote?symbol=BAD')) throw new Error('boom');
      return defaultImpl(url);
    };
    // BAD lancia dentro fetchImpl → fetchMock wrappa? no: fetchImpl lancia, fetchMock lancia → catch in getBulkQuotes
    const first = await getBulkQuotes(['TEST', 'ACME']);
    expect(first).toEqual({ TEST: 40, ACME: 10 });
    const callsAfterFirst = quoteCalls;

    const second = await getBulkQuotes(['TEST', 'ACME']); // tutta cache
    expect(second).toEqual({ TEST: 40, ACME: 10 });
    expect(quoteCalls).toBe(callsAfterFirst); // nessuna nuova fetch

    const withBad = await getBulkQuotes(['BAD']); // non uccide il batch
    expect(withBad).toEqual({});
  });
});
