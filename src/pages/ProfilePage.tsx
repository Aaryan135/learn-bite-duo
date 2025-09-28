// --- Helper to calculate streak from activity array ---

// --- Helper component to fetch and display the user's current day streak ---
// (imports removed, keep only the ones below)
// Helper to calculate streak from activity array
function calculateStreak(arr) {
  // Build a set of days with activity
  var daysWithActivity = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] && arr[i].totalActions > 0) {
      daysWithActivity[arr[i].date] = true;
    }
  }
  // Count streak backwards from today
  var today = new Date();
  var s = 0;
  for (var j = 0; j < 60; j++) {
    var d = new Date(today);
    d.setDate(today.getDate() - j);
    var iso = d.toISOString().slice(0, 10);
    if (daysWithActivity[iso]) {
      s++;
    } else {
      if (j === 0) s = 0;
      break;
    }
  }
  return s;
}

import { AuthModalSimple } from '@/components/AuthModalSimple';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { getActivityHeatmap, getXpProfile } from '@/services/xpService';
import { xpThreshold } from '@/store/xpStore';
import { Button } from '@/components/ui/button';
import ProfileStreak from '@/components/ProfileStreak';

// --- Helper component to fetch and map data for ContributionHeatmap ---

// --- Helper component to fetch and map data for ContributionHeatmap ---
function ProfileHeatmap() {
  const [data, setData] = useState({} as { [date: string]: number });

  useEffect(() => {
    // 6 months, start from last visible Sunday
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - (day + 1) - 7 * 26); // ~6 months, 26 weeks
    getActivityHeatmap(start.toISOString().slice(0, 10), today.toISOString().slice(0, 10)).then(arr => {
      const rec = {} as { [date: string]: number };
      arr.forEach((d: any) => { rec[d.date] = d.totalActions; });
      setData(rec);
    });
  }, []);

  // Find the first visible Sunday for the grid
  const today = new Date();
  const day = today.getDay();
  const startSunday = new Date(today);
  startSunday.setDate(today.getDate() - day - 7 * 26); // 26 weeks

  return (
    <ContributionHeatmap
      startDate={startSunday}
      weeks={26}
      data={data}
      buckets={5}
      palette="viridis"
      locale="en"
      onCellClick={(date, count) => {
        // Optionally show a modal or toast
        alert(`${date}: ${count} activities`);
      }}
    />
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [xp, setXp] = useState<number>(1);
  const [level, setLevel] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getXpProfile().then((profile) => {
      if (profile && typeof profile.xp === 'number' && typeof profile.level === 'number') {
        setXp(Math.max(1, profile.xp));
        setLevel(Math.max(1, profile.level));
      } else {
        setXp(1);
        setLevel(1);
      }
      setLoading(false);
    });
  }, []);


  // Show sign-in modal if not signed in
  if (!user) {
    return (
      <AuthModalSimple
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => window.location.reload()}
      />
    );
  }
  if (loading) {
    return <div className="pt-16 px-4 text-white">Loading...</div>;
  }

  return (
    <div className="pt-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img src={user.user_metadata?.avatar_url || '/favicon.svg'} className="w-14 h-14 rounded-full" />
          <div>
            <div className="text-xl font-semibold">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
            <div className="text-white/60 text-sm">Full Stack Developer • Joined March 2023</div>
          </div>
          <div className="ml-auto">
            <Button variant="outline" className="border-white/20" onClick={signOut}>Sign Out</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm">Total XP</div>
            <div className="text-3xl font-bold text-blue-400">{xp.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm">Level {level}</div>
            <div className="mt-2 h-2 bg-white/10 rounded">
              <div
                className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded"
                style={{ width: `${Math.min(100, Math.floor((xp % xpThreshold(level)) / Math.max(1, xpThreshold(level)) * 100))}%` }}
              />
            </div>
            <div className="text-xs text-white/60 mt-1">
              <>
                {xp - xpThreshold(level - 1)} / {xpThreshold(level) - xpThreshold(level - 1)} XP • {xpThreshold(level) - xp} to level {level + 1}
              </>
            </div>
          </div>
        </div>

        {/* Streak & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ProfileStreak />
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:col-span-2 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Continue Learning</div>
              <div className="text-white/60 text-sm">Resume your coding journey</div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Continue</Button>
          </div>
        </div>


        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="border-white/20">View Bookmarks</Button>
          <Button variant="outline" className="border-white/20">Settings</Button>
        </div>


        {/* Contribution Heatmap */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-lg font-semibold mb-3">Learning Activity</div>
          <ProfileHeatmap />
        </div>


      </div>
    </div>
  );
}




