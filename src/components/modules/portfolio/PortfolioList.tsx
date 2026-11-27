import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Card, Button, ErrorState, translateError } from "@/components/common";
import { useAppStore } from "@/store";
import { useTranslation } from "@/i18n";
import { PortfolioPosition } from "@/types";
import {
  formatCurrency,
  formatPercentage,
} from "@/utils/financial-calculations";
import { getBulkQuotes } from "@/services";
import { PositionCard } from "./PositionCard";
import { EditPositionModal } from "./EditPositionModal";

export const PortfolioList: React.FC = () => {
  const { portfolio, removePosition, updatePortfolioPrice } = useAppStore();
  const { t } = useTranslation();
  const [positionToEdit, setPositionToEdit] =
    useState<PortfolioPosition | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefreshPrices = async () => {
    if (portfolio.positions.length === 0) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const symbols = portfolio.positions.map((p) => p.symbol);
      const newPrices = await getBulkQuotes(symbols);
      Object.entries(newPrices).forEach(([sym, price]) => {
        updatePortfolioPrice(sym, price);
      });
    } catch (err) {
      // PR5: error state distinto con retry invece di un alert
      setRefreshError(translateError(t, err));
    } finally {
      setIsRefreshing(false);
    }
  };

  const {
    positions,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
  } = portfolio;
  const isPositive = totalGainLoss >= 0;

  const handleDelete = (id: string) => {
    if (window.confirm(t("portfolio.deleteConfirm"))) {
      removePosition(id);
    }
  };

  // Nota: lo stato vuoto è gestito da PortfolioPage con EmptyState + CTA (PR5)

  return (
    <div className="space-y-6">

      {refreshError && (
        <ErrorState
          compact
          title={t("portfolio.refreshErrorTitle")}
          message={refreshError}
          onRetry={handleRefreshPrices}
          retryLabel={t("common.retry")}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{t("portfolio.listTitle")}</h2>
        <Button
          variant="secondary"
          onClick={handleRefreshPrices}
          disabled={isRefreshing || positions.length === 0}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? t("portfolio.refreshing") : t("portfolio.refresh")}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <DollarSign size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t("portfolio.totalValue")}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <DollarSign size={20} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t("portfolio.totalCost")}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`!p-4 ${isPositive ? "border-l-4 border-success-500" : "border-l-4 border-danger-500"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isPositive ? "bg-success-50" : "bg-danger-50"}`}
            >
              {isPositive ? (
                <TrendingUp size={20} className="text-success-600" />
              ) : (
                <TrendingDown size={20} className="text-danger-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t("portfolio.gainLoss")}
              </p>
              <p
                className={`text-lg font-bold ${isPositive ? "text-success-700" : "text-danger-700"}`}
              >
                {formatCurrency(totalGainLoss, 2, true)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`!p-4 ${isPositive ? "border-l-4 border-success-500" : "border-l-4 border-danger-500"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isPositive ? "bg-success-50" : "bg-danger-50"}`}
            >
              {isPositive ? (
                <TrendingUp size={20} className="text-success-600" />
              ) : (
                <TrendingDown size={20} className="text-danger-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t("portfolio.returnPct")}
              </p>
              <p
                className={`text-lg font-bold ${isPositive ? "text-success-700" : "text-danger-700"}`}
              >
                {formatPercentage(totalGainLossPercent)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista posizioni */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("portfolio.positionsCount", { count: positions.length })}
        </h2>
        {positions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            onEdit={setPositionToEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <EditPositionModal
        position={positionToEdit}
        onClose={() => setPositionToEdit(null)}
      />
    </div>
  );
};
