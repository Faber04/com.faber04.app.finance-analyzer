import React from 'react';
import { Card } from '@/components/common';
import { useAppStore } from '@/store';
import { TrendingUp, TrendingDown, DollarSign, FileText, X, Briefcase } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/financial-calculations';
import { SectorPieChart, GainLossBarChart } from '@/components/charts';

// Mappa colori per raccomandazione
const RECOMMENDATION_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  'strong-buy': { label: 'Strong Buy', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'buy':        { label: 'Buy',        color: 'text-green-700',   bg: 'bg-green-100'   },
  'hold':       { label: 'Hold',       color: 'text-yellow-700',  bg: 'bg-yellow-100'  },
  'avoid':      { label: 'Avoid',      color: 'text-red-700',     bg: 'bg-red-100'     },
};

export const DashboardPage: React.FC = () => {
  const { portfolio, journalEntries, recentAnalyses, removeRecentAnalysis } = useAppStore();

  const stats = [
    {
      label: 'Valore Portfolio',
      value: formatCurrency(portfolio.totalValue),
      icon: DollarSign,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      label: 'Gain/Loss',
      value: formatCurrency(portfolio.totalGainLoss),
      subValue: formatPercentage(portfolio.totalGainLossPercent),
      icon: portfolio.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.totalGainLoss >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: portfolio.totalGainLoss >= 0 ? 'bg-success-100' : 'bg-danger-100',
    },
    {
      label: 'Posizioni',
      value: portfolio.positions.length.toString(),
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Note Journal',
      value: journalEntries.length.toString(),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Benvenuto nel tuo Finance Analyzer</h1>
        <p className="text-primary-100">
          Analizza aziende, gestisci il tuo portfolio e tieni traccia delle tue decisioni di investimento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  {stat.subValue && (
                    <p className={`text-sm font-semibold ${stat.color} mt-1`}>
                      {stat.subValue}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Info & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocazione Settori */}
        <SectorPieChart
          title="Allocazione per Settore"
          subtitle="Distribuzione valore portfolio"
          data={portfolio.positions.map((p) => ({
            name: p.sector || 'N/A',
            value: p.shares * p.currentPrice,
          }))}
          valueFormatter={formatCurrency}
        />

        {/* Gain/Loss per Posizione */}
        <GainLossBarChart
          title="Performance per Posizione"
          subtitle="Guadagno/Perdita in Euro"
          data={portfolio.positions.map((p) => ({
            name: p.symbol,
            value: (p.currentPrice - p.avgCostPerShare) * p.shares,
          }))}
          valueFormatter={formatCurrency}
        />

        {/* Analisi Recenti */}
        <Card title="Analisi Recenti" subtitle="Ultime aziende analizzate">
          {recentAnalyses.length === 0 ? (
            <p className="text-gray-500 italic">Nessuna analisi effettuata ancora</p>
          ) : (
            <ul className="space-y-2">
              {recentAnalyses.map((analysis) => {
                const rec =
                  RECOMMENDATION_STYLES[analysis.recommendation] ??
                  RECOMMENDATION_STYLES['hold'];
                const date = new Date(analysis.analyzedAt).toLocaleDateString('it-IT', {
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
                          Score:{' '}
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
                      title="Rimuovi dall'elenco"
                      aria-label={`Rimuovi analisi di ${analysis.companyName}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Quick Tips */}
        <Card title="Suggerimenti per Investitori Value">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Cerca aziende con P/E &lt; 15 e ROE &gt; 15%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Prediligi aziende con debito basso (Debt/Equity &lt; 0.5)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Documenta sempre la tua thesis prima di investire</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Rivedi periodicamente le tue posizioni e impara dagli errori</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
