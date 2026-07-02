import { UtensilsIcon } from "@/components/ui/icons";

const SIZE_PX = { sm: 40, md: 64, lg: 88 } as const;
const DOT_PX = { sm: 5, md: 7, lg: 9 } as const;

interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// A plate with three "ingredients" orbiting it and steam rising off the top —
// reads as "something's cooking" rather than a generic spinner. Orbit +
// steam are motion-safe only; reduced-motion users still see the plate and
// label, just static.
export function LoadingSpinner({ label, size = "md", className }: LoadingSpinnerProps) {
  const dims = SIZE_PX[size];
  const dot = DOT_PX[size];
  const radius = dims / 2 - dot / 2;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${className ?? "py-14"}`}
    >
      <div className="relative" style={{ width: dims, height: dims }}>
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full gap-1.5">
          {[0, 0.25, 0.5].map((delay) => (
            <span
              key={delay}
              className="block h-3 w-[3px] rounded-full bg-accent/40 motion-safe:animate-ts-steam"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        <div className="absolute inset-0 rounded-full border-4 border-border bg-surface" />

        <div
          className="absolute inset-0 motion-safe:animate-ts-orbit"
          style={{ transformOrigin: "center" }}
        >
          {[0, 120, 240].map((deg) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 rounded-full bg-accent"
              style={{
                width: dot,
                height: dot,
                transform: `rotate(${deg}deg) translateX(${radius}px) translate(-50%, -50%)`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-accent">
          <UtensilsIcon className="h-1/3 w-1/3" />
        </div>
      </div>

      {label && <p className="km text-sm font-medium text-muted">{label}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
