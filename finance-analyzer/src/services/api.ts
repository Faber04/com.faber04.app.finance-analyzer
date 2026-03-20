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

  throw new Error("API Key di Financial Modeling Prep mancante! Inseriscila nelle impostazioni o configura VITE_FMP_API_KEY nel file .env.");
};

export const saveFmpApiKey = (key: string): void => {
  localStorage.setItem('FMP_API_KEY', key.trim());
};

export const removeFmpApiKey = (): void => {
  localStorage.removeItem('FMP_API_KEY');
};

const BASE_URL = 'https://financialmodelingprep.com/stable';

export async function fetchFromFmp<T>(endpoint: string): Promise<T> {
  const apiKey = getFmpApiKey();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${separator}apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("API Key FMP non valida o mancante. Verifica le impostazioni.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit API superato. Attendi qualche istante e riprova.");
    }
    throw new Error(`Errore dal server API (Status: ${response.status})`);
  }

  return response.json();
}
