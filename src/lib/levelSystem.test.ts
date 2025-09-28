/**
 * Tests for levelSystem.ts
 * Deterministic, pure, no side effects.
 */
import {
  clamp, cumulative, percent,
  xpForLevel, levelForXp, addXp, applyTopicCompletion, applyStreak,
  EXAMPLE_THRESHOLDS, EXAMPLE_STREAK
} from './levelSystem';

describe('Utility functions', () => {
  test('clamp clamps values', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
  test('cumulative sums array', () => {
    expect(cumulative([1,2,3])).toEqual([1,3,6]);
  });
  test('percent computes correct progress', () => {
    expect(percent(5, 0, 10)).toBeCloseTo(0.5);
    expect(percent(10, 0, 10)).toBeCloseTo(1);
    expect(percent(0, 0, 10)).toBeCloseTo(0);
  });
});

describe('Formula progression', () => {
  const cfg = { mode: 'formula' as const, base: 100, curve: 1.6, streak: EXAMPLE_STREAK };
  test('xpForLevel returns expected values', () => {
  expect(xpForLevel(1, cfg)).toBe(100);
  expect(xpForLevel(2, cfg)).toBe(303);
  expect(xpForLevel(3, cfg)).toBe(580);
  });
  test('levelForXp monotonic and correct', () => {
    expect(levelForXp(0, cfg).level).toBe(1);
    expect(levelForXp(100, cfg).level).toBe(1);
    expect(levelForXp(304, cfg).level).toBe(2);
    expect(levelForXp(601, cfg).level).toBe(3);
    expect(levelForXp(2000, cfg).level).toBeGreaterThan(3);
  });
  test('addXp handles multi-level-ups', () => {
    let state = { xp: 0, level: 1 };
    let res = addXp(state, 1000, cfg);
    expect(res.level).toBeGreaterThan(state.level);
    expect(res.levelsGained).toBe(res.level - state.level);
    expect(res.leveledUp).toBe(true);
  });
});

describe('Table progression', () => {
  const cfg = { mode: 'table' as const, thresholds: EXAMPLE_THRESHOLDS, streak: EXAMPLE_STREAK };
  test('xpForLevel returns table values', () => {
    expect(xpForLevel(1, cfg)).toBe(EXAMPLE_THRESHOLDS[0]);
    expect(xpForLevel(5, cfg)).toBe(EXAMPLE_THRESHOLDS[4]);
  });
  test('levelForXp exact threshold edges', () => {
    expect(levelForXp(0, cfg).level).toBe(1);
    expect(levelForXp(100, cfg).level).toBe(2);
    expect(levelForXp(250, cfg).level).toBe(3);
    expect(levelForXp(15700, cfg).level).toBe(EXAMPLE_THRESHOLDS.length);
  });
  test('addXp clamps at levelCap', () => {
  let capCfg = { ...cfg, levelCap: 5 };
    let state = { xp: 0, level: 1 };
    let res = addXp(state, 20000, capCfg);
    expect(res.level).toBe(5);
  });
});

describe('applyTopicCompletion', () => {
  const cfg = { mode: 'formula' as const, streak: EXAMPLE_STREAK };
  test('awards per-topic XP and respects daily cap', () => {
    let state = { xp: 0, level: 1 };
    let res = applyTopicCompletion(state, 10, cfg, 0);
    expect(res.awarded).toBe(10 * 25);
    let capped = applyTopicCompletion(state, 100, cfg, 45);
    expect(capped.awarded).toBe(5 * 25); // only 5 allowed
  });
});

describe('applyStreak', () => {
  const cfg = { mode: 'formula' as const, streak: EXAMPLE_STREAK };
  test('awards correct milestone bonus', () => {
    let state = { xp: 0, level: 1 };
    let res = applyStreak(state, 7, cfg);
    expect(res.bonus).toBe(50);
    let res2 = applyStreak(state, 30, cfg);
    expect(res2.bonus).toBe(250);
  });
  test('no bonus for sub-milestone', () => {
    let state = { xp: 0, level: 1 };
    let res = applyStreak(state, 2, cfg);
    expect(res.bonus).toBe(0);
  });
});
