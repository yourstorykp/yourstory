import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-8 w-8 text-forest"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path
          d="M20 32 C20 24 20 16 20 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M20 18 C14 17 10 13 9 8 C15 8 19 11 20 16 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M20 22 C26 21 30 17 31 12 C25 12 21 15 20 20 Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M8 30 C14 27 26 27 32 30"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.4"
        />
        <path
          d="M6 34 C14 31 26 31 34 34"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.25"
        />
      </svg>
      <span className="font-heading text-xl font-semibold tracking-tight text-forest-deep">
        yourstory<span className="text-terracotta">.kp</span>
      </span>
    </span>
  );
}
