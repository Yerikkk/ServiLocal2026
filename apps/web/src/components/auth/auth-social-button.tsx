import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AuthSocialButtonProps = {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function AuthSocialButton({
  icon,
  children,
  className,
  onClick,
}: AuthSocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[58px] w-full items-center justify-center gap-3 rounded-[20px] border border-[var(--sl-border)] text-[1rem] font-medium transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-[var(--sl-primary)] hover:shadow-md',
        className,
      )}
      style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-primary)' }}
    >
      <span className="flex items-center justify-center text-lg">{icon}</span>
      <span>{children}</span>
    </button>
  );
}