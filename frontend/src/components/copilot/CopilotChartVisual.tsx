import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any;
}

interface CopilotChartVisualProps {
  chartType: 'bar' | 'line' | 'pie';
  title?: string;
  data: ChartDataItem[];
}

const PALETTE = ['#0D9488', '#0284C7', '#F59E0B', '#EF4444', '#6366F1', '#10B981'];

export const CopilotChartVisual: React.FC<CopilotChartVisualProps> = ({
  chartType,
  title,
  data,
}) => {
  const { isDark } = useTheme();
  if (!data || data.length === 0) return null;

  // Decide orientation for BarChart: If category names are long, horizontal layout works best
  const isHorizontalBar = chartType === 'bar' && data.some(d => (d.name || '').length > 10);

  return (
    <div className="my-2.5 w-full bg-surface border border-border-subtle rounded-lg p-3 shadow-xs">
      {title && (
        <div className="mb-2.5 flex items-center justify-between border-b border-border-subtle pb-1.5">
          <span className="text-[11px] font-semibold text-text-main uppercase tracking-wider">
            {title}
          </span>
          <span className="text-[10px] text-text-caption">
            Grounded Model Data
          </span>
        </div>
      )}

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            isHorizontalBar ? (
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#1D4655' : '#F1F5F9'} />
                <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#9FB5BF' : '#64748B' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 10, fill: isDark ? '#F4F8FA' : '#334155' }}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Value']}
                  contentStyle={{
                    backgroundColor: isDark ? '#102F3D' : '#FFFFFF',
                    borderColor: isDark ? '#1D4655' : '#E2E8F0',
                    color: isDark ? '#F4F8FA' : '#17232D',
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="value" fill="#0D9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1D4655' : '#F1F5F9'} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#9FB5BF' : '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#9FB5BF' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#102F3D' : '#FFFFFF',
                    borderColor: isDark ? '#1D4655' : '#E2E8F0',
                    color: isDark ? '#F4F8FA' : '#17232D',
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="value" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            )
          ) : chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1D4655' : '#F1F5F9'} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#9FB5BF' : '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: isDark ? '#9FB5BF' : '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#102F3D' : '#FFFFFF',
                  borderColor: isDark ? '#1D4655' : '#E2E8F0',
                  color: isDark ? '#F4F8FA' : '#17232D',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0D9488"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0D9488' }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={35}
                paddingAngle={3}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#102F3D' : '#FFFFFF',
                  borderColor: isDark ? '#1D4655' : '#E2E8F0',
                  color: isDark ? '#F4F8FA' : '#17232D',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
