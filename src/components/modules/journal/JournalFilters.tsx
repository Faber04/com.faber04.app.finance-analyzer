import React from 'react';
import { Card, Input } from '@/components/common';
import { useTranslation } from '@/i18n';
import { Search } from 'lucide-react';

interface JournalFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
}

export const JournalFilters: React.FC<JournalFiltersProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  tagFilter,
  onTagFilterChange,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800/60/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ricerca Testuale */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('journal.searchLabel')}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t('journal.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Filtro Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('journal.typeLabel')}
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">{t('journal.typeAll')}</option>
            <option value="note">{t('journal.typeNote')}</option>
            <option value="buy">{t('journal.typeBuy')}</option>
            <option value="sell">{t('journal.typeSell')}</option>
          </select>
        </div>

        {/* Filtro Tag */}
        <div>
           <Input
            label={t('journal.tagLabel')}
            placeholder={t('journal.tagPlaceholder')}
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};
