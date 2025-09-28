import { create } from 'zustand';

interface XpState {
  xp: number | null;
  level: number | null;
  leveledUp: boolean;
  setXpLevel: (xp: number, level: number, leveledUp?: boolean) => void;
  clearLevelUp: () => void;
}

export const useXpStore = create<XpState>((set) => ({
  xp: null,
  level: null,
  leveledUp: false,
  setXpLevel: (xp, level, leveledUp = false) => set({ xp, level, leveledUp }),
  clearLevelUp: () => set({ leveledUp: false }),
}));

export function xpThreshold(level: number): number {
  return (level * level + 3 * level) * 25;
}


