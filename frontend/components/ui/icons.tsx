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

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a15.6 15.6 0 0 1-3.2 4.1M6.6 6.6C4 8.3 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 3.9-.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 10a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 5l14 14M19 5L5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3" width="7.5" height="4.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="10" width="7.5" height="10.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.1" fill="currentColor" />
      <circle cx="12" cy="14" r="1.1" fill="currentColor" />
      <circle cx="16" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5.5l3.8 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 10.5a6 6 0 1 1 12 0c0 4 1.4 5.4 2 6H4c.6-.6 2-2 2-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5v11.5m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 17v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ZoomInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.5 8v5M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 12.5 6 4h12l3 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12.5v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-5.3a2.7 2.7 0 0 1-5.4 0H3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 20c.9-4.3 3.9-6.8 7.5-6.8s6.6 2.5 7.5 6.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.8 19c.6-3.4 3.2-5.5 6.2-5.5s5.6 2.1 6.2 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5a3.2 3.2 0 0 1 0 6.2M18.6 19c-.4-2.3-1.6-4-3.3-4.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M11.5 3H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 .6 1.4l8.5 8.5a2 2 0 0 0 2.8 0l6.5-6.5a2 2 0 0 0 0-2.8L13 3.6a2 2 0 0 0-1.5-.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 12.5l5 5L20 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-10-9.3C.6 8 1.8 4.5 5 3.4c2.2-.8 4.4 0 5.9 1.9l1.1 1.4 1.1-1.4c1.5-1.9 3.7-2.7 5.9-1.9 3.2 1.1 4.4 4.6 3 7.8-2.5 4.7-10 9.3-10 9.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path
        d="m12 2.5 2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.3l-5.9 3.3 1.4-6.6-5-4.6 6.6-.7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v3M12 18.5v3M4.2 6.5l2.1 2.1M17.7 15.4l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.5l2.1-2.1M17.7 8.6l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChairIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 21v-4M18 21v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 15h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 9v.01M18 15v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5v2H15l-.4 3H11.5v7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7.5 3.5h2l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v2a2 2 0 0 1-2 2A15.5 15.5 0 0 1 5.5 5.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 13.5A8.5 8.5 0 1 1 10.5 4a6.8 6.8 0 0 0 9.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MonitorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="12.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20.5h8M12 16.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-6-3.8-9s1.3-6.5 3.8-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The official multi-color Google "G" mark — unlike the rest of this file
// it's brand-colored rather than currentColor, since it must always render
// as Google's mark regardless of the surrounding text color or theme.
export function GoogleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
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

export function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21.5s7-6.4 7-12A7 7 0 0 0 5 9.5c0 5.6 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
