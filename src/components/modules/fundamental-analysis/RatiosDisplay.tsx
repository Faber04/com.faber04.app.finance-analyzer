import React from 'react';
import { Card } from '@/components/common';
import { FinancialRatios } from '@/types';
import { useTranslation } from '@/i18n';

interface RatiosDisplayProps {
  ratios: FinancialRatios;
}

// null = dato mancante: si mostra "N/A" con colore neutro, mai 0 fittizio
const fmt = (v: number | null | undefined, suffix = ''): string =>
  v === null || v === undefined || !isFinite(v) ? 'N/A' : `${v.toFixed(2)}${suffix}`;

export const RatiosDisplay: React.FC<RatiosDisplayProps> = ({ ratios }) => {
  const { t } = useTranslation();

  const getRatioColor = (good: boolean | null) => {
    if (good === null) return 'text-gray-400 dark:text-gray-500';
    return good ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400';
  };

  const ratioGroups = [
    {
      title: t('ratios.valuation'),
      metrics: [
        {
          label: t('ratios.pe'),
          value: fmt(ratios.pe),
          good: ratios.pe === null ? null : ratios.pe < 15,
          info: t('ratios.peInfo')
        },
        {
          label: t('ratios.pb'),
          value: fmt(ratios.pb),
          good: ratios.pb === null ? null : ratios.pb < 1.5,
          info: t('ratios.pbInfo')
        },
        {
          label: t('ratios.ps'),
          value: fmt(ratios.ps),
          good: ratios.ps === null ? null : ratios.ps < 3,
          info: t('ratios.psInfo')
        },
      ],
    },
    {
      title: t('ratios.profitability'),
      metrics: [
        {
          label: t('ratios.roe'),
          value: fmt(ratios.roe, '%'),
          good: ratios.roe === null ? null : ratios.roe >= 15,
          info: t('ratios.roeInfo')
        },
        {
          label: t('ratios.roa'),
          value: fmt(ratios.roa, '%'),
          good: ratios.roa === null ? null : ratios.roa >= 5,
          info: t('ratios.roaInfo')
        },
        {
          label: t('ratios.netMargin'),
          value: fmt(ratios.netProfitMargin, '%'),
          good: ratios.netProfitMargin === null ? null : ratios.netProfitMargin >= 10,
          info: t('ratios.netMarginInfo')
        },
      ],
    },
    {
      title: t('ratios.solidity'),
      metrics: [
        {
          label: t('ratios.de'),
          value: fmt(ratios.debtToEquity),
          good: ratios.debtToEquity === null ? null : ratios.debtToEquity < 0.5,
          info: t('ratios.deInfo')
        },
        {
          label: t('ratios.current'),
          value: fmt(ratios.currentRatio),
          good: ratios.currentRatio === null ? null : ratios.currentRatio >= 1.5,
          info: t('ratios.currentInfo')
        },
        {
          label: t('ratios.quick'),
          value: fmt(ratios.quickRatio),
          good: ratios.quickRatio === null ? null : ratios.quickRatio >= 1,
          info: t('ratios.quickInfo')
        },
      ],
    },
  ];

  if (ratios.dividendYield !== undefined && ratios.dividendYield !== null) {
    ratioGroups.push({
      title: t('ratios.dividends'),
      metrics: [
        {
          label: t('ratios.divYield'),
          value: fmt(ratios.dividendYield, '%'),
          good: ratios.dividendYield >= 2,
          info: t('ratios.divYieldInfo')
        },
        {
          label: t('ratios.payout'),
          value: fmt(ratios.payoutRatio, '%'),
          good: ratios.payoutRatio !== null && ratios.payoutRatio !== undefined ? ratios.payoutRatio < 60 : null,
          info: t('ratios.payoutInfo')
        },
      ],
    });
  }

  return (
    <Card title={t('ratios.title')} subtitle={t('ratios.subtitle')}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratioGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg border-b pb-2">
              {group.title}
            </h4>
            {group.metrics.map((metric) => (
              <div key={metric.label} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{metric.info}</div>
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
