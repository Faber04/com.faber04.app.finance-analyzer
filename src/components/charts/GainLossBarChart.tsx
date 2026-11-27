import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from "recharts";
import { Card } from "@/components/common";

interface ChartData {
  name: string;
  value: number; // gain/loss amount
}

interface GainLossBarChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  valueFormatter?: (value: number) => string;
}

export const GainLossBarChart: React.FC<GainLossBarChartProps> = ({
  title,
  subtitle,
  data,
  valueFormatter = (val) => val.toString(),
}) => {
  if (data.length === 0) return null;

  // Sort by absolute value to show most significant moves first
  const sortedData = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: ChartData }[];
  }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
          <p className={`font-bold ${value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {valueFormatter(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title={title} subtitle={subtitle}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fontSize: 12, fill: 'var(--chart-tick)' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--chart-tick)' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(val) => valueFormatter(val)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
            <ReferenceLine y={0} stroke="var(--chart-axis)" />
            <Bar dataKey="value">
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value >= 0 ? "#10b981" : "#ef4444"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
