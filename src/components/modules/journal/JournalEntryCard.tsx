import React, { useState } from 'react';
import { Card } from '@/components/common';
import { JournalEntry } from '@/types';
import { formatCurrency } from '@/utils/financial-calculations';
import { Trash2, Edit2, TrendingUp, TrendingDown, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ 
  entry, 
  onEdit, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-600 bg-green-50 border-green-200';
      case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-4 h-4 mr-1" />;
      case 'sell': return <TrendingDown className="w-4 h-4 mr-1" />;
      default: return <BookOpen className="w-4 h-4 mr-1" />;
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'success': return 'text-green-600';
      case 'failure': return 'text-red-600';
      case 'learning': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Sei sicuro di voler eliminare questa nota per ' + entry.symbol + '?')) {
      onDelete(entry.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{entry.symbol}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center border ${getTypeColor(entry.type)}`}>
              {getTypeIcon(entry.type)}
              {entry.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500">{entry.companyName}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500 mb-2">
            {new Date(entry.date).toLocaleDateString()}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Modifica"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Elimina"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trade Details (if applicable) */}
      {(entry.type === 'buy' || entry.type === 'sell') && entry.pricePerShare && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">Prezzo Azione</p>
            <p className="font-semibold text-gray-900">{formatCurrency(entry.pricePerShare)}</p>
          </div>
          {entry.shares && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Quantità</p>
              <p className="font-semibold text-gray-900">{entry.shares}</p>
            </div>
          )}
          {entry.targetPrice && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Target Price</p>
              <p className="font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded inline-block text-sm">
                {formatCurrency(entry.targetPrice)}
              </p>
            </div>
          )}
          {entry.stopLoss && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Stop Loss</p>
              <p className="font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded inline-block text-sm">
                {formatCurrency(entry.stopLoss)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Thesis */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Tesi di Investimento</h4>
        <p className="text-gray-600 text-sm whitespace-pre-wrap">{entry.thesis}</p>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Retrospective Toggle */}
      {(entry.outcome || entry.lessonsLearned) && (
        <div className="border-t border-gray-100 pt-3 mt-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors w-full"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            Retrospettiva
          </button>
          
          {isExpanded && (
            <div className="mt-3 p-3 bg-blue-50/50 rounded-lg space-y-3">
              {entry.outcome && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Risultato Finale</p>
                  <p className={`font-semibold capitalize text-sm ${getOutcomeColor(entry.outcome)}`}>
                    {entry.outcome}
                  </p>
                </div>
              )}
              {entry.lessonsLearned && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Lezioni Apprese</p>
                  <p className="text-gray-700 text-sm italic whitespace-pre-wrap">"{entry.lessonsLearned}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
