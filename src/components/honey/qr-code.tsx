import { useMemo } from "react";
import { cn } from "@/lib/utils";

/** Deterministic decorative QR-style matrix generated from a seed string. */
export function QrCode({ value, size = 21, className }: { value: string; size?: number; className?: string }) {
  const cells = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < value.length; i += 1) seed = (seed * 31 + value.charCodeAt(i)) % 2147483647;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      return seed / 2147483647;
    };
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => rand() > 0.52),
    );
    const finder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r += 1)
        for (let c = 0; c < 7; c += 1) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[r0 + r]![c0 + c] = edge || core;
        }
    };
    finder(0, 0);
    finder(0, size - 7);
    finder(size - 7, 0);
    return grid;
  }, [value, size]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`QR code for ${value}`}
      className={cn("size-40 rounded-lg bg-card p-1", className)}
      shapeRendering="crispEdges"
    >
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" /> : null,
        ),
      )}
    </svg>
  );
}
