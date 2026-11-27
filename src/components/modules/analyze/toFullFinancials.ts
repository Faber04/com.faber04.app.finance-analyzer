import { CompanyFinancials } from '@/types';

// Converte il Partial tornato da getCompanyFinancials (FMP) in CompanyFinancials completo
export const toFullFinancials = (partial: Partial<CompanyFinancials>): CompanyFinancials => ({
  symbol: partial.symbol ?? '',
  companyName: partial.companyName ?? '',
  sector: partial.sector,
  industry: partial.industry,
  revenue: partial.revenue ?? 0,
  netIncome: partial.netIncome ?? 0,
  totalAssets: partial.totalAssets ?? 0,
  totalLiabilities: partial.totalLiabilities ?? 0,
  shareholdersEquity: partial.shareholdersEquity ?? 0,
  longTermDebt: partial.longTermDebt ?? 0,
  currentAssets: partial.currentAssets ?? 0,
  currentLiabilities: partial.currentLiabilities ?? 0,
  inventory: partial.inventory,
  eps: partial.eps ?? 0,
  bookValuePerShare: partial.bookValuePerShare ?? 0,
  dividendPerShare: partial.dividendPerShare,
  currentPrice: partial.currentPrice ?? 0,
  sharesOutstanding: partial.sharesOutstanding ?? 0,
  marketCap: partial.marketCap,
  dcf: partial.dcf,
  currency: partial.currency,
  reportDate: partial.reportDate ?? '',
});
