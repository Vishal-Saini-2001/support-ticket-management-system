'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  skeletonCount?: number;
  emptyState?: ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading,
  skeletonCount = 5,
  emptyState,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="divide-y divide-border">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Desktop Notion-style table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: CALM_EASE }}
        className="hidden overflow-x-auto rounded-md border border-border bg-background md:block"
      >
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-border bg-surface text-[12px] font-medium text-muted">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-2.5 font-medium', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, idx) => {
              const rowKey = keyExtractor(row);
              return (
                <motion.tr
                  key={rowKey}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    delay: Math.min(idx * 0.03, 0.18),
                    ease: CALM_EASE,
                  }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer hover:bg-hover focus-visible:bg-hover' : 'hover:bg-surface'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 align-middle', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {data.map((row, idx) => {
          const rowKey = keyExtractor(row);
          return (
            <motion.div
              key={rowKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={onRowClick ? { y: -2 } : undefined}
              whileTap={onRowClick ? { scale: 0.99 } : undefined}
              transition={{
                duration: 0.2,
                delay: Math.min(idx * 0.035, 0.2),
                ease: CALM_EASE,
              }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              className={cn(
                'rounded-md border border-border bg-background p-4 transition-colors duration-150',
                onRowClick ? 'cursor-pointer hover:bg-hover' : ''
              )}
            >
              <div className="space-y-2.5">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-[12px] text-muted">{col.header}</span>
                    <div className="text-right">{col.render(row)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
