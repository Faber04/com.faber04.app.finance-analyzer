import React, { useState } from "react";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/common";
import { useAppStore } from "@/store";
import { PortfolioPosition } from "@/types";
import {
  formatCurrency,
  formatPercentage,
} from "@/utils/financial-calculations";
import { PositionCard } from "./PositionCard";
import { EditPositionModal } from "./EditPositionModal";

export const PortfolioList: React.FC = () => {
  const { portfolio, removePosition } = useAppStore();
  const [positionToEdit, setPositionToEdit] =
    useState<PortfolioPosition | null>(null);

  const {
    positions,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
  } = portfolio;
  const isPositive = totalGainLoss >= 0;

  const handleDelete = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa posizione?")) {
      removePosition(id);
    }
  };

  // Stato vuoto
  if (positions.length === 0) {
    return (
      <Card>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Portfolio vuoto
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Non hai ancora aggiunto nessuna posizione. Usa il pulsante "Aggiungi
            Posizione" per iniziare!
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-sm mx-auto text-left">
            <div className="flex gap-2">
              <AlertCircle
                size={16}
                className="text-blue-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-blue-700">
                <strong>Suggerimento:</strong> Inserisci le posizioni che hai
                già in portafoglio. Il sistema calcolerà automaticamente
                gain/loss e allocazione per settore.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <DollarSign size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Valore Portfolio
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
                Costo Totale
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
                Gain/Loss
              </p>
              <p
                className={`text-lg font-bold ${isPositive ? "text-success-700" : "text-danger-700"}`}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(totalGainLoss)}
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
                Rendimento %
              </p>
              <p
                className={`text-lg font-bold ${isPositive ? "text-success-700" : "text-danger-700"}`}
              >
                {isPositive ? "+" : ""}
                {formatPercentage(totalGainLossPercent)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista posizioni */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Posizioni ({positions.length})
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
    </>
  );
};
