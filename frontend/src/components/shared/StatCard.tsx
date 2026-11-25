'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  hint?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, isLoading, className }: StatCardProps) {
  if (isLoading) {
    return (
      <div className={cn('rounded-md border border-border bg-background p-4', className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-7 w-14" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ duration: 0.24, ease: CALM_EASE }}
      className={cn(
        'group rounded-md border border-border bg-background p-4 transition-colors duration-150 hover:bg-surface',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-muted">{label}</span>
        {Icon ? (
          <Icon
            className="h-4 w-4 text-muted transition-transform duration-150 group-hover:scale-110 group-hover:text-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[24px] font-semibold tracking-tight text-foreground">{value}</span>
        {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
      </div>
    </motion.div>
  );
}
