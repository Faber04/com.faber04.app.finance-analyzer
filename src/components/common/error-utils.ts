import { FmpApiError } from '@/services/api';

export interface TranslatedError {
  key: string;
  vars?: Record<string, string | number>;
}

// Mappa un errore FMP (o generico) sulla chiave i18n dello stato errore (PR5):
// la UI mostra sempre testi tradotti, mai il message hardcoded dell'eccezione.
export function errorToKey(err: unknown, symbol?: string): TranslatedError {
  if (err instanceof FmpApiError) {
    switch (err.code) {
      case 'invalid-key':
        return { key: 'errors.invalidKey' };
      case 'rate-limit':
        return { key: 'errors.rateLimit' };
      case 'not-found':
        return { key: 'errors.notFound', vars: { symbol: symbol ?? '' } };
      case 'network':
        return { key: 'errors.network' };
      case 'server':
        return { key: 'errors.server', vars: { status: err.status ?? '?' } };
      case 'unknown':
        return { key: 'errors.invalidSymbol' };
      default:
        return { key: 'errors.generic', vars: { message: err.message } };
    }
  }
  return {
    key: 'errors.generic',
    vars: { message: err instanceof Error ? err.message : String(err) },
  };
}

// Helper: traduce direttamente con il translator (t) del dizionario attivo
export function translateError(
  t: (key: string, vars?: Record<string, string | number>) => string,
  err: unknown,
  symbol?: string
): string {
  const { key, vars } = errorToKey(err, symbol);
  return t(key, vars);
}
