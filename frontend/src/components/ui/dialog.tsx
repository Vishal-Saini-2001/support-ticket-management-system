'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { CALM_EASE } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 outline-none',
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: CALM_EASE }}
          className="relative rounded-md border border-border bg-background p-6 shadow-lg"
        >
          {children}
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute right-4 top-4 rounded-sm p-1 text-muted transition-colors duration-150 hover:bg-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('mb-4 space-y-1.5', className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-[16px] font-semibold text-foreground', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-[14px] text-muted', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('mt-6 flex items-center justify-end gap-2', className)} {...props} />
  );
}
