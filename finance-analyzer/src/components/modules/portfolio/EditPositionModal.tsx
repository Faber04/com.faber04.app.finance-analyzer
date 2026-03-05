import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button, Input } from "@/components/common";
import { useAppStore } from "@/store";
import { PortfolioPosition } from "@/types";

const SECTORS = [
  "Tecnologia",
  "Salute",
  "Finanza",
  "Energia",
  "Beni di Consumo",
  "Industriale",
  "Comunicazione",
  "Immobiliare",
  "Utilità",
  "Materiali",
  "Altro",
];

interface EditPositionModalProps {
  position: PortfolioPosition | null;
  onClose: () => void;
}

export const EditPositionModal: React.FC<EditPositionModalProps> = ({
  position,
  onClose,
}) => {
  const { updatePosition } = useAppStore();

  const [form, setForm] = useState({
    shares: "",
    avgCostPerShare: "",
    currentPrice: "",
    sector: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // Popola il form quando arriva la position
  useEffect(() => {
    if (position) {
      setForm({
        shares: String(position.shares),
        avgCostPerShare: String(position.avgCostPerShare),
        currentPrice: String(position.currentPrice),
        sector: position.sector ?? "",
        notes: position.notes ?? "",
      });
      setErrors({});
    }
  }, [position]);

  if (!position) return null;

  const handleChange =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validate = (): boolean => {
    const newErrors: Partial<typeof form> = {};
    if (!form.shares || Number(form.shares) <= 0)
      newErrors.shares = "Numero azioni non valido";
    if (!form.avgCostPerShare || Number(form.avgCostPerShare) <= 0)
      newErrors.avgCostPerShare = "Prezzo medio non valido";
    if (!form.currentPrice || Number(form.currentPrice) <= 0)
      newErrors.currentPrice = "Prezzo corrente non valido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updatePosition(position.id, {
      shares: Number(form.shares),
      avgCostPerShare: Number(form.avgCostPerShare),
      currentPrice: Number(form.currentPrice),
      sector: form.sector || undefined,
      notes: form.notes.trim() || undefined,
    });
    onClose();
  };

  return (
    // Overlay backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Modifica Posizione
            </h3>
            <p className="text-sm text-gray-500">
              {position.symbol} — {position.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Azioni *"
              type="number"
              min="0.001"
              step="0.001"
              value={form.shares}
              onChange={handleChange("shares")}
              error={errors.shares}
            />
            <Input
              label="Costo Medio *"
              type="number"
              min="0.01"
              step="0.01"
              value={form.avgCostPerShare}
              onChange={handleChange("avgCostPerShare")}
              error={errors.avgCostPerShare}
            />
            <Input
              label="Prezzo Attuale *"
              type="number"
              min="0.01"
              step="0.01"
              value={form.currentPrice}
              onChange={handleChange("currentPrice")}
              error={errors.currentPrice}
              helperText="Aggiornalo per vedere il gain/loss"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Settore
            </label>
            <select
              value={form.sector}
              onChange={handleChange("sector")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">-- Seleziona settore --</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={form.notes}
              onChange={handleChange("notes")}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave}>Salva Modifiche</Button>
        </div>
      </div>
    </div>
  );
};
