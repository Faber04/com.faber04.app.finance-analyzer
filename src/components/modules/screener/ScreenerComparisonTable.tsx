import React, { useState } from 'react';
import { Card } from '@/components/common';
import { CompanyFinancials, FinancialRatios, ValueInvestingScore } from '@/types';
import { ArrowUpDown, Trophy } from 'lucide-react';

export interface ScreenerResult {
  financials: CompanyFinancials;
  ratios: FinancialRatios;
  score: ValueInvestingScore;
}

type SortKey = 'symbol' | 'overallScore' | 'pe' | 'pb' | 'roe' | 'debtToEquity';

const recommendationStyles: Record<ValueInvestingScore['recommendation'], string> = {
  'strong-buy': 'bg-success-100 text-success-800',
  buy: 'bg-green-100 text-green-800',
  hold: 'bg-yellow-100 text-yellow-800',
  avoid: 'bg-danger-100 text-danger-700',
};

const recommendationLabels: Record<ValueInvestingScore['recommendation'], string> = {
  'strong-buy': 'Strong Buy',
  buy: 'Buy',
  hold: 'Hold',
  avoid: 'Avoid',
};

const safeValue = (val: number | undefined): string =>
  val === undefined || !isFinite(val) ? 'N/D' : val.toFixed(2);

const formatPrice = (val: number): string =>
  isFinite(val) ? `$${val.toFixed(2)}` : 'N/D';

interface ScreenerComparisonTableProps {
  results: ScreenerResult[];
}

export const ScreenerComparisonTable: React.FC<ScreenerComparisonTableProps> = ({
  results,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('overallScore');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...results].sort((a, b) => {
    let cmp: number;
    switch (sortKey) {
      case 'symbol':
        cmp = a.financials.symbol.localeCompare(b.financials.symbol);
        break;
      case 'pe':
      case 'pb':
      case 'roe':
      case 'debtToEquity':
        cmp = (a.ratios[sortKey] || 0) - (b.ratios[sortKey] || 0);
        break;
      default:
        cmp = a.score.overallScore - b.score.overallScore;
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'symbol');
    }
  };

  const bestScore = Math.max(...results.map((r) => r.score.overallScore));

  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: 'overallScore', label: 'Value Score' },
    { key: 'pe', label: 'P/E' },
    { key: 'pb', label: 'P/B' },
    { key: 'roe', label: 'ROE %' },
    { key: 'debtToEquity', label: 'D/E' },
  ];

  return (
    <Card
      title="Confronto Aziende"
      subtitle="Clicca sulle intestazioni per ordinare"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left text-gray-600">
              <th className="py-3 px-2 font-semibold">Azienda</th>
              <th className="py-3 px-2 font-semibold">Prezzo</th>
              {columns.map((col) => (
                <th key={col.key} className="py-3 px-2 font-semibold">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-primary-700 transition-colors"
                    type="button"
                  >
                    {col.label}
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
              ))}
              <th className="py-3 px-2 font-semibold">Raccomandazione</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.financials.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div className="font-bold text-gray-900">{r.financials.symbol}</div>
                  <div className="text-xs text-gray-500">{r.financials.companyName}</div>
                </td>
                <td className="py-3 px-2 text-gray-700">{formatPrice(r.financials.currentPrice)}</td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                    {r.score.overallScore === bestScore && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
                    {r.score.overallScore}/100
                  </span>
                </td>
                <td className="py-3 px-2">{safeValue(r.ratios.pe)}</td>
                <td className="py-3 px-2">{safeValue(r.ratios.pb)}</td>
                <td className="py-3 px-2">{safeValue(r.ratios.roe)}</td>
                <td className="py-3 px-2">{safeValue(r.ratios.debtToEquity)}</td>
                <td className="py-3 px-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${recommendationStyles[r.score.recommendation]}`}
                  >
                    {recommendationLabels[r.score.recommendation]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
