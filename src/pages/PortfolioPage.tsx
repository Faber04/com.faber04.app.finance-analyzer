import React from "react";
import { Briefcase } from "lucide-react";
import { useAppStore } from "@/store";
import { useTranslation } from "@/i18n";
import { EmptyState } from "@/components/common";
import { AddPositionForm } from "@/components/modules/portfolio/AddPositionForm";
import { PortfolioList } from "@/components/modules/portfolio/PortfolioList";
import { SectorAllocationChart } from "@/components/modules/portfolio/SectorAllocationChart";

export const PortfolioPage: React.FC = () => {
  const { portfolio } = useAppStore();
  const { t } = useTranslation();
  const hasPositions = portfolio.positions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("portfolio.title")}</h1>
          <p className="text-gray-600">
            {t("portfolio.subtitle")}
          </p>
        </div>
        {hasPositions && <AddPositionForm />}
      </div>

      {hasPositions ? (
        <>
          {/* Summary + Posizioni */}
          <PortfolioList />
          {/* Chart allocazione */}
          <SectorAllocationChart positions={portfolio.positions} />
        </>
      ) : (
        // PR5: empty state con CTA (mai un'area bianca)
        <EmptyState
          icon={Briefcase}
          title={t("portfolio.emptyTitle")}
          text={t("portfolio.emptyText")}
          tip={`${t("portfolio.emptyTipStrong")} ${t("portfolio.emptyTip")}`}
          action={<AddPositionForm />}
        />
      )}
    </div>
  );
};
