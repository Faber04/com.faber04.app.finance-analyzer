import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { JournalEntryCard } from './JournalEntryCard';
import { JournalFilters } from './JournalFilters';
import { EditJournalModal } from './EditJournalModal';
import { JournalEntry } from '@/types';
import { FileText } from 'lucide-react';

export const JournalList: React.FC = () => {
  const { journalEntries, updateJournalEntry, removeJournalEntry } = useAppStore();
  
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
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nessuna nota nel journal</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Inizia a documentare le tue decisioni di investimento, le tesi e le retrospettive.
        </p>
      </div>
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
          <p className="text-gray-500">Nessuna nota trovata con questi filtri.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setTagFilter('');
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Azzera filtri
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
