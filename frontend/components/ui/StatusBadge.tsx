export type StatusTone =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "noShow"
  | "success"
  | "danger"
  | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-secondary/10 text-secondary",
  seated: "bg-blue-100 text-blue-700",
  completed: "bg-secondary/10 text-secondary",
  cancelled: "bg-border text-muted",
  noShow: "bg-red-100 text-red-700",
  success: "bg-secondary/10 text-secondary",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-border text-ink"
};

interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

// Small pill used for reservation/restaurant/user status everywhere —
// replaces the ad hoc `STATUS_STYLE` maps that were duplicated per page.
export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE_CLASS[tone]} ${className ?? ""}`}>
      {children}
    </span>
  );
}
