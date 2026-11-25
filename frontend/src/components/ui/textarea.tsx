import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full min-h-[120px] rounded-sm border border-border bg-background px-3 py-2 text-[14px] text-foreground placeholder:text-muted transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed resize-y',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

