import { useEffect, useMemo, useState } from 'react';
import { getActivityHeatmap, ActivityDay } from '@/services/xpService';
import { motion, AnimatePresence } from 'framer-motion';

interface HeatmapProps {
  months?: number; // how many past months
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Heatmap({ months = 6 }: HeatmapProps) {
  const [data, setData] = useState<ActivityDay[]>([]);
  const [active, setActive] = useState<ActivityDay | null>(null);
  const end = useMemo(() => new Date(), []);
  const start = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d;
  }, [months]);

  useEffect(() => {
    getActivityHeatmap(formatISO(start), formatISO(end)).then(setData);
  }, [start, end]);

  const byDate = useMemo(() => {
    const m = new Map<string, ActivityDay>();
    data.forEach(d => m.set(d.date, d));
    return m;
  }, [data]);

  // Build weeks
  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    days.push(new Date(d));
  }

  const maxActions = Math.max(1, ...data.map(d => d.totalActions || 0));

  const colorFor = (val: number) => {
    const t = val / maxActions; // 0..1
    // scale: light to dark green
    if (t === 0) return 'bg-emerald-900/20';
    if (t < 0.25) return 'bg-emerald-700/60';
    if (t < 0.5) return 'bg-emerald-600';
    if (t < 0.75) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="text-white/80 text-sm mb-2">Your Engagement Heatmap</div>
      <div className="grid grid-flow-col auto-cols-max gap-1">
        {/* Weeks */}
        {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIdx) => (
          <div key={weekIdx} className="grid grid-rows-7 gap-1">
            {Array.from({ length: 7 }).map((__, dayIdx) => {
              const idx = weekIdx * 7 + dayIdx;
              if (idx >= days.length) return <div key={dayIdx} className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] bg-white/10" />;
              const date = days[idx];
              const iso = formatISO(date);
              const d = byDate.get(iso);
              const actions = d?.totalActions || 0;
              const color = colorFor(actions);
              const tooltip = `${iso} • ${actions} actions • ${d?.xp || 0} XP`;
              return (
                <div key={dayIdx} className="relative">
                  <button
                    onClick={() => setActive(d || { date: iso, totalActions: 0, xp: 0 })}
                    aria-label={tooltip}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] ${color} focus:outline-none ring-0 focus:ring-2 focus:ring-white/30`}
                  />
                  <AnimatePresence>
                    {active?.date === iso && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute z-50 -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-white/20 text-white text-xs px-2 py-1 rounded-md shadow-lg"
                      >
                        {tooltip}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


