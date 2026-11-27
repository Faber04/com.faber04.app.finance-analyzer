import React from 'react';
import { Card } from '@/components/common';
import { FieldProvenance, HistoricalMetrics, ProvenanceSource, ValueInvestingScore } from '@/types';
import { useTranslation } from '@/i18n';
import { CheckCircle2, MinusCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface VerdictCardProps {
  score: ValueInvestingScore;
  history?: HistoricalMetrics[] | null; // trend 10y da FMP (PR2)
  reportDate?: string; // data del report dei fondamentali
  provenance?: FieldProvenance | null; // badge provenance compatto
}

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

// PR6: verdict card — anello score, badge recommendation, sparkline 10y, warning dati > 12 mesi, provenance
export const VerdictCard: React.FC<VerdictCardProps> = ({ score, history, reportDate, provenance }) => {
  const { t, locale } = useTranslation();

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success-700 stroke-success-500';
    if (s >= 60) return 'text-brand-teal stroke-brand-teal';
    if (s >= 40) return 'text-yellow-600 stroke-brand-amber';
    return 'text-danger-700 stroke-danger-500';
  };
  const scoreColor = getScoreColor(score.overallScore);

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

  // "As of reportDate" + warning se i dati sono più vecchi di 12 mesi
  const isStale = (() => {
    if (!reportDate) return false;
    const report = new Date(reportDate);
    if (isNaN(report.getTime())) return false;
    const months = (Date.now() - report.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return months > 12;
  })();

  // Sparkline trend 10y: ROE % per anno se disponibile, altrimenti EPS
  const trendData = (history ?? [])
    .map((h) => ({ year: h.date.slice(0, 4), value: h.roe ?? h.eps }))
    .filter((d): d is { year: string; value: number } => d.value !== null && d.value !== undefined)
    .sort((a, b) => a.year.localeCompare(b.year));
  const trendUsesRoe = (history ?? []).some((h) => h.roe !== null && h.roe !== undefined);

  // Badge provenance compatto: quanti campi per sorgente
  const provCounts: Record<ProvenanceSource, number> = { api: 0, derived: 0, missing: 0, manual: 0 };
  if (provenance) {
    for (const source of Object.values(provenance)) {
      if (source in provCounts) provCounts[source] += 1;
    }
  }
  const hasProvenance = provenance && Object.keys(provenance).length > 0;

  const passedCount = score.criteria.filter((c) => c.status === 'pass').length;
  const naCount = score.criteria.filter((c) => c.status === 'na').length;
  const totalCount = score.criteria.length - naCount;

  return (
    <Card>
      <div className="space-y-6">
        {/* Header: anello score + raccomandazione */}
        <div className="text-center border-b pb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('score.title')}</h3>
          <p className="text-gray-600 mb-4">
            {score.companyName} ({score.symbol})
          </p>

          <div className="flex items-center justify-center gap-8 mb-4 flex-wrap">
            {/* Anello score 0-100 */}
            <svg
              width={110}
              height={110}
              viewBox="0 0 110 110"
              role="img"
              aria-label={t('score.ringLabel', { score: score.overallScore })}
            >
              <circle cx={55} cy={55} r={RING_R} fill="none" stroke="#e5e7eb" strokeWidth={10} />
              <circle
                cx={55}
                cy={55}
                r={RING_R}
                fill="none"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - score.overallScore / 100)}
                transform="rotate(-90 55 55)"
                className={scoreColor.split(' ')[1]}
              />
              <text x={55} y={63} textAnchor="middle" fontSize={26} fontWeight={700} className={scoreColor.split(' ')[0].replace('text-', 'fill-')}>
                {score.overallScore}
              </text>
            </svg>

            <div>{getRecommendationBadge(score.recommendation)}</div>
          </div>

          <div className="text-sm text-gray-600">
            {t('score.criteriaMet', { passed: passedCount, total: totalCount })}
            {naCount > 0 && ` ${t('score.naExcluded', { count: naCount })}`}
          </div>

          {/* As of reportDate + warning dati vecchi */}
          {reportDate && (
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">
                {t('score.asOf', { date: new Date(reportDate).toLocaleDateString(locale) })}
              </span>
              {isStale && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-amber/20 text-yellow-800 border border-brand-amber">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('score.staleWarning')}
                </span>
              )}
            </div>
          )}

          {/* Sparkline trend 10y */}
          {trendData.length >= 2 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1 text-left">
                {trendUsesRoe ? t('score.trend10y') : t('score.trendEps')}
              </p>
              <div style={{ width: '100%', height: 64 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Badge provenance compatto */}
          {hasProvenance && (
            <p className="mt-3 text-xs text-gray-500">
              {t('score.provenanceBadge', {
                api: provCounts.api,
                derived: provCounts.derived,
                missing: provCounts.missing,
                manual: provCounts.manual,
              })}
            </p>
          )}
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
                <div className="font-medium text-gray-900">{criterion.name}</div>
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
                  <span className="text-brand-teal mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t pt-4 text-xs text-gray-500 italic">{t('score.disclaimer')}</div>
      </div>
    </Card>
  );
};
