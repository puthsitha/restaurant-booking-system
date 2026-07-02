// Small hand-drawn line icon set so loading/error/empty states stay on the
// restaurant concept without pulling in an icon library or using emoji as
// structural icons.

type IconProps = { className?: string };

export function UtensilsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 2v7a2 2 0 0 0 2 2v11M7 2v7c0 .5-.2 1-.6 1.4M7 2v7c0-.5.2 1-.6 1.4M9 2v7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 2c-1.7 0-3 2.1-3 5.5S15.3 12 17 12v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyPlateIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 3" />
    </svg>
  );
}

export function SpilledBowlIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 11c0 4 3.5 7 7 7s7-3 7-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M2 11h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M18 9.5c1.4 0 3-1 3.6-2.3M19.5 12.5c1.1.5 2 1.6 2 2.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="17" r="0.9" fill="currentColor" />
      <circle cx="20" cy="18.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function SearchOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 10.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ChefHatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 10.5a3.5 3.5 0 0 1 1-6.7A3.5 3.5 0 0 1 12 2a3.5 3.5 0 0 1 5 1.8 3.5 3.5 0 0 1 1 6.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 20.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 20.5v-3.8M16 20.5v-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
