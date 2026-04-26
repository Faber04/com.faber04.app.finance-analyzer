import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/common";
import { PortfolioPosition } from "@/types";
import { formatCurrency } from "@/utils/financial-calculations";

// Palette di colori per i settori
const COLORS = [
  "#4F46E5", // indigo
  "#0891B2", // cyan
  "#059669", // emerald
  "#D97706", // amber
  "#DC2626", // red
  "#7C3AED", // violet
  "#DB2777", // pink
  "#65A30D", // lime
  "#2563EB", // blue
  "#EA580C", // orange
  "#64748B", // slate
];

interface SectorData {
  name: string;
  value: number; // valore in euro
  percent: number; // % sul totale
}

interface SectorAllocationChartProps {
  positions: PortfolioPosition[];
}

export const SectorAllocationChart: React.FC<SectorAllocationChartProps> = ({
  positions,
}) => {
  if (positions.length === 0) return null;

  // Raggruppa posizioni per settore e calcola il valore totale per settore
  const sectorMap = positions.reduce<Record<string, number>>((acc, pos) => {
    const sectorName = pos.sector ?? "Non classificato";
    const value = pos.shares * pos.currentPrice;
    acc[sectorName] = (acc[sectorName] ?? 0) + value;
    return acc;
  }, {});

  const totalValue = Object.values(sectorMap).reduce((a, b) => a + b, 0);

  const data: SectorData[] = Object.entries(sectorMap)
    .map(([name, value]) => ({
      name,
      value,
      percent: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Tooltip personalizzato
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: SectorData }[];
  }) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-gray-700">{formatCurrency(value)}</p>
          <p className="text-gray-500 text-sm">
            {percent.toFixed(1)}% del portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Allocazione per Settore"
      subtitle="Distribuzione del valore del portfolio per settore"
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Grafico a torta */}
        <div className="w-full lg:w-1/2" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda dettagliata */}
        <div className="w-full lg:w-1/2 space-y-2">
          {data.map((sector, index) => (
            <div
              key={sector.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {sector.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {sector.percent.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 block">
                  {formatCurrency(sector.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
