import React, { useState } from 'react';
import { Card, Input, Button, ApiKeySettings } from '@/components/common';
import { CompanyFinancials } from '@/types';
import { useAppStore } from '@/store';
import { getCompanyFinancials } from '@/services';

export const FinancialDataInput: React.FC = () => {
  const { setAnalysis, setLoading } = useAppStore();
  
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
    eps: 0,
    bookValuePerShare: 0,
    dividendPerShare: 0,
    currentPrice: 0,
    sharesOutstanding: 0,
    reportDate: new Date().toISOString().split('T')[0],
  });

  const [isApiLoading, setIsApiLoading] = useState(false);

  const handleAutofill = async () => {
    if (!formData.symbol) {
      alert("Inserisci il simbolo prima di autocompletare dai dati API.");
      return;
    }
    
    setIsApiLoading(true);
    try {
      const data = await getCompanyFinancials(formData.symbol);
      setFormData(prev => ({ ...prev, ...data }));
    } catch (err: any) {
      alert(err.message || "Errore durante l'autocompletamento. Verifica il simbolo e l'API Key.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['symbol', 'companyName', 'sector', 'reportDate'].includes(name) 
        ? value 
        : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validazione base
    if (!formData.symbol || !formData.companyName) {
      alert('Inserisci almeno il simbolo e il nome dell\'azienda');
      setLoading(false);
      return;
    }

    // Simula un piccolo delay per l'analisi
    setTimeout(() => {
      setAnalysis(formData as CompanyFinancials);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <ApiKeySettings />
      <Card title="Inserisci i Dati Finanziari" subtitle="Compila i campi con i dati dal bilancio dell'azienda">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informazioni base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="Simbolo (Ticker)"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="es. AAPL"
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
                {isApiLoading ? 'Wait...' : 'Auto-Fill'}
              </Button>
            </div>
            <Input
              label="Nome Azienda"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="es. Apple Inc."
              required
            />
            <Input
              label="Settore"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="es. Technology"
            />
          </div>

        {/* Dati di Conto Economico */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Conto Economico</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ricavi (Revenue)"
              name="revenue"
              type="number"
              step="0.01"
              value={formData.revenue}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Utile Netto (Net Income)"
              name="netIncome"
              type="number"
              step="0.01"
              value={formData.netIncome}
              onChange={handleChange}
              helperText="In milioni"
            />
          </div>
        </div>

        {/* Dati di Stato Patrimoniale */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Stato Patrimoniale</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Totale Attività"
              name="totalAssets"
              type="number"
              step="0.01"
              value={formData.totalAssets}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Totale Passività"
              name="totalLiabilities"
              type="number"
              step="0.01"
              value={formData.totalLiabilities}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Patrimonio Netto"
              name="shareholdersEquity"
              type="number"
              step="0.01"
              value={formData.shareholdersEquity}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Debiti a Lungo Termine"
              name="longTermDebt"
              type="number"
              step="0.01"
              value={formData.longTermDebt}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Attività Correnti"
              name="currentAssets"
              type="number"
              step="0.01"
              value={formData.currentAssets}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Passività Correnti"
              name="currentLiabilities"
              type="number"
              step="0.01"
              value={formData.currentLiabilities}
              onChange={handleChange}
              helperText="In milioni"
            />
          </div>
        </div>

        {/* Dati per azione */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Dati per Azione</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="EPS (Earnings Per Share)"
              name="eps"
              type="number"
              step="0.01"
              value={formData.eps}
              onChange={handleChange}
            />
            <Input
              label="Book Value Per Share"
              name="bookValuePerShare"
              type="number"
              step="0.01"
              value={formData.bookValuePerShare}
              onChange={handleChange}
            />
            <Input
              label="Dividendo per Azione"
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
          <h4 className="font-semibold text-gray-900 mb-3">Dati di Mercato</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Prezzo Corrente"
              name="currentPrice"
              type="number"
              step="0.01"
              value={formData.currentPrice}
              onChange={handleChange}
              required
            />
            <Input
              label="Azioni in Circolazione"
              name="sharesOutstanding"
              type="number"
              step="1"
              value={formData.sharesOutstanding}
              onChange={handleChange}
              helperText="In milioni"
            />
            <Input
              label="Data Report"
              name="reportDate"
              type="date"
              value={formData.reportDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Analizza
          </Button>
        </div>
      </form>
      </Card>
    </div>
  );
};
