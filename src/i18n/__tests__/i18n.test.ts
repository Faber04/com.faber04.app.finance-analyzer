import { describe, it, expect } from 'vitest';
import { en, it as itDict, createTranslator } from '../index';

describe('i18n dictionaries (PR4)', () => {
  it('en and it have exactly the same keys', () => {
    expect(Object.keys(itDict).sort()).toEqual(Object.keys(en).sort());
  });

  it('no dictionary value is empty', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value.trim().length, `en.${key}`).toBeGreaterThan(0);
    }
    for (const [key, value] of Object.entries(itDict)) {
      expect(value.trim().length, `it.${key}`).toBeGreaterThan(0);
    }
  });
});

describe('createTranslator', () => {
  const t = createTranslator(en);

  it('resolves a key in the active dictionary', () => {
    expect(t('nav.analyze')).toBe('Analyze');
    expect(createTranslator(itDict)('nav.journal')).toBe('Journal');
  });

  it('falls back to English when the active dictionary misses the key', () => {
    const partial = { 'nav.analyze': 'Analizza' } as Record<string, string>;
    const tPartial = createTranslator(partial);
    expect(tPartial('nav.analyze')).toBe('Analizza');
    expect(tPartial('nav.portfolio')).toBe('Portfolio'); // fallback EN
  });

  it('returns the key itself when missing everywhere', () => {
    expect(t('chiave.inesistente')).toBe('chiave.inesistente');
  });

  it('interpolates {vars}', () => {
    expect(t('screener.count', { count: 3 })).toBe('3/6 companies selected');
    expect(t('portfolio.positionsCount', { count: 7 })).toBe('Positions (7)');
  });
});
