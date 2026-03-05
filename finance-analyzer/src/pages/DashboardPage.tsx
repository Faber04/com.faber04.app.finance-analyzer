import React from 'react';
import { Card } from '@/components/common';
import { useAppStore } from '@/store';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/financial-calculations';

export const DashboardPage: React.FC = () => {
  const { portfolio, journalEntries, currentAnalysis } = useAppStore();

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

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ultima Analisi */}
        <Card title="Ultima Analisi">
          {currentAnalysis ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-900">
                  {currentAnalysis.companyName}
                </span>
                <span className="text-gray-600 ml-2">({currentAnalysis.symbol})</span>
              </div>
              <div className="text-sm text-gray-600">
                Prezzo: <span className="font-semibold">${currentAnalysis.currentPrice}</span>
              </div>
              <div className="text-sm text-gray-600">
                Settore: {currentAnalysis.sector || 'N/A'}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Nessuna analisi effettuata ancora</p>
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

// Import Briefcase icon
import { Briefcase } from 'lucide-react';
