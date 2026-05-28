import * as React from 'react';
import { cn } from '@/lib/cn';

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
};

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--sl-text-muted)' }}>
            {icon}
          </span>
        ) : null}

        <input
          ref={ref}
          className={cn(
            'h-[62px] w-full rounded-[22px] border border-[var(--sl-border)] pl-14 pr-5 text-[1.02rem] outline-none transition-all duration-200',
            'focus:border-[#1EA8E7] focus:ring-4 focus:ring-[#1EA8E7]/10',
            className,
          )}
          style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-primary)' }}
          {...props}
        />
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';