import React from 'react';
import { Card } from '@/components/common';
import { useTranslation } from '@/i18n';
import { CompanyFinancials } from '@/types';

// Campi del pannello dati, raggruppati per sezione (PR7: tabella editabile inline)
const FIELD_GROUPS: {
  sectionKey: string;
  fields: { name: keyof CompanyFinancials; labelKey: string; type: 'number' | 'text' | 'date' }[];
}[] = [
  {
    sectionKey: 'analyze.secCompany',
    fields: [
      { name: 'symbol', labelKey: 'form.symbol', type: 'text' },
      { name: 'companyName', labelKey: 'form.companyName', type: 'text' },
      { name: 'sector', labelKey: 'form.sector', type: 'text' },
      { name: 'reportDate', labelKey: 'form.reportDate', type: 'date' },
      { name: 'currency', labelKey: 'form.currency', type: 'text' },
    ],
  },
  {
    sectionKey: 'analyze.secIncome',
    fields: [
      { name: 'revenue', labelKey: 'form.revenue', type: 'number' },
      { name: 'netIncome', labelKey: 'form.netIncome', type: 'number' },
    ],
  },
  {
    sectionKey: 'analyze.secBalance',
    fields: [
      { name: 'totalAssets', labelKey: 'form.totalAssets', type: 'number' },
      { name: 'totalLiabilities', labelKey: 'form.totalLiabilities', type: 'number' },
      { name: 'shareholdersEquity', labelKey: 'form.equity', type: 'number' },
      { name: 'longTermDebt', labelKey: 'form.longTermDebt', type: 'number' },
      { name: 'currentAssets', labelKey: 'form.currentAssets', type: 'number' },
      { name: 'currentLiabilities', labelKey: 'form.currentLiabilities', type: 'number' },
      { name: 'inventory', labelKey: 'form.inventory', type: 'number' },
    ],
  },
  {
    sectionKey: 'analyze.secPerShare',
    fields: [
      { name: 'eps', labelKey: 'form.eps', type: 'number' },
      { name: 'bookValuePerShare', labelKey: 'form.bvps', type: 'number' },
      { name: 'dividendPerShare', labelKey: 'form.dps', type: 'number' },
    ],
  },
  {
    sectionKey: 'analyze.secMarket',
    fields: [
      { name: 'currentPrice', labelKey: 'form.currentPrice', type: 'number' },
      { name: 'sharesOutstanding', labelKey: 'form.shares', type: 'number' },
      { name: 'marketCap', labelKey: 'form.marketCap', type: 'number' },
      { name: 'dcf', labelKey: 'form.dcf', type: 'number' },
    ],
  },
];

interface FinancialsPanelProps {
  value: CompanyFinancials;
  onChange: (patch: Partial<CompanyFinancials>) => void;
}

// Pannello unico dei dati fondamentali: tabella compatta, editabile inline (PR7)
export const FinancialsPanel: React.FC<FinancialsPanelProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (name: keyof CompanyFinancials, raw: string, type: 'number' | 'text' | 'date') => {
    if (type === 'number') {
      const parsed = parseFloat(raw);
      onChange({ [name]: raw === '' || isNaN(parsed) ? 0 : parsed } as Partial<CompanyFinancials>);
    } else {
      onChange({ [name]: raw } as Partial<CompanyFinancials>);
    }
  };

  return (
    <Card title={t('analyze.dataPanelTitle')} subtitle={t('analyze.dataPanelSubtitle')}>
      <div className="space-y-5">
        {FIELD_GROUPS.map((group) => (
          <div key={group.sectionKey}>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{t(group.sectionKey)}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                    <th className="py-1.5 pr-4 font-medium">{t('analyze.colField')}</th>
                    <th className="py-1.5 pr-4 font-medium">{t('analyze.colValue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.fields.map((field) => (
                    <tr key={field.name} className="border-b border-gray-100">
                      <td className="py-1.5 pr-4 text-gray-700 whitespace-nowrap">{t(field.labelKey)}</td>
                      <td className="py-1.5 pr-4">
                        <input
                          type={field.type}
                          step={field.type === 'number' ? '0.01' : undefined}
                          value={(value[field.name] as string | number | undefined) ?? ''}
                          onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                          className="w-40 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
