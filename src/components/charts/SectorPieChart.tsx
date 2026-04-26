import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/common";

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

interface ChartData {
  name: string;
  value: number;
}

interface SectorPieChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  valueFormatter?: (value: number) => string;
}

export const SectorPieChart: React.FC<SectorPieChartProps> = ({
  title,
  subtitle,
  data,
  valueFormatter = (val) => val.toString(),
}) => {
  if (data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const processedData = data
    .map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: any }[];
  }) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-gray-700">{valueFormatter(value)}</p>
          <p className="text-gray-500 text-sm">
            {percent.toFixed(1)}% del totale
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title={title} subtitle={subtitle}>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {processedData.map((_, index) => (
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

        <div className="w-full lg:w-1/2 space-y-2">
          {processedData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {item.percent.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 block">
                  {valueFormatter(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
