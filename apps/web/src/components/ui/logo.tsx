import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  /** Use "white" for blue backgrounds (e.g. auth panel) */
  variant?: 'default' | 'white';
}

export function Logo({ className, variant = 'default' }: LogoProps) {
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
        x="4" y="4"
        width="112" height="112"
        rx="26" ry="26"
        fill={bgFill}
      />

      {/* ── Location pin (teardrop) ── */}
      <path
        d="M60 24c-12 0-22 10-22 22 0 15 20 33 21.2 34a1 1 0 0 0 1.6 0C62 79 82 61 82 46c0-12-10-22-22-22z"
        fill={iconFill}
      />

      {/* ── Checkmark centered in pin circle (center 60, 46) ── */}
      <path
        d="M51 46.5l6 6L69 40"
        stroke={bgFill}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wrench: classic open-end spanner lying horizontal ── */}
      {/* Main handle (thinner bar) */}
      <rect
        x="34" y="89"
        width="52" height="8"
        rx="4"
        fill={iconFill}
      />
      {/* Left head: open jaw facing LEFT (U-shape opening outward) */}
      <path
        d="M34 84a10 10 0 0 0 0 18h4v-5h-2a5 5 0 0 1 0-8h2v-5h-4z"
        fill={iconFill}
      />
      {/* Right head: closed ring (box end) */}
      <circle cx="86" cy="93" r="11" fill={iconFill} />
      <circle cx="86" cy="93" r="5.5" fill={bgFill} />
    </svg>
  );
}
