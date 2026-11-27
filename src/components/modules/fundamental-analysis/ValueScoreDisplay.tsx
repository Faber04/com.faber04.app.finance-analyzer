import React from 'react';
import { Card } from '@/components/common';
import { ValueInvestingScore } from '@/types';
import { useTranslation } from '@/i18n';
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';

interface ValueScoreDisplayProps {
  score: ValueInvestingScore;
}

export const ValueScoreDisplay: React.FC<ValueScoreDisplayProps> = ({ score }) => {
  const { t } = useTranslation();

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success-700';
    if (s >= 60) return 'text-primary-600';
    if (s >= 40) return 'text-yellow-600';
    return 'text-danger-700';
  };

  const getRecommendationBadge = (rec: ValueInvestingScore['recommendation']) => {
    const badges = {
      'strong-buy': 'bg-success-100 text-success-800 border-success-300',
      'buy': 'bg-primary-100 text-primary-800 border-primary-300',
      'hold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'avoid': 'bg-danger-100 text-danger-800 border-danger-300',
    };
    
    const labelKeys = {
      'strong-buy': 'score.recStrongBuy',
      'buy': 'score.recBuy',
      'hold': 'score.recHold',
      'avoid': 'score.recAvoid',
    } as const;

    return (
      <span className={`px-4 py-2 rounded-lg font-bold text-lg border-2 ${badges[rec]}`}>
        {t(labelKeys[rec])}
      </span>
    );
  };

  const passedCount = score.criteria.filter(c => c.status === 'pass').length;
  const naCount = score.criteria.filter(c => c.status === 'na').length;
  const totalCount = score.criteria.length - naCount;

  return (
    <Card>
      <div className="space-y-6">
        {/* Header con score e raccomandazione */}
        <div className="text-center border-b pb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {t('score.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {score.companyName} ({score.symbol})
          </p>

          <div className="flex items-center justify-center gap-8 mb-4">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(score.overallScore)}`}>
                {score.overallScore}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {t('score.outOf')}
              </div>
            </div>
            
            <div>
              {getRecommendationBadge(score.recommendation)}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {t('score.criteriaMet', { passed: passedCount, total: totalCount })}
            {naCount > 0 && ` ${t('score.naExcluded', { count: naCount })}`}
          </div>
        </div>

        {/* Criteri dettagliati */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">{t('score.criteriaTitle')}</h4>
          {score.criteria.map((criterion, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                criterion.status === 'pass'
                  ? 'bg-success-50'
                  : criterion.status === 'na'
                    ? 'bg-gray-50'
                    : 'bg-danger-50'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {criterion.status === 'pass' ? (
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                ) : criterion.status === 'na' ? (
                  <MinusCircle className="w-5 h-5 text-gray-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                  {criterion.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {t('score.value')} <span className="font-semibold">{criterion.value}</span> |{' '}
                  {t('score.benchmark')} <span className="font-semibold">{criterion.benchmark}</span>
                </div>
              </div>

              <div className="flex-shrink-0 text-xs text-gray-500">
                {t('score.weight', { weight: criterion.weight })}
              </div>
            </div>
          ))}
        </div>

        {/* Note aggiuntive */}
        {score.notes.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">{t('score.notes')}</h4>
            <ul className="space-y-1">
              {score.notes.map((note, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t pt-4 text-xs text-gray-500 italic">
          {t('score.disclaimer')}
        </div>
      </div>
    </Card>
  );
};
