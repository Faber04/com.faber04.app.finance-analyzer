import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text: string;
  tip?: string;
  action?: React.ReactNode; // CTA (es. bottone/form)
}

// Empty state con CTA: mai aree bianche (PR5)
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, text, tip, action }) => {
  return (
    <div className="glass p-6 transition-colors duration-200">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon size={32} className="text-primary-400 dark:text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">{text}</p>
        {tip && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/70 rounded-lg max-w-sm mx-auto p-3 text-left">
            {tip}
          </p>
        )}
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
};
