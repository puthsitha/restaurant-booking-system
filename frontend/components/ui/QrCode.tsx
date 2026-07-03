interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// Deterministic seeded pixel-grid, standing in for a real QR code — mirrors
// design/TableSite.reference.html's own `makeQR` helper. Not scannable;
// there's no payment gateway to actually round-trip a scan against.
export function QrCode({ value, size = 180, className }: QrCodeProps) {
  const cells = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  function next(): number {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed;
  }

  const cellSize = size / cells;
  const modules: boolean[] = [];
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const inFinder =
        (row < 7 && col < 7) || (row < 7 && col >= cells - 7) || (row >= cells - 7 && col < 7);
      modules.push(inFinder ? finderPattern(row, col, cells) : next() % 5 === 0);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="QR code"
    >
      <rect width={size} height={size} fill="#fff" />
      {modules.map((filled, i) => {
        if (!filled) return null;
        const row = Math.floor(i / cells);
        const col = i % cells;
        return (
          <rect
            key={i}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#241D19"
          />
        );
      })}
    </svg>
  );
}

function finderPattern(row: number, col: number, cells: number): boolean {
  const localRow = row < 7 ? row : row - (cells - 7);
  const localCol = col < 7 ? col : col - (cells - 7);
  const onBorder = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
  const onCore = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
  return onBorder || onCore;
}
