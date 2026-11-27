import React from 'react';
import { Card, EmptyState } from '@/components/common';
import { useAppStore } from '@/store';
import { useTranslation } from '@/i18n';
import { History, X } from 'lucide-react';

// Mappa colori per raccomandazione
const RECOMMENDATION_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  'strong-buy': { label: 'Strong Buy', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'buy':        { label: 'Buy',        color: 'text-green-700',   bg: 'bg-green-100'   },
  'hold':       { label: 'Hold',       color: 'text-yellow-700',  bg: 'bg-yellow-100'  },
  'avoid':      { label: 'Avoid',      color: 'text-red-700',     bg: 'bg-red-100'     },
};

// Analisi recenti in fondo alla home Analyze: righe di servizio, max 10 (gestite dallo store)
export const RecentAnalyses: React.FC = () => {
  const { recentAnalyses, removeRecentAnalysis } = useAppStore();
  const { t, locale } = useTranslation();

  if (recentAnalyses.length === 0) {
    // PR5: empty state (fuori dalla Card, che mostrerebbe un box dentro il box)
    return <EmptyState icon={History} title={t('analyze.recentTitle')} text={t('analyze.recentEmpty')} />;
  }

  return (
    <Card title={t('analyze.recentTitle')} subtitle={t('analyze.recentSubtitle')}>
      <ul className="space-y-2">
          {recentAnalyses.map((analysis) => {
            const rec =
              RECOMMENDATION_STYLES[analysis.recommendation] ??
              RECOMMENDATION_STYLES['hold'];
            const date = new Date(analysis.analyzedAt).toLocaleDateString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            return (
              <li
                key={analysis.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Info azienda */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">
                      {analysis.companyName}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {analysis.symbol}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rec.bg} ${rec.color}`}
                    >
                      {rec.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>${analysis.currentPrice.toFixed(2)}</span>
                    <span>
                      {t('analyze.recentScore')}{' '}
                      <strong className="text-gray-700">{analysis.overallScore}/100</strong>
                    </span>
                    {analysis.sector && <span>{analysis.sector}</span>}
                    <span>{date}</span>
                  </div>
                </div>

                {/* Pulsante rimozione */}
                <button
                  onClick={() => removeRecentAnalysis(analysis.id)}
                  className="flex-shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title={t('analyze.recentRemove')}
                  aria-label={t('analyze.recentRemoveLabel', { company: analysis.companyName })}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
      </ul>
    </Card>
  );
};
