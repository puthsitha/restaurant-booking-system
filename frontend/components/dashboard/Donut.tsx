interface DonutProps {
  percent: number; // 0-100
  size?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

// Dependency-free ring chart built from a CSS conic-gradient — mirrors the
// reference's "today at a glance" donut without a charting library.
export function Donut({ percent, size = 96, label, sublabel, className }: DonutProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const holeSize = Math.round(size * 0.73);

  return (
    <div
      className={`relative shrink-0 rounded-full ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#C2410C 0% ${clamped}%, #F1EAE2 ${clamped}% 100%)`
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-surface text-center"
        style={{ width: holeSize, height: holeSize }}
      >
        <span className="disp text-lg font-extrabold text-ink">
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel && <span className="text-[10px] text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
