import { useEffect, useState } from 'react';
import { getActivityHeatmap } from '@/services/xpService';

function calculateStreak(arr: any[]): number {
  const daysWithActivity: Record<string, boolean> = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] && arr[i].totalActions > 0) {
      daysWithActivity[arr[i].date] = true;
    }
  }
  const today = new Date();
  let s = 0;
  for (let j = 0; j < 60; j++) {
    const d = new Date(today);
    d.setDate(today.getDate() - j);
    const iso = d.toISOString().slice(0, 10);
    if (daysWithActivity[iso]) {
      s++;
    } else {
      if (j === 0) s = 0;
      break;
    }
  }
  return s;
}

export default function ProfileStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 59);
    getActivityHeatmap(start.toISOString().slice(0, 10), today.toISOString().slice(0, 10)).then(arr => {
      const s = calculateStreak(arr);
      setStreak(s);
    });
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="text-white/60 text-sm">Day Streak</div>
      <div className="text-3xl font-bold text-green-400">{streak}</div>
    </div>
  );
}
