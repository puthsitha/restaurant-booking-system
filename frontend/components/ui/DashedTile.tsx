import type { ComponentType } from "react";

interface DashedTileProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  className?: string;
}

// Dashed-border "create new" affordance (add restaurant, add table, add
// photo) — matches the reference's dashed-tile empty-slot pattern.
export function DashedTile({ icon: Icon, label, onClick, className }: DashedTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted transition hover:border-accent hover:text-accent ${className ?? ""}`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}
