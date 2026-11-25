'use client';

import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TicketStats } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CALM_EASE } from '@/components/ui/motion';

interface AdminStatsChartsProps {
  stats?: TicketStats;
  isLoading: boolean;
}

const STATUS_CHART_ITEMS = [
  { key: 'open', label: 'Open', color: '#3B82F6' },
  { key: 'in-progress', label: 'In Progress', color: '#F59E0B' },
  { key: 'resolved', label: 'Resolved', color: '#10B981' },
  { key: 'closed', label: 'Closed', color: '#71717A' },
] as const;

const PRIORITY_CHART_ITEMS = [
  { key: 'low', label: 'Low', color: '#71717A' },
  { key: 'medium', label: 'Medium', color: '#3B82F6' },
  { key: 'high', label: 'High', color: '#F97316' },
  { key: 'urgent', label: 'Urgent', color: '#EF4444' },
] as const;

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  payload?: {
    name?: string;
    color?: string;
  };
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  const label = item.payload?.name || item.name || '';
  const color = item.payload?.color;
  const count = item.value ?? 0;

  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-1.5 text-[12px] text-foreground shadow-md">
      {color ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : null}
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted">·</span>
      <span className="font-semibold text-foreground">{count}</span>
    </div>
  );
}

export function AdminStatsCharts({ stats, isLoading }: AdminStatsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mx-auto h-52 w-52 rounded-full" />
        </div>
        <div className="rounded-md border border-border bg-background p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    );
  }

  const total = stats?.total ?? 0;

  const statusData = STATUS_CHART_ITEMS.map((item) => ({
    name: item.label,
    value: stats?.byStatus[item.key] ?? 0,
    color: item.color,
  }));

  const priorityData = PRIORITY_CHART_ITEMS.map((item) => ({
    name: item.label,
    count: stats?.byPriority[item.key] ?? 0,
    color: item.color,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Status Donut Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: CALM_EASE }}
        className="rounded-md border border-border bg-background p-5"
      >
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Tickets by Status</h2>
          <p className="text-[12px] text-muted">Current distribution across workflow stages</p>
        </div>

        {total === 0 ? (
          <div className="flex h-56 items-center justify-center text-[13px] text-muted">
            No ticket data yet.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-56 w-full sm:w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="w-full space-y-2 text-[13px]">
              {statusData.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                      aria-hidden="true"
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-muted">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Priority Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08, ease: CALM_EASE }}
        className="rounded-md border border-border bg-background p-5"
      >
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Tickets by Priority</h2>
          <p className="text-[12px] text-muted">Volume across urgency levels</p>
        </div>

        {total === 0 ? (
          <div className="flex h-56 items-center justify-center text-[13px] text-muted">
            No ticket data yet.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: 'var(--hover)' }} content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}

