import React from 'react';
import { Card } from '@/components/common';
import { FinancialRatios } from '@/types';

interface RatiosDisplayProps {
  ratios: FinancialRatios;
}

export const RatiosDisplay: React.FC<RatiosDisplayProps> = ({ ratios }) => {
  const getRatioColor = (value: number, good: (v: number) => boolean) => {
    return good(value) ? 'text-success-700' : 'text-danger-700';
  };

  const ratioGroups = [
    {
      title: 'Valutazione',
      metrics: [
        { 
          label: 'P/E Ratio', 
          value: ratios.pe.toFixed(2), 
          good: ratios.pe > 0 && ratios.pe < 15,
          info: 'Prezzo / Utili. Ideale < 15'
        },
        { 
          label: 'P/B Ratio', 
          value: ratios.pb.toFixed(2), 
          good: ratios.pb > 0 && ratios.pb < 1.5,
          info: 'Prezzo / Valore Contabile. Ideale < 1.5'
        },
        { 
          label: 'P/S Ratio', 
          value: ratios.ps.toFixed(2), 
          good: ratios.ps > 0 && ratios.ps < 2,
          info: 'Prezzo / Vendite. Ideale < 2'
        },
      ],
    },
    {
      title: 'Profittabilità',
      metrics: [
        { 
          label: 'ROE', 
          value: `${ratios.roe.toFixed(2)}%`, 
          good: ratios.roe >= 15,
          info: 'Return on Equity. Ideale ≥ 15%'
        },
        { 
          label: 'ROA', 
          value: `${ratios.roa.toFixed(2)}%`, 
          good: ratios.roa >= 5,
          info: 'Return on Assets. Ideale ≥ 5%'
        },
        { 
          label: 'Margine Netto', 
          value: `${ratios.netProfitMargin.toFixed(2)}%`, 
          good: ratios.netProfitMargin >= 10,
          info: 'Net Profit Margin. Ideale ≥ 10%'
        },
      ],
    },
    {
      title: 'Solidità Finanziaria',
      metrics: [
        { 
          label: 'Debt/Equity', 
          value: ratios.debtToEquity.toFixed(2), 
          good: ratios.debtToEquity < 0.5,
          info: 'Debito / Patrimonio. Ideale < 0.5'
        },
        { 
          label: 'Current Ratio', 
          value: ratios.currentRatio.toFixed(2), 
          good: ratios.currentRatio >= 1.5,
          info: 'Attività correnti / Passività correnti. Ideale ≥ 1.5'
        },
        { 
          label: 'Quick Ratio', 
          value: ratios.quickRatio.toFixed(2), 
          good: ratios.quickRatio >= 1,
          info: 'Liquidità immediata. Ideale ≥ 1'
        },
      ],
    },
  ];

  if (ratios.dividendYield !== undefined) {
    ratioGroups.push({
      title: 'Dividendi',
      metrics: [
        { 
          label: 'Dividend Yield', 
          value: `${ratios.dividendYield.toFixed(2)}%`, 
          good: ratios.dividendYield >= 2,
          info: 'Rendimento da dividendo. Ideale ≥ 2%'
        },
        { 
          label: 'Payout Ratio', 
          value: ratios.payoutRatio ? `${ratios.payoutRatio.toFixed(2)}%` : 'N/A', 
          good: ratios.payoutRatio ? ratios.payoutRatio < 60 : false,
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
                  className={`text-xl font-bold ${getRatioColor(parseFloat(metric.value), () => metric.good)}`}
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
