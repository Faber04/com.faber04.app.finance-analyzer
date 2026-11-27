import React from 'react';

// Blocchi skeleton per gli stati di loading (PR5)
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden="true" />
);

// Card skeleton che imita un pannello risultati (ratio/score)
export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-white rounded-lg shadow-md p-6 space-y-4" aria-label="loading">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
);
