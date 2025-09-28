import React, { useMemo, useRef, useState } from 'react';

// --- Helper: Viridis palette (5 steps, perceptually uniform, WCAG-friendly) ---
export function getViridis(n: number): string[] {
  // 5-step viridis, light to dark (from matplotlib, inlined)
  const stops = [
    '#FDE725', // lightest
    '#7AD151',
    '#22A884',
    '#2A788E',
    '#440154', // darkest
  ];
  if (n <= 5) return stops.slice(0, n);
  // Interpolate for more steps (linear RGB)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const hexToRgb = (hex: string) => hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
  const rgbToHex = (rgb: number[]) => '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
  const out: string[] = [];
  for (let i = 0; i < n; ++i) {
    const t = i / (n - 1);
    const idx = t * (stops.length - 1);
    const i0 = Math.floor(idx), i1 = Math.ceil(idx);
    const rgb0 = hexToRgb(stops[i0]), rgb1 = hexToRgb(stops[i1]);
    const rgb = [0, 1, 2].map(j => Math.round(lerp(rgb0[j], rgb1[j], idx - i0)));
    out.push(rgbToHex(rgb));
  }
  return out;
}

// --- Helper: Generate calendar matrix (weeks x days) ---
export function generateCalendarMatrix(startDate: Date, weeks: number): Date[][] {
  const matrix: Date[][] = [];
  let d = new Date(startDate);
  for (let w = 0; w < weeks; ++w) {
    const week: Date[] = [];
    for (let i = 0; i < 7; ++i) {
      week.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    matrix.push(week);
  }
  return matrix;
}

// --- Helper: Clamp count to [0, max] ---
function clamp(val: number, max: number) {
  return Math.max(0, Math.min(val, max));
}

// --- Helper: Format month ticks ---
function formatMonthTicks(matrix: Date[][], locale: string) {
  const months: { col: number; label: string }[] = [];
  let lastMonth = -1;
  matrix.forEach((week, col) => {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      months.push({ col, label: week[0].toLocaleString(locale, { month: 'short' }) });
      lastMonth = m;
    }
  });
  return months;
}

