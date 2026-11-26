'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TicketStats } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

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

const RADIAN = Math.PI / 180;

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

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}

function renderActiveSlice(props: ActiveShapeProps) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = '#3B82F6',
  } = props;

  return (
    <g style={{ outline: 'none' }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 9}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.32}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Math.max(0, innerRadius - 2)}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#donut-slice-shadow)"
        style={{ cursor: 'pointer', outline: 'none' }}
      />
    </g>
  );
}

interface ConnectorLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  fill?: string;
  percent?: number;
  value?: number;
  name?: string;
  index?: number;
  activeIndex?: number;
}

function renderConnectorLabel(props: ConnectorLabelProps) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    fill = '#71717A',
    percent = 0,
    value = 0,
    name = '',
    index,
    activeIndex,
  } = props;

  if (!value) {
    return null;
  }

  const isActive = activeIndex !== undefined && index === activeIndex;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const startRadius = outerRadius + (isActive ? 7 : 2);
  const elbowRadius = outerRadius + 18;

  const sx = cx + startRadius * cos;
  const sy = cy + startRadius * sin;
  const mx = cx + elbowRadius * cos;
  const my = cy + elbowRadius * sin;
  const ex = mx + (cos >= 0 ? 14 : -14);
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const labelX = ex + (cos >= 0 ? 6 : -6);
  const pct = Math.round(percent * 100);

  return (
    <g style={{ pointerEvents: 'none' }}>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        strokeWidth={isActive ? 2 : 1.5}
        fill="none"
        opacity={isActive ? 1 : 0.85}
      />
      <circle cx={ex} cy={ey} r={isActive ? 3 : 2.5} fill={fill} />
      <text
        x={labelX}
        y={ey - 2}
        textAnchor={textAnchor}
        fill="var(--text)"
        fontSize={12}
        fontWeight={600}
      >
        {name}
      </text>
      <text
        x={labelX}
        y={ey + 12}
        textAnchor={textAnchor}
        fill="var(--muted)"
        fontSize={11}
      >
        {value} ({pct}%)
      </text>
    </g>
  );
}

export function AdminStatsCharts({ stats, isLoading }: AdminStatsChartsProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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

  const activeSlice =
    activeIndex !== undefined && statusData[activeIndex]?.value
      ? statusData[activeIndex]
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Status Donut Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: CALM_EASE }}
        className="rounded-md border border-border bg-background p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Tickets by Status</h2>
            <p className="text-[12px] text-muted">
              Hover or tap a slice to inspect workflow distribution
            </p>
          </div>
        </div>

        {total === 0 ? (
          <div className="flex h-64 items-center justify-center text-[13px] text-muted">
            No ticket data yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-60 w-full select-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter
                      id="donut-slice-shadow"
                      x="-30%"
                      y="-30%"
                      width="160%"
                      height="160%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="4"
                        stdDeviation="4"
                        floodColor="#000000"
                        floodOpacity="0.28"
                      />
                    </filter>
                  </defs>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={68}
                    paddingAngle={2.5}
                    stroke="none"
                    isAnimationActive
                    animationDuration={450}
                    activeIndex={activeIndex}
                    activeShape={renderActiveSlice}
                    labelLine={false}
                    label={(labelProps) =>
                      renderConnectorLabel({
                        ...labelProps,
                        activeIndex,
                      })
                    }
                    onMouseEnter={(_data, idx) => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    onClick={(_data, idx) =>
                      setActiveIndex((prev) => (prev === idx ? undefined : idx))
                    }
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        style={{ outline: 'none', cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center readout inside donut hole */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[20px] font-semibold leading-none tracking-tight text-foreground">
                  {activeSlice ? activeSlice.value : total}
                </span>
                <span className="mt-1 max-w-[74px] truncate text-[11px] font-medium text-muted">
                  {activeSlice ? activeSlice.name : 'Total'}
                </span>
              </div>
            </div>

            {/* Interactive legend */}
            <ul className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-[12px] sm:grid-cols-4">
              {statusData.map((entry, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <li key={entry.name}>
                    <button
                      type="button"
                      disabled={entry.value === 0}
                      onMouseEnter={() => {
                        if (entry.value > 0) {
                          setActiveIndex(idx);
                        }
                      }}
                      onMouseLeave={() => setActiveIndex(undefined)}
                      onClick={() => {
                        if (entry.value > 0) {
                          setActiveIndex((prev) => (prev === idx ? undefined : idx));
                        }
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-1.5 rounded-sm px-2 py-1 text-left transition-colors duration-150',
                        entry.value > 0
                          ? 'cursor-pointer hover:bg-hover'
                          : 'cursor-default opacity-60',
                        isSelected && 'bg-hover ring-1 ring-border'
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5 text-foreground">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: entry.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{entry.name}</span>
                      </span>
                      <span className="font-semibold text-muted">{entry.value}</span>
                    </button>
                  </li>
                );
              })}
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
          <div className="flex h-64 items-center justify-center text-[13px] text-muted">
            No ticket data yet.
          </div>
        ) : (
          <div className="h-64 w-full select-none">
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
