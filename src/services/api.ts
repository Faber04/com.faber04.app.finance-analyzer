/// <reference types="vite/client" />
export const getFmpApiKey = (): string => {
  // Priority 1: Check localStorage (user settings)
  const localKey = localStorage.getItem('FMP_API_KEY');
  if (localKey && localKey.trim() !== '') {
    return localKey;
  }

  // Priority 2: Check environment variables
  const envKey = import.meta.env.VITE_FMP_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey;
  }

  throw new Error('Missing Financial Modeling Prep API key. Set VITE_FMP_API_KEY in a .env.local file or store FMP_API_KEY in the browser localStorage.');
};

export const saveFmpApiKey = (key: string): void => {
  localStorage.setItem('FMP_API_KEY', key.trim());
};

export const removeFmpApiKey = (): void => {
  localStorage.removeItem('FMP_API_KEY');
};

const BASE_URL = 'https://financialmodelingprep.com/stable';

/**
 * Error taxonomy FMP: ogni errore ha un code stabile così la UI può mostrare
 * uno stato distinto (key invalida / quota / ticker inesistente / offline).
 */
export type FmpErrorCode =
  | 'invalid-key'   // 401/403: API key mancante o non valida
  | 'rate-limit'    // 429: quota/rate limit superato
  | 'not-found'     // array vuoto: ticker inesistente
  | 'network'       // fetch fallita: offline o DNS
  | 'server'        // altro status HTTP dal server
  | 'unknown';

export class FmpApiError extends Error {
  code: FmpErrorCode;
  status?: number;

  constructor(code: FmpErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'FmpApiError';
    this.code = code;
    this.status = status;
  }
}

// La API key viaggia in query string (richiesto da FMP): mai loggarla.
export async function fetchFromFmp<T>(endpoint: string): Promise<T> {
  const apiKey = getFmpApiKey();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${separator}apikey=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new FmpApiError('network', 'No connection or unreachable DNS. Check that you are online.');
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new FmpApiError('invalid-key', 'Invalid or missing FMP API key.', response.status);
    }
    if (response.status === 429) {
      throw new FmpApiError('rate-limit', 'API rate limit reached. Wait a moment, then retry.', response.status);
    }
    throw new FmpApiError('server', `API server error (status ${response.status})`, response.status);
  }

  return response.json();
}
