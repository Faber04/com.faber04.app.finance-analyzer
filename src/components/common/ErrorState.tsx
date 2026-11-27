import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode; // es. link a Settings per invalid-key
  compact?: boolean; // variante inline compatta (sotto un form/hero)
}

// Error state con retry opzionale (PR5): stati distinti per tipo di errore via messaggio tradotto
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel,
  action,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="rounded-lg border border-danger-200 bg-red-50 p-3 flex items-start gap-2 text-sm text-danger-700" role="alert">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          <p>{message}</p>
          {(onRetry || action) && (
            <div className="mt-2 flex items-center gap-2">
              {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} type="button">
                  {retryLabel}
                </Button>
              )}
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6" role="alert">
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-danger-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">{message}</p>
        {(onRetry || action) && (
          <div className="mt-5 flex items-center justify-center gap-3">
            {onRetry && <Button onClick={onRetry} type="button">{retryLabel}</Button>}
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
