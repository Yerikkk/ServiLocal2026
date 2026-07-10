'use client';

import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  primary:
    'bg-[var(--sl-primary)] text-white hover:bg-[var(--sl-primary-hover)] active:scale-[0.98] shadow-sm hover:shadow-md',
  secondary:
    'bg-[var(--sl-primary-light)] text-[var(--sl-primary)] hover:bg-sky-100 dark:hover:bg-sky-500/15 active:scale-[0.98]',
  outline:
    'border border-[var(--sl-border)] bg-[var(--sl-surface)] text-[var(--sl-text-primary)] hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-white/5 dark:hover:border-slate-600 active:scale-[0.98]',
  ghost:
    'text-[var(--sl-text-secondary)] hover:bg-slate-100 hover:text-[var(--sl-text-primary)] dark:hover:bg-white/5 active:scale-[0.98]',
  danger:
    'bg-[var(--sl-danger)] text-white hover:bg-red-600 active:scale-[0.98] shadow-sm',
  'danger-outline':
    'border border-red-200 bg-[var(--sl-surface)] text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10 active:scale-[0.98]',
} as const;

const sizes = {
  xs: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  sm: 'h-9 px-4 text-sm rounded-xl gap-2',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2.5',
  xl: 'h-14 px-8 text-base rounded-2xl gap-3',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'sl-focus-ring',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent sl-animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading ? <span className="shrink-0">{iconRight}</span> : null}
      </button>
    );
  },
);

Button.displayName = 'Button';
