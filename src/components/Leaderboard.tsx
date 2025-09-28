interface Leader {
  name: string;
  xp: number;
  avatar?: string;
}

const mockLeaders: Leader[] = [
  { name: 'Alex', xp: 18250 },
  { name: 'Taylor', xp: 17120 },
  { name: 'Jordan', xp: 16540 },
  { name: 'Sam', xp: 15400 },
  { name: 'Riley', xp: 14980 },
];

export default function Leaderboard({ leaders = mockLeaders }: { leaders?: Leader[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white">
      <div className="text-lg font-semibold mb-3">Leaderboard</div>
      <div className="space-y-2">
        {leaders.map((l, i) => (
          <div key={l.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/10 text-xs flex items-center justify-center">{i + 1}</div>
              <div className="font-medium">{l.name}</div>
            </div>
            <div className="text-blue-400 font-semibold">{l.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}


