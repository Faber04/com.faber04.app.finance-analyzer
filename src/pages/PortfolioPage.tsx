import React from "react";
import { useAppStore } from "@/store";
import { AddPositionForm } from "@/components/modules/portfolio/AddPositionForm";
import { PortfolioList } from "@/components/modules/portfolio/PortfolioList";
import { SectorAllocationChart } from "@/components/modules/portfolio/SectorAllocationChart";

export const PortfolioPage: React.FC = () => {
  const { portfolio } = useAppStore();
  const hasPositions = portfolio.positions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Portfolio</h1>
          <p className="text-gray-600">
            Gestisci le tue posizioni e monitora le performance
          </p>
        </div>
        <AddPositionForm />
      </div>

      {/* Summary + Posizioni */}
      <PortfolioList />

      {/* Chart allocazione — solo se ci sono posizioni */}
      {hasPositions && (
        <SectorAllocationChart positions={portfolio.positions} />
      )}
    </div>
  );
};
