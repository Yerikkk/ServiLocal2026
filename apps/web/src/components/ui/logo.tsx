import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  /** Use "white" variant for blue/dark backgrounds (e.g. auth panel) */
  variant?: 'default' | 'white';
}

export function Logo({ className, variant = 'default' }: LogoProps) {
  const src = variant === 'white' ? '/images/logo-white.png' : '/images/logo.png';

  return (
    <Image
      src={src}
      alt="ServiLocal logo"
      width={128}
      height={128}
      priority
      className={cn('object-contain', className)}
    />
  );
}
