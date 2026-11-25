'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 max-w-xs select-none rounded-sm border border-neutral-800 bg-[#262626] px-2.5 py-1.5 text-[12px] font-medium leading-4 text-white shadow-md dark:border-[#3A3A3A] dark:bg-[#2B2B2B] dark:text-[#F0F0EE]',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          width={8}
          height={4}
          className="fill-[#262626] dark:fill-[#2B2B2B]"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

interface SimpleTooltipProps {
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  enabled?: boolean;
  children: ReactNode;
}

export function SimpleTooltip({
  label,
  side = 'top',
  enabled = true,
  children,
}: SimpleTooltipProps) {
  if (!enabled || !label) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
