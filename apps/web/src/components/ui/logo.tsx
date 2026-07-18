import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  /** Use "white" for blue backgrounds (e.g. auth panel) */
  variant?: 'default' | 'white';
}

export function Logo({ className, variant = 'default' }: LogoProps) {
  // "default": blue rounded-rect, white inner icons
  // "white":   white rounded-rect, blue inner icons (for blue backgrounds)
  const bgFill = variant === 'white' ? 'white' : 'var(--sl-primary)';
  const iconFill = variant === 'white' ? 'var(--sl-primary)' : 'white';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
      aria-label="ServiLocal logo"
    >
      {/* ── Rounded square background ── */}
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="26"
        ry="26"
        fill={bgFill}
      />

      {/* ── Location pin (teardrop shape) ── */}
      <path
        d="M60 30c-10.5 0-19 8.5-19 19 0 13.2 17 28.5 18.2 29.5a1.1 1.1 0 0 0 1.6 0C62 77.5 79 62.2 79 49c0-10.5-8.5-19-19-19z"
        fill={iconFill}
      />

      {/* ── Checkmark inside the pin ── */}
      <path
        d="M52.5 48l5 5 10-10"
        stroke={bgFill}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wrench body (horizontal, below pin) ── */}
      <path
        d="M38 82c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6l8-0.5h16l8 0.5c0 3.3 2.7 6 6 6s6-2.7 6-6-2.7-6-6-6H38z"
        fill={iconFill}
      />
      {/* Wrench handle bar */}
      <rect
        x="42"
        y="84"
        width="36"
        height="8"
        rx="4"
        fill={iconFill}
      />
      {/* Left wrench jaw */}
      <circle cx="38" cy="88" r="8" fill={iconFill} />
      <circle cx="38" cy="88" r="4" fill={bgFill} />
      {/* Right wrench jaw */}
      <circle cx="82" cy="88" r="8" fill={iconFill} />
      <circle cx="82" cy="88" r="4" fill={bgFill} />
    </svg>
  );
}
