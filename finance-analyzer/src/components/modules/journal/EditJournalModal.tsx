import React from 'react';
import { JournalEntry } from '@/types';
import { JournalEntryForm } from './JournalEntryForm';

interface EditJournalModalProps {
  isOpen: boolean;
  entry: JournalEntry | null;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<JournalEntry>) => void;
}

export const EditJournalModal: React.FC<EditJournalModalProps> = ({
  isOpen,
  entry,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !entry) return null;

  const handleSubmit = (data: Omit<JournalEntry, 'id'>) => {
    onSubmit(entry.id, data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl my-8">
         <JournalEntryForm
            initialData={entry}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
      </div>
    </div>
  );
};
