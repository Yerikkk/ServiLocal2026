import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-5" style={{ background: 'var(--sl-primary-muted)', color: 'var(--sl-text-muted)' }}>
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-bold" style={{ color: 'var(--sl-text-primary)' }}>{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--sl-text-secondary)' }}>{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
