import { useXpStore } from '@/store/xpStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

export default function LevelUpModal() {
  const leveledUp = useXpStore((s) => s.leveledUp);
  const level = useXpStore((s) => s.level);
  const clearLevelUp = useXpStore((s) => s.clearLevelUp);

  return (
    <Dialog open={leveledUp} onOpenChange={clearLevelUp}>
      <DialogContent className="sm:max-w-sm bg-black border border-white/20 text-white text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" /> Level Up!
          </DialogTitle>
        </DialogHeader>
        <div className="text-xl font-semibold">You reached Level {level}</div>
        <div className="text-white/70 mt-1">Keep your streak to boost rewards.</div>
      </DialogContent>
    </Dialog>
  );
}


