'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';
import type { ComponentPropsWithoutRef } from 'react';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content sideOffset={sideOffset} asChild {...props}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.16, ease: CALM_EASE }}
          className={cn(
            'z-50 min-w-[180px] rounded-md border border-border bg-background p-1 shadow-md outline-none',
            className
          )}
        >
          {children}
        </motion.div>
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-[14px] text-foreground outline-none transition-colors duration-150 focus:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>) {
  return <DropdownPrimitive.Separator className={cn('my-1 h-px bg-border', className)} {...props} />;
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>) {
  return (
    <DropdownPrimitive.Label
      className={cn('px-2.5 py-1 text-[12px] font-medium text-muted', className)}
      {...props}
    />
  );
}
