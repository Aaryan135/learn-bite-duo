/**
 * Level progression system for learning apps.
 * Supports formula-based and table-based XP curves, streak bonuses, and topic XP with daily caps.
 * Pure functions only. No I/O, no side effects.
 */

// --- Utility Functions ---

/** Clamp a value between min and max. */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Return cumulative sums of an array. */
export function cumulative(arr: number[]): number[] {
  let sum = 0;
  return arr.map(v => (sum += v));
}

/** Compute percent progress from min to max. */
export function percent(current: number, min: number, max: number): number {
  if (max === min) return 1;
  return clamp((current - min) / (max - min), 0, 1);
}

// --- Types ---

export type ProgressionConfig = {
  mode: 'formula' | 'table';
  base?: number; // default 100
  curve?: number; // default 1.6
  thresholds?: number[]; // cumulative XP per level start
  perTopicXp?: number; // default 25
  dailyTopicCap?: number; // default 50
  streak: {
    milestones: number[]; // e.g., [3,7,14,30]
    rewards: number[]; // e.g., [20,50,100,250]
    decay?: 'reset' | 'grace-1-day'; // default 'reset'
  };
  levelCap?: number | 'auto';
};

// --- Defaults ---

const DEFAULTS = {
  base: 100,
  curve: 1.6,
  perTopicXp: 25,
  dailyTopicCap: 50,
  streak: {
    milestones: [3, 7, 14, 30],
    rewards: [20, 50, 100, 250],
    decay: 'reset' as const,
  },
};

// Example static thresholds for levels 1–20 (cumulative XP at each level start)
export const EXAMPLE_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 4900, 5900, 7000, 8200, 9500, 10900, 12400, 14000, 15700
];

// Example streak config
export const EXAMPLE_STREAK = {
  milestones: [3, 7, 14, 30],
  rewards: [20, 50, 100, 250],
  decay: 'reset' as const,
};

// --- Core Functions ---

/**
 * Get the cumulative XP required to reach a given level (level >= 1).
 * Formula: xp = round(base * (level ^ curve))
 * Table: uses thresholds[level-1]
 * @param level Level (1-based)
 * @param cfg ProgressionConfig
 */
export function xpForLevel(level: number, cfg?: ProgressionConfig): number {
  if (!cfg || cfg.mode === 'formula') {
    const base = cfg?.base ?? DEFAULTS.base;
    const curve = cfg?.curve ?? DEFAULTS.curve;
    return Math.round(base * Math.pow(level, curve));
  } else if (cfg.mode === 'table') {
    if (!cfg.thresholds) throw new Error('No thresholds provided for table mode');
    return cfg.thresholds[clamp(level - 1, 0, cfg.thresholds.length - 1)];
  }
  throw new Error('Invalid progression config');
}

/**
 * Given XP, compute level, current/next thresholds, and progress percent.
 * @param xp Current XP
 * @param cfg ProgressionConfig
 */
export function levelForXp(xp: number, cfg?: ProgressionConfig): { level: number; current: number; next: number; progressPct: number } {
  let level = 1, current = 0, next = 0;
  if (!cfg || cfg.mode === 'formula') {
    const base = cfg?.base ?? DEFAULTS.base;
    const curve = cfg?.curve ?? DEFAULTS.curve;
    // Find level such that xpForLevel(level) <= xp < xpForLevel(level+1)
    while (xp >= xpForLevel(level + 1, cfg)) level++;
    current = xpForLevel(level, cfg);
    next = xpForLevel(level + 1, cfg);
  } else if (cfg.mode === 'table') {
    if (!cfg.thresholds) throw new Error('No thresholds provided for table mode');
    const th = cfg.thresholds;
    while (level < th.length && xp >= th[level]) level++;
    current = th[clamp(level - 1, 0, th.length - 1)];
    next = th[clamp(level, 0, th.length - 1)] ?? current + 1;
  }
  const progressPct = percent(xp, current, next);
  return { level, current, next, progressPct };
}

/**
 * Add XP and compute new level, handling multi-level-ups and level cap.
 * @param state { xp, level }
 * @param delta XP to add
 * @param cfg ProgressionConfig
 */
export function addXp(
  state: { xp: number; level: number },
  delta: number,
  cfg?: ProgressionConfig
): { xp: number; level: number; leveledUp: boolean; levelsGained: number } {
  let xp = state.xp + delta;
  let { level: oldLevel } = state;
  let { level, current, next } = levelForXp(xp, cfg);
  let levelCap = cfg?.levelCap === 'auto' && cfg?.mode === 'table' && cfg.thresholds ? cfg.thresholds.length : cfg?.levelCap;
  if (levelCap) {
    level = clamp(level, 1, typeof levelCap === 'number' ? levelCap : 99);
    xp = Math.min(xp, xpForLevel(level + 1, cfg) - 1);
  }
  const levelsGained = level - oldLevel;
  return { xp, level, leveledUp: levelsGained > 0, levelsGained };
}

/**
 * Award XP for topic completions, with per-topic XP and daily cap.
 * @param state { xp, level }
 * @param topicsCompletedDelta Number of topics completed
 * @param cfg ProgressionConfig
 * @param todayCount Number of topics completed today (for cap)
 */
export function applyTopicCompletion(
  state: { xp: number; level: number },
  topicsCompletedDelta: number,
  cfg?: ProgressionConfig,
  todayCount: number = 0
): { xp: number; level: number; leveledUp: boolean; levelsGained: number; awarded: number } {
  const perTopicXp = cfg?.perTopicXp ?? DEFAULTS.perTopicXp;
  const dailyCap = cfg?.dailyTopicCap ?? DEFAULTS.dailyTopicCap;
  const allowed = clamp(dailyCap - todayCount, 0, dailyCap);
  const grant = clamp(topicsCompletedDelta, 0, allowed) * perTopicXp;
  const res = addXp(state, grant, cfg);
  return { ...res, awarded: grant };
}

/**
 * Award streak bonus XP for hitting milestones.
 * @param state { xp, level }
 * @param days Number of consecutive days
 * @param cfg ProgressionConfig
 * @returns XP bonus for the highest milestone achieved
 */
export function applyStreak(
  state: { xp: number; level: number },
  days: number,
  cfg?: ProgressionConfig
): { xp: number; level: number; leveledUp: boolean; levelsGained: number; bonus: number } {
  const streak = cfg?.streak ?? DEFAULTS.streak;
  let bonus = 0;
  for (let i = streak.milestones.length - 1; i >= 0; i--) {
    if (days >= streak.milestones[i]) {
      bonus = streak.rewards[i];
      break;
    }
  }
  const res = addXp(state, bonus, cfg);
  return { ...res, bonus };
}

/**
 * Example usage:
 *
 * const cfg: ProgressionConfig = { mode: 'formula', base: 100, curve: 1.6, streak: EXAMPLE_STREAK };
 * let state = { xp: 0, level: 1 };
 * state = addXp(state, 120, cfg); // Award 120 XP
 * state = applyTopicCompletion(state, 10, cfg, 0); // 10 topics, daily cap applies
 * state = applyStreak(state, 7, cfg); // 7-day streak bonus
 *
 * // Table mode:
 * const tableCfg: ProgressionConfig = { mode: 'table', thresholds: EXAMPLE_THRESHOLDS, streak: EXAMPLE_STREAK };
 * let tableState = { xp: 0, level: 1 };
 * tableState = addXp(tableState, 350, tableCfg);
 */
