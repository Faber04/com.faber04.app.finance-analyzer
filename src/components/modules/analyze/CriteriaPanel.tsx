import React from 'react';
import { Card } from '@/components/common';
import { useTranslation } from '@/i18n';
import { CriterionConfig, CriterionDirection } from '@/types';

const DIRECTION_SYMBOL: Record<CriterionDirection, string> = { gt: '>', ge: '≥', lt: '<', le: '≤' };

interface CriteriaPanelProps {
  value: CriterionConfig[]; // fissi: DEFAULT_CRITERIA (Graham/Buffett), solo lettura
}

// Pannello dei criteri di valutazione: SOLO LETTURA, criteri Graham/Buffett fissi (PR7 rev.2)
export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({ value }) => {
  const { t } = useTranslation();

  return (
    <Card title={t('analyze.criteriaPanelTitle')} subtitle={t('analyze.criteriaPanelSubtitle')}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
              <th className="py-1.5 pr-4 font-medium">{t('analyze.colField')}</th>
              <th className="py-1.5 pr-4 font-medium">{t('analyze.colBenchmark')}</th>
              <th className="py-1.5 pr-4 font-medium">{t('analyze.colWeight')}</th>
            </tr>
          </thead>
          <tbody>
            {value.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-1.5 pr-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{t(c.nameKey)}</td>
                <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-400">
                  {c.threshold !== null
                    ? `${DIRECTION_SYMBOL[c.direction]} ${c.threshold}${c.unit === '%' ? '%' : ''}`
                    : c.id === 'graham'
                      ? 'prezzo < √(22.5·EPS·BVPS)'
                      : c.id === 'ncav'
                        ? 'prezzo < ⅔·NCAV/share'
                        : 'prezzo < 70% DCF'}
                </td>
                <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-400">{c.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
