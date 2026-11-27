import React, { useRef, useState } from 'react';
import { Card, Input, Button } from '@/components/common';
import { CompanyFinancials, FieldProvenance, HistoricalMetrics } from '@/types';
import { useAppStore } from '@/store';
import { getCompanyFinancials } from '@/services';
import { useTranslation } from '@/i18n';

interface FinancialDataInputProps {
  isCollapsed?: boolean;
  onStartNewSearch?: () => void;
  onAnalysisSuccess?: () => void;
}

export const FinancialDataInput: React.FC<FinancialDataInputProps> = ({
  isCollapsed = false,
  onStartNewSearch,
  onAnalysisSuccess,
}) => {
  const { setAnalysis, setLoading } = useAppStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Partial<CompanyFinancials>>({
    symbol: '',
    companyName: '',
    sector: '',
    revenue: 0,
    netIncome: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    shareholdersEquity: 0,
    longTermDebt: 0,
    currentAssets: 0,
    currentLiabilities: 0,
    inventory: 0,
    eps: 0,
    bookValuePerShare: 0,
    dividendPerShare: 0,
    currentPrice: 0,
    sharesOutstanding: 0,
    marketCap: 0,
    dcf: 0,
    currency: 'USD',
    reportDate: new Date().toISOString().split('T')[0],
  });

  const [isApiLoading, setIsApiLoading] = useState(false);
  // Provenance e storico dell'ultimo auto-fill: servono a setAnalysis
  const provenanceRef = useRef<FieldProvenance>({});
  const historyRef = useRef<HistoricalMetrics[] | undefined>(undefined);

  const sanitizeNumber = (val: unknown): number =>
    typeof val === 'number' && isFinite(val) ? val : 0;

  const handleAutofill = async () => {
    if (!formData.symbol) {
      alert(t('form.alertSymbol'));
      return;
    }
    
    setIsApiLoading(true);
    try {
      const result = await getCompanyFinancials(formData.symbol);
      const data = result.financials;
      provenanceRef.current = result.provenance;
      historyRef.current = result.history;
      // Sanitizza i campi numerici per evitare NaN negli input
      setFormData(prev => ({
        ...prev,
        ...data,
        revenue:             sanitizeNumber(data.revenue),
        netIncome:           sanitizeNumber(data.netIncome),
        totalAssets:         sanitizeNumber(data.totalAssets),
        totalLiabilities:    sanitizeNumber(data.totalLiabilities),
        shareholdersEquity:  sanitizeNumber(data.shareholdersEquity),
        longTermDebt:        sanitizeNumber(data.longTermDebt),
        currentAssets:       sanitizeNumber(data.currentAssets),
        currentLiabilities:  sanitizeNumber(data.currentLiabilities),
        inventory:           sanitizeNumber(data.inventory),
        eps:                 sanitizeNumber(data.eps),
        bookValuePerShare:   sanitizeNumber(data.bookValuePerShare),
        dividendPerShare:    sanitizeNumber(data.dividendPerShare),
        currentPrice:        sanitizeNumber(data.currentPrice),
        sharesOutstanding:   sanitizeNumber(data.sharesOutstanding),
        marketCap:           sanitizeNumber(data.marketCap),
        dcf:                 sanitizeNumber(data.dcf),
        currency:            data.currency ?? prev.currency,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('form.alertAutofillFallback');
      alert(message);
    } finally {
      setIsApiLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['symbol', 'companyName', 'sector', 'reportDate', 'currency'].includes(name)
        ? value
        : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validazione base
    if (!formData.symbol || !formData.companyName) {
      alert(t('form.alertRequired'));
      setLoading(false);
      return;
    }

    // Simula un piccolo delay per l'analisi
    setTimeout(() => {
      setAnalysis(formData as CompanyFinancials, historyRef.current, provenanceRef.current);
      setLoading(false);
      onAnalysisSuccess?.();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{t('form.title')}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('form.subtitle')}
          </p>
        </div>

        <div className="ui-anim-collapse" data-state={isCollapsed ? 'closed' : 'open'}>
          <div className="ui-anim-collapse-content">
            <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informazioni base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label={t('form.symbol')}
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder={t('form.symbolPlaceholder')}
                  required
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mb-[2px] shrink-0"
                onClick={handleAutofill}
                disabled={isApiLoading}
              >
                {isApiLoading ? t('form.autofillWait') : t('form.autofill')}
              </Button>
            </div>
            <Input
              label={t('form.companyName')}
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder={t('form.companyNamePlaceholder')}
              required
            />
            <Input
              label={t('form.sector')}
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder={t('form.sectorPlaceholder')}
            />
          </div>

        {/* Dati di Conto Economico */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">{t('form.income')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.revenue')}
              name="revenue"
              type="number"
              step="0.01"
              value={formData.revenue}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.netIncome')}
              name="netIncome"
              type="number"
              step="0.01"
              value={formData.netIncome}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
          </div>
        </div>

        {/* Dati di Stato Patrimoniale */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">{t('form.balance')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.totalAssets')}
              name="totalAssets"
              type="number"
              step="0.01"
              value={formData.totalAssets}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.totalLiabilities')}
              name="totalLiabilities"
              type="number"
              step="0.01"
              value={formData.totalLiabilities}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.equity')}
              name="shareholdersEquity"
              type="number"
              step="0.01"
              value={formData.shareholdersEquity}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.longTermDebt')}
              name="longTermDebt"
              type="number"
              step="0.01"
              value={formData.longTermDebt}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.currentAssets')}
              name="currentAssets"
              type="number"
              step="0.01"
              value={formData.currentAssets}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.currentLiabilities')}
              name="currentLiabilities"
              type="number"
              step="0.01"
              value={formData.currentLiabilities}
              onChange={handleChange}
              helperText={t('form.millions')}
            />
            <Input
              label={t('form.inventory')}
              name="inventory"
              type="number"
              step="0.01"
              value={formData.inventory}
              onChange={handleChange}
              helperText={t('form.inventoryHelper')}
            />
          </div>
        </div>

        {/* Dati per azione */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">{t('form.perShare')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('form.eps')}
              name="eps"
              type="number"
              step="0.01"
              value={formData.eps}
              onChange={handleChange}
            />
            <Input
              label={t('form.bvps')}
              name="bookValuePerShare"
              type="number"
              step="0.01"
              value={formData.bookValuePerShare}
              onChange={handleChange}
            />
            <Input
              label={t('form.dps')}
              name="dividendPerShare"
              type="number"
              step="0.01"
              value={formData.dividendPerShare}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Dati di mercato */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">{t('form.market')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('form.currentPrice')}
              name="currentPrice"
              type="number"
              step="0.01"
              value={formData.currentPrice}
              onChange={handleChange}
              required
            />
            <Input
              label={t('form.shares')}
              name="sharesOutstanding"
              type="number"
              step="1"
              value={formData.sharesOutstanding}
              onChange={handleChange}
              helperText={t('form.sharesHelper')}
            />
            <Input
              label={t('form.marketCap')}
              name="marketCap"
              type="number"
              step="0.01"
              value={formData.marketCap}
              onChange={handleChange}
              helperText={t('form.marketCapHelper')}
            />
            <Input
              label={t('form.dcf')}
              name="dcf"
              type="number"
              step="0.01"
              value={formData.dcf}
              onChange={handleChange}
              helperText={t('form.dcfHelper')}
            />
            <Input
              label={t('form.currency')}
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder={t('form.currencyPlaceholder')}
            />
            <Input
              label={t('form.reportDate')}
              name="reportDate"
              type="date"
              value={formData.reportDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            {t('form.analyze')}
          </Button>
        </div>
      </form>
          </div>
        </div>

        <div className="ui-anim-fade-slide mt-4" data-state={isCollapsed ? 'open' : 'closed'}>
          {isCollapsed && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>{t('form.collapsedMsg')}</span>
              <Button type="button" variant="secondary" size="sm" onClick={onStartNewSearch}>
                {t('form.newSearch')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
