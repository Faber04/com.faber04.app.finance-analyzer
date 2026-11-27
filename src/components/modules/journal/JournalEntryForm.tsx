import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/common';
import { useTranslation } from '@/i18n';
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
  const { t } = useTranslation();
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
    if (!formData.symbol) newErrors.symbol = t('journal.errSymbol');
    if (!formData.companyName) newErrors.companyName = t('journal.errCompany');
    if (!formData.date) newErrors.date = t('journal.errDate');
    if (!formData.thesis) newErrors.thesis = t('journal.errThesis');

    if ((formData.type === 'buy' || formData.type === 'sell') && (!formData.pricePerShare || formData.pricePerShare <= 0)) {
       newErrors.pricePerShare = t('journal.errPrice');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof JournalEntry, value: JournalEntry[typeof field]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
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
    <Card title={initialData ? t('journal.editTitle') : t('journal.newTitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* riga 1: Simbolo e Nome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('journal.symbolLabel')}
            placeholder={t('journal.symbolPlaceholder')}
            value={formData.symbol}
            onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
            error={errors.symbol}
          />
          <Input
            label={t('journal.companyLabel')}
            placeholder={t('journal.companyPlaceholder')}
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            error={errors.companyName}
          />
        </div>

        {/* riga 2: Tipo e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('journal.entryTypeLabel')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="note">{t('journal.entryNote')}</option>
              <option value="buy">{t('journal.entryBuy')}</option>
              <option value="sell">{t('journal.entrySell')}</option>
            </select>
          </div>
          <Input
            label={t('journal.dateLabel')}
            type="date"
            value={formData.date?.split('T')[0] || ''}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Dettagli Trade (se applicabile) */}
        {isTrade && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{t('journal.tradeDetails')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label={t('journal.priceLabel')}
                type="number"
                min="0"
                step="0.01"
                placeholder={t('journal.pricePlaceholder')}
                value={formData.pricePerShare || ''}
                onChange={(e) => handleChange('pricePerShare', parseFloat(e.target.value))}
                error={errors.pricePerShare}
              />
              <Input
                label={t('journal.sharesLabel')}
                type="number"
                min="0"
                step="0.0001"
                placeholder={t('journal.sharesPlaceholder')}
                value={formData.shares || ''}
                onChange={(e) => handleChange('shares', parseFloat(e.target.value))}
              />
              <Input
                label={t('journal.targetLabel')}
                type="number"
                min="0"
                step="0.01"
                placeholder={t('journal.pricePlaceholder')}
                value={formData.targetPrice || ''}
                onChange={(e) => handleChange('targetPrice', parseFloat(e.target.value))}
              />
                 <Input
                label={t('journal.stopLabel')}
                type="number"
                min="0"
                step="0.01"
                placeholder={t('journal.pricePlaceholder')}
                value={formData.stopLoss || ''}
                onChange={(e) => handleChange('stopLoss', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Thesis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('journal.thesisLabel')}
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">{t('journal.thesisHint')}</span>
          </label>
          <textarea
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.thesis ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('journal.thesisPlaceholder')}
            value={formData.thesis}
            onChange={(e) => handleChange('thesis', e.target.value)}
          />
          {errors.thesis && <p className="mt-1 text-sm text-red-600 dark:text-danger-400">{errors.thesis}</p>}
        </div>

        {/* Tags */}
        <Input
          label={t('journal.tagsLabel')}
          placeholder={t('journal.tagsPlaceholder')}
          value={tagsInput}
          onChange={handleTagsChange}
          helperText={t('journal.tagsHelper')}
        />

        {/* Retrospettiva */}
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10/30 rounded-lg border border-blue-100 space-y-4">
             <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{t('journal.retroTitle')}</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('journal.outcomeLabel')}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.outcome || ''}
                      onChange={(e) => handleChange('outcome', e.target.value || undefined)}
                    >
                      <option value="">{t('journal.outcomeNone')}</option>
                      <option value="success">{t('journal.outcomeSuccess')}</option>
                      <option value="failure">{t('journal.outcomeFailure')}</option>
                      <option value="learning">{t('journal.outcomeLearning')}</option>
                    </select>
                  </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('journal.lessonsLabel')}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                  placeholder={t('journal.lessonsPlaceholder')}
                  value={formData.lessonsLearned}
                  onChange={(e) => handleChange('lessonsLearned', e.target.value)}
                />
              </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('journal.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? t('journal.saveEdit') : t('journal.saveNew')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
