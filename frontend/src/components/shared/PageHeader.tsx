'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: CALM_EASE }}
      className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      <div className="space-y-1">
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {description ? <p className="text-[14px] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </motion.div>
  );
}
