import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Card, Button, Input } from "@/components/common";
import { useAppStore } from "@/store";
import { PortfolioPosition } from "@/types";

// Settori comuni per investimenti value
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
      newErrors.symbol = "Il simbolo è obbligatorio (es. AAPL)";
    if (!form.companyName.trim())
      newErrors.companyName = "Il nome azienda è obbligatorio";
    if (!form.shares || Number(form.shares) <= 0)
      newErrors.shares = "Inserisci un numero di azioni valido";
    if (!form.avgCostPerShare || Number(form.avgCostPerShare) <= 0)
      newErrors.avgCostPerShare = "Inserisci un prezzo medio valido";
    if (!form.currentPrice || Number(form.currentPrice) <= 0)
      newErrors.currentPrice = "Inserisci il prezzo corrente";
    if (!form.purchaseDate)
      newErrors.purchaseDate = "La data di acquisto è obbligatoria";

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
        Aggiungi Posizione
      </Button>
    );
  }

  return (
    <Card
      title="Nuova Posizione"
      subtitle="Aggiungi un titolo al tuo portfolio"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Riga 1: Simbolo e Azienda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Simbolo (Ticker) *"
            placeholder="Es. AAPL, MSFT, KO"
            value={form.symbol}
            onChange={handleChange("symbol")}
            error={errors.symbol}
            helperText="Il codice del titolo in borsa"
          />
          <Input
            label="Nome Azienda *"
            placeholder="Es. Apple Inc."
            value={form.companyName}
            onChange={handleChange("companyName")}
            error={errors.companyName}
          />
        </div>

        {/* Riga 2: Azioni e Prezzi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Numero Azioni *"
            type="number"
            min="0.001"
            step="0.001"
            placeholder="Es. 10"
            value={form.shares}
            onChange={handleChange("shares")}
            error={errors.shares}
            helperText="Quante azioni possiedi"
          />
          <Input
            label="Prezzo Medio Acquisto *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Es. 150.00"
            value={form.avgCostPerShare}
            onChange={handleChange("avgCostPerShare")}
            error={errors.avgCostPerShare}
            helperText="Prezzo medio pagato per azione"
          />
          <Input
            label="Prezzo Corrente *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Es. 180.00"
            value={form.currentPrice}
            onChange={handleChange("currentPrice")}
            error={errors.currentPrice}
            helperText="Prezzo di mercato attuale"
          />
        </div>

        {/* Riga 3: Settore e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
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
          <Input
            label="Data di Acquisto *"
            type="date"
            value={form.purchaseDate}
            onChange={handleChange("purchaseDate")}
            error={errors.purchaseDate}
          />
        </div>

        {/* Note */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (opzionale)
          </label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder="La tua tesi di investimento, motivazioni, obiettivi..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Annulla
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <PlusCircle size={16} />
            Aggiungi al Portfolio
          </Button>
        </div>
      </form>
    </Card>
  );
};
