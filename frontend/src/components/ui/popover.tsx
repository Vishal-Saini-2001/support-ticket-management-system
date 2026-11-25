'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { motion } from 'framer-motion';
import type { ComponentPropsWithoutRef } from 'react';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  align = 'end',
  sideOffset = 6,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content align={align} sideOffset={sideOffset} asChild {...props}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: CALM_EASE }}
          className={cn(
            'z-50 w-80 origin-top-right rounded-md border border-border bg-background p-3 shadow-md outline-none',
            className
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
