import { cn } from '@/lib/cn';

const statusConfig = {
  PENDING: { label: 'Pendiente', dot: 'bg-amber-400', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  NEGOTIATION: { label: 'Negociación', dot: 'bg-blue-400', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACCEPTED: { label: 'Aceptada', dot: 'bg-emerald-400', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  IN_PROGRESS: { label: 'En progreso', dot: 'bg-violet-400', bg: 'bg-violet-50 text-violet-700 border-violet-200' },
  COMPLETED: { label: 'Completada', dot: 'bg-green-500', bg: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'Cancelada', dot: 'bg-red-400', bg: 'bg-red-50 text-red-600 border-red-200' },
  EXPIRED: { label: 'Expirada', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-500 border-slate-200' },
} as const;

const roleConfig = {
  ADMIN: { label: 'Admin', bg: 'bg-violet-100 text-violet-700 border-violet-200' },
  CLIENT: { label: 'Cliente', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  PROVIDER: { label: 'Proveedor', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SUPPORT: { label: 'Soporte', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
} as const;

const trustConfig = {
  outstanding: { label: 'Destacado', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'Alta', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Media', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Baja', bg: 'bg-red-50 text-red-600 border-red-200' },
  none: { label: 'Sin datos', bg: 'bg-slate-100 text-slate-500 border-slate-200' },
} as const;

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
};

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        variant === 'outline' ? 'border' : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <Badge className={cn('border', config.bg)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: keyof typeof roleConfig }) {
  const config = roleConfig[role];
  return <Badge className={cn('border', config.bg)}>{config.label}</Badge>;
}

const userStatusConfig = {
  ACTIVE: { label: 'Activo', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SUSPENDED: { label: 'Suspendido', bg: 'bg-red-50 text-red-700 border-red-200' },
  PENDING: { label: 'Pendiente', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
} as const;

export function UserStatusBadge({ status }: { status: string }) {
  const config = userStatusConfig[status as keyof typeof userStatusConfig] || userStatusConfig.PENDING;
  return <Badge className={cn('border', config.bg)}>{config.label}</Badge>;
}

export function TrustBadge({ score }: { score: number }) {
  const level = score >= 90 ? 'outstanding' : score >= 70 ? 'high' : score >= 50 ? 'medium' : score >= 30 ? 'low' : 'none';
  const config = trustConfig[level];
  return <Badge className={cn('border', config.bg)}>{score}/100 · {config.label}</Badge>;
}

export function VerifiedBadge() {
  return (
    <Badge className="border border-sky-200 bg-sky-50 text-sky-700">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Verificado
    </Badge>
  );
}
