import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Card, Button, Input } from "@/components/common";
import { useAppStore } from "@/store";
import { useTranslation } from "@/i18n";
import { PortfolioPosition } from "@/types";

// Settori comuni per investimenti value (chiavi tradotte via sector.*)
const SECTOR_KEYS = [
  "technology",
  "health",
  "financials",
  "energy",
  "consumer",
  "industrials",
  "communication",
  "realestate",
  "utilities",
  "materials",
  "other",
] as const;

interface FormState {
  symbol: string;
  companyName: string;
  shares: string;
  avgCostPerShare: string;
  currentPrice: string;
  sector: string;
  purchaseDate: string;
  notes: string;
}

const emptyForm: FormState = {
  symbol: "",
  companyName: "",
  shares: "",
  avgCostPerShare: "",
  currentPrice: "",
  sector: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  notes: "",
};

interface AddPositionFormProps {
  onSuccess?: () => void;
}

export const AddPositionForm: React.FC<AddPositionFormProps> = ({
  onSuccess,
}) => {
  const { addPosition } = useAppStore();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleChange =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      // Cancella l'errore mentre si digita
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};

    if (!form.symbol.trim())
      newErrors.symbol = t("portfolio.errSymbol");
    if (!form.companyName.trim())
      newErrors.companyName = t("portfolio.errCompany");
    if (!form.shares || Number(form.shares) <= 0)
      newErrors.shares = t("portfolio.errShares");
    if (!form.avgCostPerShare || Number(form.avgCostPerShare) <= 0)
      newErrors.avgCostPerShare = t("portfolio.errAvgCost");
    if (!form.currentPrice || Number(form.currentPrice) <= 0)
      newErrors.currentPrice = t("portfolio.errCurrentPrice");
    if (!form.purchaseDate)
      newErrors.purchaseDate = t("portfolio.errDate");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newPosition: Omit<PortfolioPosition, "id"> = {
      symbol: form.symbol.trim().toUpperCase(),
      companyName: form.companyName.trim(),
      shares: Number(form.shares),
      avgCostPerShare: Number(form.avgCostPerShare),
      currentPrice: Number(form.currentPrice),
      sector: form.sector || undefined,
      purchaseDate: form.purchaseDate,
      notes: form.notes.trim() || undefined,
    };

    addPosition(newPosition);
    setForm(emptyForm);
    setErrors({});
    setIsOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setErrors({});
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <PlusCircle size={18} />
        {t("portfolio.addButton")}
      </Button>
    );
  }

  return (
    <Card
      title={t("portfolio.formTitle")}
      subtitle={t("portfolio.formSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Riga 1: Simbolo e Azienda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("portfolio.symbolLabel")}
            placeholder={t("portfolio.symbolPlaceholder")}
            value={form.symbol}
            onChange={handleChange("symbol")}
            error={errors.symbol}
            helperText={t("portfolio.symbolHelper")}
          />
          <Input
            label={t("portfolio.companyLabel")}
            placeholder={t("portfolio.companyPlaceholder")}
            value={form.companyName}
            onChange={handleChange("companyName")}
            error={errors.companyName}
          />
        </div>

        {/* Riga 2: Azioni e Prezzi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t("portfolio.sharesLabel")}
            type="number"
            min="0.001"
            step="0.001"
            placeholder={t("portfolio.sharesPlaceholder")}
            value={form.shares}
            onChange={handleChange("shares")}
            error={errors.shares}
            helperText={t("portfolio.sharesHelper")}
          />
          <Input
            label={t("portfolio.avgCostLabel")}
            type="number"
            min="0.01"
            step="0.01"
            placeholder={t("portfolio.avgCostPlaceholder")}
            value={form.avgCostPerShare}
            onChange={handleChange("avgCostPerShare")}
            error={errors.avgCostPerShare}
            helperText={t("portfolio.avgCostHelper")}
          />
          <Input
            label={t("portfolio.currentPriceLabel")}
            type="number"
            min="0.01"
            step="0.01"
            placeholder={t("portfolio.currentPricePlaceholder")}
            value={form.currentPrice}
            onChange={handleChange("currentPrice")}
            error={errors.currentPrice}
            helperText={t("portfolio.currentPriceHelper")}
          />
        </div>

        {/* Riga 3: Settore e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("portfolio.sectorLabel")}
            </label>
            <select
              value={form.sector}
              onChange={handleChange("sector")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900"
            >
              <option value="">{t("portfolio.sectorSelect")}</option>
              {SECTOR_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`sector.${key}`)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t("portfolio.dateLabel")}
            type="date"
            value={form.purchaseDate}
            onChange={handleChange("purchaseDate")}
            error={errors.purchaseDate}
          />
        </div>

        {/* Note */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("portfolio.notesLabel")}
          </label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder={t("portfolio.notesPlaceholder")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {t("portfolio.cancel")}
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <PlusCircle size={16} />
            {t("portfolio.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
};
