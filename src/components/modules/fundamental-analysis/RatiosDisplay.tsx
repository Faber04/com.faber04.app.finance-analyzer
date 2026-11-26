import React from 'react';
import { Card } from '@/components/common';
import { FinancialRatios } from '@/types';

interface RatiosDisplayProps {
  ratios: FinancialRatios;
}

// null = dato mancante: si mostra "N/A" con colore neutro, mai 0 fittizio
const fmt = (v: number | null | undefined, suffix = ''): string =>
  v === null || v === undefined || !isFinite(v) ? 'N/A' : `${v.toFixed(2)}${suffix}`;

export const RatiosDisplay: React.FC<RatiosDisplayProps> = ({ ratios }) => {
  const getRatioColor = (good: boolean | null) => {
    if (good === null) return 'text-gray-400';
    return good ? 'text-success-700' : 'text-danger-700';
  };

  const ratioGroups = [
    {
      title: 'Valutazione',
      metrics: [
        {
          label: 'P/E Ratio',
          value: fmt(ratios.pe),
          good: ratios.pe === null ? null : ratios.pe < 15,
          info: 'Prezzo / Utili. Ideale < 15 (N/A se EPS ≤ 0)'
        },
        {
          label: 'P/B Ratio',
          value: fmt(ratios.pb),
          good: ratios.pb === null ? null : ratios.pb < 1.5,
          info: 'Prezzo / Valore Contabile. Ideale < 1.5'
        },
        {
          label: 'P/S Ratio',
          value: fmt(ratios.ps),
          good: ratios.ps === null ? null : ratios.ps < 3,
          info: 'Prezzo / Vendite (da market cap). Ideale < 3'
        },
      ],
    },
    {
      title: 'Profittabilità',
      metrics: [
        {
          label: 'ROE',
          value: fmt(ratios.roe, '%'),
          good: ratios.roe === null ? null : ratios.roe >= 15,
          info: 'Return on Equity. Ideale ≥ 15%'
        },
        {
          label: 'ROA',
          value: fmt(ratios.roa, '%'),
          good: ratios.roa === null ? null : ratios.roa >= 5,
          info: 'Return on Assets. Ideale ≥ 5%'
        },
        {
          label: 'Margine Netto',
          value: fmt(ratios.netProfitMargin, '%'),
          good: ratios.netProfitMargin === null ? null : ratios.netProfitMargin >= 10,
          info: 'Net Profit Margin. Ideale ≥ 10%'
        },
      ],
    },
    {
      title: 'Solidità Finanziaria',
      metrics: [
        {
          label: 'Debt/Equity',
          value: fmt(ratios.debtToEquity),
          good: ratios.debtToEquity === null ? null : ratios.debtToEquity < 0.5,
          info: 'Debito / Patrimonio. Ideale < 0.5 (N/A se patrimonio ≤ 0)'
        },
        {
          label: 'Current Ratio',
          value: fmt(ratios.currentRatio),
          good: ratios.currentRatio === null ? null : ratios.currentRatio >= 1.5,
          info: 'Attività correnti / Passività correnti. Ideale ≥ 1.5'
        },
        {
          label: 'Quick Ratio',
          value: fmt(ratios.quickRatio),
          good: ratios.quickRatio === null ? null : ratios.quickRatio >= 1,
          info: 'Liquidità immediata (usa inventario reale). Ideale ≥ 1'
        },
      ],
    },
  ];

  if (ratios.dividendYield !== undefined && ratios.dividendYield !== null) {
    ratioGroups.push({
      title: 'Dividendi',
      metrics: [
        {
          label: 'Dividend Yield',
          value: fmt(ratios.dividendYield, '%'),
          good: ratios.dividendYield >= 2,
          info: 'Rendimento da dividendo. Ideale ≥ 2%'
        },
        {
          label: 'Payout Ratio',
          value: fmt(ratios.payoutRatio, '%'),
          good: ratios.payoutRatio !== null && ratios.payoutRatio !== undefined ? ratios.payoutRatio < 60 : null,
          info: '% utili distribuiti. Ideale < 60%'
        },
      ],
    });
  }

  return (
    <Card title="Ratio Finanziari" subtitle="Indicatori chiave per la valutazione">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratioGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">
              {group.title}
            </h4>
            {group.metrics.map((metric) => (
              <div key={metric.label} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm text-gray-600">{metric.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{metric.info}</div>
                </div>
                <div
                  className={`text-xl font-bold ${getRatioColor(metric.good)}`}
                >
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};
