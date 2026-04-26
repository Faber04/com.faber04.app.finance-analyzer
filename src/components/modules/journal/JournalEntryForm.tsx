import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/common';
import { JournalEntry } from '@/types';

interface JournalEntryFormProps {
  initialData?: JournalEntry;
  onSubmit: (data: Omit<JournalEntry, 'id'>) => void;
  onCancel: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    symbol: '',
    companyName: '',
    type: 'note',
    date: new Date().toISOString().split('T')[0],
    shares: undefined,
    pricePerShare: undefined,
    thesis: '',
    targetPrice: undefined,
    stopLoss: undefined,
    outcome: undefined,
    lessonsLearned: '',
    tags: []
  });

  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTagsInput(initialData.tags?.join(', ') || '');
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.symbol) newErrors.symbol = 'Simbolo richiesto';
    if (!formData.companyName) newErrors.companyName = 'Nome azienda richiesto';
    if (!formData.date) newErrors.date = 'Data richiesta';
    if (!formData.thesis) newErrors.thesis = 'Tesi di investimento richiesta';
    
    if ((formData.type === 'buy' || formData.type === 'sell') && (!formData.pricePerShare || formData.pricePerShare <= 0)) {
       newErrors.pricePerShare = 'Prezzo richiesto per buy/sell';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof JournalEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined } as any));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    const splitTags = e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setFormData(prev => ({ ...prev, tags: splitTags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Omit<JournalEntry, 'id'>);
    }
  };

  const isTrade = formData.type === 'buy' || formData.type === 'sell';

  return (
    <Card title={initialData ? "Modifica Nota" : "Nuova Nota Journal"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* riga 1: Simbolo e Nome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Simbolo / Ticker *"
            placeholder="es. AAPL"
            value={formData.symbol}
            onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
            error={errors.symbol}
          />
          <Input
            label="Nome Azienda *"
            placeholder="es. Apple Inc."
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            error={errors.companyName}
          />
        </div>

        {/* riga 2: Tipo e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo di Nota *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="note">Note Generali</option>
              <option value="buy">Acquisto (Buy)</option>
              <option value="sell">Vendita (Sell)</option>
            </select>
          </div>
          <Input
            label="Data *"
            type="date"
            value={formData.date?.split('T')[0] || ''}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Dettagli Trade (se applicabile) */}
        {isTrade && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
            <h4 className="text-sm font-bold text-gray-800">Dettagli Operazione</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Prezzo di carico *"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.pricePerShare || ''}
                onChange={(e) => handleChange('pricePerShare', parseFloat(e.target.value))}
                error={errors.pricePerShare}
              />
              <Input
                label="Quantità (Azioni)"
                type="number"
                min="0"
                step="0.0001"
                placeholder="0"
                value={formData.shares || ''}
                onChange={(e) => handleChange('shares', parseFloat(e.target.value))}
              />
              <Input
                label="Target Price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.targetPrice || ''}
                onChange={(e) => handleChange('targetPrice', parseFloat(e.target.value))}
              />
                 <Input
                label="Stop Loss"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.stopLoss || ''}
                onChange={(e) => handleChange('stopLoss', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Thesis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tesi di Investimento *
            <span className="text-gray-400 font-normal ml-2">(Perché stai facendo questa operazione o analisi?)</span>
          </label>
          <textarea
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] ${
              errors.thesis ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descrivi la tua analisi, tesi, catalizzatori o rischi..."
            value={formData.thesis}
            onChange={(e) => handleChange('thesis', e.target.value)}
          />
          {errors.thesis && <p className="mt-1 text-sm text-red-600">{errors.thesis}</p>}
        </div>

        {/* Tags */}
        <Input
          label="Tags"
          placeholder="value, tech, dividendo (separati da virgola)"
          value={tagsInput}
          onChange={handleTagsChange}
          helperText="Aggiungi tags per ritrovare facilmente le tue note"
        />

        {/* Retrospettiva */}
        <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100 space-y-4">
             <h4 className="text-sm font-bold text-gray-800">Retrospettiva (Opzionale)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risultato Finale
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.outcome || ''}
                      onChange={(e) => handleChange('outcome', e.target.value || undefined)}
                    >
                      <option value="">Nessuno / In corso</option>
                      <option value="success">Successo (Gain / Tesi confermata)</option>
                      <option value="failure">Fallimento (Loss / Tesi errata)</option>
                      <option value="learning">Lezione (Pari o esperienza formativa)</option>
                    </select>
                  </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lezioni Apprese
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                  placeholder="Cosa hai imparato da questo trade / analisi? Cosa faresti diversamente?"
                  value={formData.lessonsLearned}
                  onChange={(e) => handleChange('lessonsLearned', e.target.value)}
                />
              </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Salva Modifiche' : 'Salva Nota'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
