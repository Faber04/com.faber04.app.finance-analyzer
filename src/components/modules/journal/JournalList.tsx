import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { useTranslation } from '@/i18n';
import { EmptyState, Button } from '@/components/common';
import { JournalEntryCard } from './JournalEntryCard';
import { JournalFilters } from './JournalFilters';
import { EditJournalModal } from './EditJournalModal';
import { JournalEntry } from '@/types';
import { FileText, Plus } from 'lucide-react';

interface JournalListProps {
  onAddEntry?: () => void; // CTA dell'empty state (PR5)
}

export const JournalList: React.FC<JournalListProps> = ({ onAddEntry }) => {
  const { journalEntries, updateJournalEntry, removeJournalEntry } = useAppStore();
  const { t } = useTranslation();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  
  // Edit modal state
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Filtriamo le entries memoizzate
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      // Testuale (simbolo o nome)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        entry.symbol.toLowerCase().includes(searchLower) ||
        entry.companyName.toLowerCase().includes(searchLower) ||
        entry.thesis.toLowerCase().includes(searchLower);

      // Tipo di trade
      const matchesType = typeFilter === 'all' || entry.type === typeFilter;

      // Tags
      const tagLower = tagFilter.toLowerCase().trim();
      const matchesTag = !tagLower || (entry.tags && entry.tags.some(t => t.toLowerCase().includes(tagLower)));

      return matchesSearch && matchesType && matchesTag;
    });
  }, [journalEntries, searchTerm, typeFilter, tagFilter]);

  if (journalEntries.length === 0) {
    // PR5: empty state con CTA
    return (
      <EmptyState
        icon={FileText}
        title={t('journal.emptyTitle')}
        text={t('journal.emptyText')}
        action={
          onAddEntry && (
            <Button onClick={onAddEntry} type="button" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('journal.emptyCta')}
            </Button>
          )
        }
      />
    );
  }

  return (
    <div>
      <JournalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
      />

      {filteredEntries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">{t('journal.noResults')}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setTagFilter('');
            }}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium"
          >
            {t('journal.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={setEditingEntry}
              onDelete={removeJournalEntry}
            />
          ))}
        </div>
      )}

      {/* Edit Modal (Nascosto di default) */}
         <EditJournalModal
          isOpen={editingEntry !== null}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSubmit={updateJournalEntry}
        />
    </div>
  );
};
