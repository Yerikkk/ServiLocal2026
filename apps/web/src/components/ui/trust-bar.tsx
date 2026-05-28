'use client';

import { cn } from '@/lib/cn';
import { useEffect, useState } from 'react';

function getTrustColor(score: number) {
  if (score >= 90) return 'var(--sl-trust-outstanding)';
  if (score >= 70) return 'var(--sl-trust-high)';
  if (score >= 50) return 'var(--sl-trust-medium)';
  if (score >= 30) return 'var(--sl-trust-low)';
  return 'var(--sl-trust-none)';
}

function getTrustLabel(score: number) {
  if (score >= 90) return 'Destacado';
  if (score >= 70) return 'Confianza alta';
  if (score >= 50) return 'Confianza media';
  if (score >= 30) return 'Confianza baja';
  return 'Sin reputación';
}

type TrustBarProps = {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showScore?: boolean;
  className?: string;
  animated?: boolean;
};

export function TrustBar({
  score,
  size = 'md',
  showLabel = true,
  showScore = true,
  className,
  animated = true,
}: TrustBarProps) {
  const [width, setWidth] = useState(animated ? 0 : score);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(score), 100);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);

  const color = getTrustColor(score);
  const label = getTrustLabel(score);

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={cn('space-y-1.5', className)}>
      {(showLabel || showScore) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <span className="text-xs font-medium" style={{ color }}>
              {label}
            </span>
          )}
          {showScore && (
            <span className="text-xs font-bold text-slate-700">{score}/100</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-100 overflow-hidden', heightClass)}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, width))}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
