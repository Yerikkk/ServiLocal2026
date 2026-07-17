import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-[var(--sl-primary)]", className)}
    >
      {/* House outline */}
      <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {/* Wrench inside the house */}
      <path d="M14 14.5l-3 3-1.5-1.5 3-3" />
      <path d="M14 14.5a2 2 0 0 0 2.8-2.8l-1.4-1.4-2.8 2.8z" />
      <path d="M10 17.5a2 2 0 0 0-2.8-2.8" />
    </svg>
  );
}
