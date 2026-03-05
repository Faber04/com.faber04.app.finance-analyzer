import React from 'react';
import { Card } from '@/components/common';

export const JournalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Journal</h1>
        <p className="text-gray-600">
          Documenta le tue decisioni e impara dalle esperienze
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Modulo Journal in arrivo! 📝
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Qui potrai documentare le tue thesis e retrospettive
          </p>
        </div>
      </Card>
    </div>
  );
};