// --- Main Component ---
export interface ContributionHeatmapProps {
  startDate: Date;
  weeks?: number;
  data: Record<string, number>;
  buckets?: number;
  palette?: 'viridis' | 'rocket' | 'mako';
  locale?: string;
  onCellClick?: (date: string, count: number) => void;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  startDate,
  weeks = 53,
  data,
  buckets = 5,
  palette = 'viridis',
  locale = 'en',
  onCellClick,
}) => {
  // --- Color scale ---
  const counts = Object.values(data);
  const max = Math.max(1, ...counts);
  const thresholds = useMemo(() => {
    // Evenly spaced buckets (0, t1, t2, ..., max)
    return Array.from({ length: buckets }, (_, i) => Math.round((i * max) / (buckets - 1)));
  }, [buckets, max]);
  const colors = useMemo(() => getViridis(buckets), [buckets, palette]);
  const colorScale = (count: number) => {
    for (let i = buckets - 1; i > 0; --i) {
      if (count >= thresholds[i]) return colors[i];
    }
    return colors[0];
  };

  // --- Calendar matrix ---
  const matrix = useMemo(() => generateCalendarMatrix(startDate, weeks), [startDate, weeks]);
  const monthTicks = useMemo(() => formatMonthTicks(matrix, locale), [matrix, locale]);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLabelIdx = [1, 3, 5]; // Mon, Wed, Fri

  // --- Accessibility & focus ---
  const [focus, setFocus] = useState<{ week: number; day: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Tooltip ---
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  // --- Keyboard navigation ---
  function handleKeyDown(e: React.KeyboardEvent, week: number, day: number, date: string, count: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      onCellClick?.(date, count);
      e.preventDefault();
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      let w = week, d = day;
      if (e.key === 'ArrowUp') d = (d + 6) % 7;
      if (e.key === 'ArrowDown') d = (d + 1) % 7;
      if (e.key === 'ArrowLeft') w = Math.max(0, w - 1);
      if (e.key === 'ArrowRight') w = Math.min(matrix.length - 1, w + 1);
      setFocus({ week: w, day: d });
      e.preventDefault();
    }
  }

  // --- Render ---
  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-white/80 text-sm">Contributions</span>
        <Legend colors={colors} thresholds={thresholds} />
      </div>
      <div
        ref={gridRef}
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${weeks}, 13px)`, gridTemplateRows: 'repeat(7, 13px)', minWidth: weeks * 13 }}
        tabIndex={0}
        aria-label="Contribution heatmap"
      >
        {/* Month labels */}
        {monthTicks.map(({ col, label }) => (
          <span
            key={label + col}
            style={{ gridColumn: col + 1, gridRow: 1, marginBottom: 2 }}
            className="text-xs text-white/60 col-start-auto row-start-1 mb-1"
          >
            {label}
          </span>
        ))}
        {/* Day labels (Mon/Wed/Fri) */}
        {dayLabelIdx.map(i => (
          <span
            key={i}
            style={{ gridColumn: 1, gridRow: i + 1, marginRight: 4 }}
            className="text-xs text-white/60 col-start-1 row-start-auto mr-1"
          >
            {dayLabels[i]}
          </span>
        ))}
        {/* Cells */}
        {matrix.map((week, w) =>
          week.map((dateObj, d) => {
            const iso = dateObj.toISOString().slice(0, 10);
            const count = clamp(data[iso] || 0, max);
            const color = colorScale(count);
            const isFocused = focus && focus.week === w && focus.day === d;
            const ariaLabel = `${dayLabels[dateObj.getDay()]}, ${iso}: ${count} activities`;
            return (
              <button
                key={iso}
                tabIndex={isFocused ? 0 : -1}
                aria-label={ariaLabel}
                className="rounded-[2px] outline-none border-0 focus:ring-2 focus:ring-white/70"
                style={{
                  gridColumn: w + 1,
                  gridRow: d + 1,
                  width: 11,
                  height: 11,
                  margin: 2,
                  background: color,
                  transition: prefersReducedMotion ? 'opacity 120ms' : 'transform 160ms ease-out, box-shadow 120ms',
                  transform: isFocused ? 'scale(1.15)' : 'scale(1)',
                  zIndex: isFocused ? 2 : 1,
                  outline: isFocused ? '2px solid #fff' : undefined,
                  boxShadow: isFocused ? '0 0 0 2px #fff8' : undefined,
                  cursor: 'pointer',
                }}
                onClick={() => onCellClick?.(iso, count)}
                onFocus={() => setFocus({ week: w, day: d })}
                onBlur={() => setFocus(null)}
                onKeyDown={e => handleKeyDown(e, w, d, iso, count)}
                onMouseEnter={e => {
                  if (prefersReducedMotion) return;
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    label: ariaLabel,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })
        )}
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-2 py-1 rounded bg-black text-white text-xs border border-white/20 shadow-lg pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y - 32, transform: 'translate(-50%, -100%)', opacity: 1, transition: 'opacity 120ms' }}
            role="tooltip"
          >
            {tooltip.label}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Legend ---
const Legend: React.FC<{ colors: string[]; thresholds: number[] }> = ({ colors, thresholds }) => (
  <div className="flex items-center gap-1 ml-2">
    <span className="text-xs text-white/50 mr-1">Less</span>
    {colors.map((c, i) => (
      <span key={i} className="inline-block w-5 h-3 rounded-sm border border-white/10" style={{ background: c }} />
    ))}
    <span className="text-xs text-white/50 ml-1">More</span>
  </div>
);

// --- Docs ---
/**
 * To swap in cal-heatmap or D3, replace generateCalendarMatrix, colorScale, and Legend with library calls.
 * This component is UI-only, deterministic, and does not fetch or mutate data.
 */
