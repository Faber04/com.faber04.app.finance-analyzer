import React from 'react';
import { Card, Input } from '@/components/common';
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
  return (
    <Card className="mb-6 bg-gray-50/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ricerca Testuale */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cerca
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Simbolo o Azienda..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Filtro Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">Tutti i tipi</option>
            <option value="note">Note</option>
            <option value="buy">Acquisti (Buy)</option>
            <option value="sell">Vendite (Sell)</option>
          </select>
        </div>

        {/* Filtro Tag */}
        <div>
           <Input
            label="Filtra per Tag"
            placeholder="es. tech, dividend..."
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};
