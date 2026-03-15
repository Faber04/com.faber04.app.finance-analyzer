import React, { useState } from 'react';
import { Button } from '@/components/common';
import { 
  JournalList, 
  JournalEntryForm 
} from '@/components/modules/journal';
import { useAppStore } from '@/store';
import { Plus } from 'lucide-react';
import { JournalEntry } from '@/types';

export const JournalPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { addJournalEntry } = useAppStore();

  const handleAddEntry = (data: Omit<JournalEntry, 'id'>) => {
    addJournalEntry(data);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Journal</h1>
          <p className="text-gray-600">
            Documenta le tue decisioni, analizza i risultati e impara dalle esperienze.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? 'Nascondi Form' : 'Nuova Nota'}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <JournalEntryForm 
            onSubmit={handleAddEntry} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}

      <JournalList />
    </div>
  );
};

