import React, { useState } from 'react';
import { Card } from '@/components/common';
import { useTranslation } from '@/i18n';
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
  const { t, locale } = useTranslation();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-600 dark:text-success-400 bg-green-50 dark:bg-success-500/10 border-green-200 dark:border-success-700';
      case 'sell': return 'text-red-600 dark:text-danger-400 bg-red-50 dark:bg-danger-500/10 border-red-200 dark:border-danger-700';
      default: return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-700';
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
      case 'success': return 'text-green-600 dark:text-success-400';
      case 'failure': return 'text-red-600 dark:text-danger-400';
      case 'learning': return 'text-primary-600 dark:text-primary-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('journal.cardDeleteConfirm', { symbol: entry.symbol }))) {
      onDelete(entry.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{entry.symbol}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center border ${getTypeColor(entry.type)}`}>
              {getTypeIcon(entry.type)}
              {entry.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{entry.companyName}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {new Date(entry.date).toLocaleDateString(locale)}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title={t('journal.cardEdit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title={t('journal.cardDelete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trade Details (if applicable) */}
      {(entry.type === 'buy' || entry.type === 'sell') && entry.pricePerShare && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('journal.cardSharePrice')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(entry.pricePerShare)}</p>
          </div>
          {entry.shares && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('journal.cardQuantity')}</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.shares}</p>
            </div>
          )}
          {entry.targetPrice && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('journal.cardTarget')}</p>
              <p className="font-semibold px-2 py-0.5 bg-green-100 dark:bg-success-500/20 text-green-700 dark:text-success-400 rounded inline-block text-sm">
                {formatCurrency(entry.targetPrice)}
              </p>
            </div>
          )}
          {entry.stopLoss && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('journal.cardStop')}</p>
              <p className="font-semibold px-2 py-0.5 bg-red-100 dark:bg-danger-500/20 text-red-700 dark:text-danger-300 rounded inline-block text-sm">
                {formatCurrency(entry.stopLoss)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Thesis */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('journal.cardThesis')}</h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{entry.thesis}</p>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Retrospective Toggle */}
      {(entry.outcome || entry.lessonsLearned) && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors w-full"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {t('journal.cardRetro')}
          </button>

          {isExpanded && (
            <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-500/10 rounded-lg space-y-3">
              {entry.outcome && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('journal.cardOutcome')}</p>
                  <p className={`font-semibold capitalize text-sm ${getOutcomeColor(entry.outcome)}`}>
                    {entry.outcome}
                  </p>
                </div>
              )}
              {entry.lessonsLearned && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('journal.cardLessons')}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm italic whitespace-pre-wrap">"{entry.lessonsLearned}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
