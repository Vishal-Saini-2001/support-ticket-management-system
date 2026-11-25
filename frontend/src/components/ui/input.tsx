import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full h-9 rounded-sm border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';

