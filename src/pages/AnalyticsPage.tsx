
import { useEffect, useState } from 'react';
import Heatmap from '@/components/Heatmap';
import { Button } from '@/components/ui/button';
import Leaderboard from '@/components/Leaderboard';
import { getXpProfile } from '@/services/xpService';
import { ContentService } from '@/services/contentService';


export default function AnalyticsPage() {
  const [xp, setXp] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [activities, setActivities] = useState<number | null>(null);
  const [learningTime, setLearningTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const xpProfile = await getXpProfile();
        setXp(xpProfile?.xp ?? 0);
        setLevel(xpProfile?.level ?? 0);

        // Get user id from supabase auth
        const user = (await import('@/integrations/supabase/client')).supabase.auth.getUser ? (await (await import('@/integrations/supabase/client')).supabase.auth.getUser())?.data?.user : null;
        const userId = user?.id;
        if (userId) {
          const stats = await ContentService.getUserConsumptionStats(userId);
          setActivities(stats.length);
          // estimated_duration is not available; show '--' for learning time
          setLearningTime(null);
        } else {
          setActivities(0);
          setLearningTime(0);
        }
      } catch (e: any) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="pt-16 px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">Activity Analytics</div>
            <div className="text-white/60">Detailed insights into your learning patterns</div>
          </div>
          <Button variant="outline" className="border-white/20">Export</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm">Total XP</div>
            <div className="text-3xl font-bold">{loading ? '...' : xp?.toLocaleString() ?? 0}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm">Activities</div>
            <div className="text-3xl font-bold">{loading ? '...' : activities ?? 0}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm">Learning Time</div>
            <div className="text-3xl font-bold">{loading ? '...' : (learningTime === null ? '--' : `${learningTime}h`)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm">Day Streak</div>
            <div className="text-3xl font-bold text-green-400">--</div>
          </div>
        </div>

        {error && <div className="text-red-400">{error}</div>}

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-lg font-semibold mb-3">Learning Activity</div>
          <Heatmap months={12} />
        </div>

        <Leaderboard />
      </div>
    </div>
  );
}


