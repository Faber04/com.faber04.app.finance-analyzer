import React from "react";
import { TrendingUp, TrendingDown, Trash2, Edit2 } from "lucide-react";
import { Card } from "@/components/common";
import { PortfolioPosition } from "@/types";
import {
  formatCurrency,
  formatPercentage,
} from "@/utils/financial-calculations";

interface PositionCardProps {
  position: PortfolioPosition;
  onEdit: (position: PortfolioPosition) => void;
  onDelete: (id: string) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  onEdit,
  onDelete,
}) => {
  const currentValue = position.shares * position.currentPrice;
  const costBasis = position.shares * position.avgCostPerShare;
  const gainLoss = currentValue - costBasis;
  const gainLossPercent = costBasis !== 0 ? (gainLoss / costBasis) * 100 : 0;
  const isPositive = gainLoss >= 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        {/* Symbol & Company */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 text-primary-700 font-bold text-sm px-3 py-1 rounded-lg">
              {position.symbol}
            </div>
            {position.sector && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {position.sector}
              </span>
            )}
          </div>
          <p className="text-gray-800 font-semibold mt-1 truncate">
            {position.companyName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Acquistato il{" "}
            {new Date(position.purchaseDate).toLocaleDateString("it-IT")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4 shrink-0">
          <button
            onClick={() => onEdit(position)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Modifica posizione"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(position.id)}
            className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            title="Elimina posizione"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Azioni
          </p>
          <p className="text-gray-900 font-semibold mt-0.5">
            {position.shares}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Prezzo Corrente
          </p>
          <p className="text-gray-900 font-semibold mt-0.5">
            {formatCurrency(position.currentPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Costo Medio
          </p>
          <p className="text-gray-900 font-semibold mt-0.5">
            {formatCurrency(position.avgCostPerShare)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Valore Totale
          </p>
          <p className="text-gray-900 font-bold mt-0.5">
            {formatCurrency(currentValue)}
          </p>
        </div>
      </div>

      {/* Gain/Loss */}
      <div
        className={`flex items-center justify-between mt-3 p-3 rounded-lg ${
          isPositive ? "bg-success-50" : "bg-danger-50"
        }`}
      >
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp size={18} className="text-success-600" />
          ) : (
            <TrendingDown size={18} className="text-danger-600" />
          )}
          <span
            className={`text-sm font-medium ${isPositive ? "text-success-700" : "text-danger-700"}`}
          >
            {isPositive ? "Guadagno" : "Perdita"}
          </span>
        </div>
        <div className="text-right">
          <span
            className={`font-bold text-lg ${isPositive ? "text-success-700" : "text-danger-700"}`}
          >
            {formatCurrency(gainLoss, 2, true)}
          </span>
          <span
            className={`ml-2 text-sm ${isPositive ? "text-success-600" : "text-danger-600"}`}
          >
            ({formatPercentage(gainLossPercent)})
          </span>
        </div>
      </div>

      {/* Notes */}
      {position.notes && (
        <p className="mt-3 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">
          {position.notes}
        </p>
      )}
    </Card>
  );
};
