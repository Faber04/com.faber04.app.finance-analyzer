import { describe, expect, it, vi } from 'vitest';

// mock localStorage prima di importare lo store
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

const LEGACY_KEY = 'com.faber04.finance-analyzer-storage';
const NEW_KEY = 'fa:v1:app';

describe('migrazione localStorage legacy → fa:v1:app', () => {
  it('copia portfolio/journal nella nuova chiave versionata e rimuove la vecchia', async () => {
    mem[LEGACY_KEY] = JSON.stringify({
      state: {
        portfolio: { positions: [{ id: 'p1', symbol: 'AAPL' }], totalValue: 0, totalCost: 0, totalGainLoss: 0, totalGainLossPercent: 0 },
        journalEntries: [{ id: 'j1' }],
      },
      version: 0,
    });
    vi.resetModules();
    await import('@/store');

    const migrated = mem[NEW_KEY];
    expect(migrated).toBeDefined();
    const parsed = JSON.parse(migrated);
    expect(parsed.version).toBe(1);
    expect(parsed.state.portfolio.positions[0].symbol).toBe('AAPL');
    expect(parsed.state.journalEntries[0].id).toBe('j1');
    expect(mem[LEGACY_KEY]).toBeUndefined(); // chiave vecchia rimossa
  });

  it('non sovrascrive fa:v1:app se già presente', async () => {
    mem[NEW_KEY] = JSON.stringify({ state: { portfolio: { positions: [] } }, version: 1 });
    mem[LEGACY_KEY] = JSON.stringify({ state: { portfolio: { positions: [{ id: 'old' }] } }, version: 0 });
    vi.resetModules();
    await import('@/store');

    expect(JSON.parse(mem[NEW_KEY]).state.portfolio.positions).toHaveLength(0);
    expect(mem[LEGACY_KEY]).toBeUndefined();
  });
});
