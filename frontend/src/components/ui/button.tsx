import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover border border-transparent',
  secondary:
    'bg-background text-foreground border border-border hover:bg-hover',
  ghost:
    'bg-transparent text-foreground border border-transparent hover:bg-hover',
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-transparent dark:bg-red-700 dark:hover:bg-red-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12px] rounded-sm',
  md: 'h-9 px-3.5 text-[14px] rounded-sm',
  icon: 'h-8 w-8 p-0 rounded-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = 'Button';

