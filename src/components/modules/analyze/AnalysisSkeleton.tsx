import React from 'react';
import { SkeletonCard } from '@/components/common';

// Skeleton mostrata durante la ricerca/analisi (hero search o submit form) — PR5
export const AnalysisSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true">
      <SkeletonCard rows={5} />
      <SkeletonCard rows={3} />
    </div>
  );
};
