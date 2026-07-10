'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type KPICardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  animated?: boolean;
};

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-[var(--sl-primary-light)] text-[var(--sl-primary)]',
  trend,
  trendValue,
  className,
  animated = true,
}: KPICardProps) {
  const [show, setShow] = useState(!animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  return (
    <div className={cn('sl-card p-5 transition-all', show ? 'opacity-100' : 'opacity-0 translate-y-2', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconBg)}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
            trend === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
            'bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400',
          )}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
             trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>{value}</p>
      <p className="mt-0.5 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>{title}</p>
      {subtitle && <p className="mt-1 text-xs" style={{ color: 'var(--sl-text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
