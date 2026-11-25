'use client';

import { motion } from 'framer-motion';
import { LifeBuoy } from 'lucide-react';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

interface FullScreenLoaderProps {
  label?: string;
  overlay?: boolean;
}

export function FullScreenLoader({
  label = 'Loading',
  overlay = false,
}: FullScreenLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: CALM_EASE }}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center',
        overlay ? 'bg-background/80 backdrop-blur-[3px]' : 'bg-background'
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2, ease: CALM_EASE }}
        className="relative flex h-14 w-14 items-center justify-center"
      >
        <motion.span
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-md bg-accent"
          aria-hidden="true"
        />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-md bg-accent text-white shadow-md">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center"
          >
            <LifeBuoy className="h-6 w-6" aria-hidden="true" />
          </motion.span>
        </span>
      </motion.div>
    </motion.div>
  );
}
