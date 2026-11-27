import React from 'react';
import { Card } from '@/components/common';
import { useTranslation } from '@/i18n';
import { CriterionConfig, CriterionDirection } from '@/types';

const DIRECTION_SYMBOL: Record<CriterionDirection, string> = { gt: '>', ge: '≥', lt: '<', le: '≤' };

interface CriteriaPanelProps {
  value: CriterionConfig[];
  onChange: (next: CriterionConfig[]) => void;
}

// Pannello dei criteri di valutazione: soglie e pesi editabili (PR7)
export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const totalWeight = value.reduce((sum, c) => sum + (isFinite(c.weight) ? c.weight : 0), 0);

  const update = (id: string, patch: Partial<CriterionConfig>) => {
    onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <Card title={t('analyze.criteriaPanelTitle')} subtitle={t('analyze.criteriaPanelSubtitle')}>
      {totalWeight !== 100 && (
        <p className="mb-3 text-xs font-semibold text-yellow-800 bg-brand-amber/20 border border-brand-amber rounded-lg px-3 py-2">
          {t('analyze.weightsWarning', { sum: totalWeight })}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
              <th className="py-1.5 pr-4 font-medium">{t('analyze.colField')}</th>
              <th className="py-1.5 pr-4 font-medium">{t('analyze.colBenchmark')}</th>
              <th className="py-1.5 pr-4 font-medium">{t('analyze.colWeight')}</th>
            </tr>
          </thead>
          <tbody>
            {value.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-1.5 pr-4 text-gray-700 whitespace-nowrap">{t(c.nameKey)}</td>
                <td className="py-1.5 pr-4">
                  {c.editable && c.threshold !== null ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-gray-500">{DIRECTION_SYMBOL[c.direction]}</span>
                      <input
                        type="number"
                        step="0.5"
                        value={c.threshold}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          update(c.id, { threshold: isNaN(parsed) ? null : parsed });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {c.unit === '%' && <span className="text-gray-500">%</span>}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      {c.id === 'graham' ? 'prezzo < √(22.5·EPS·BVPS)' : c.id === 'ncav' ? 'prezzo < ⅔·NCAV/share' : 'prezzo < 70% DCF'}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-4">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={c.weight}
                    onChange={(e) => {
                      const parsed = parseFloat(e.target.value);
                      update(c.id, { weight: isNaN(parsed) ? 0 : parsed });
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
