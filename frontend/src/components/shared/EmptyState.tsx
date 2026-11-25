'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: CALM_EASE }}
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-border bg-surface px-6 py-12 text-center',
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="text-[16px] font-medium text-foreground">{title}</h2>
      <p className="mt-1 max-w-sm text-[14px] text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </motion.div>
  );
}
