// Sample usage for levelSystem.ts
import {
  addXp, applyTopicCompletion, applyStreak, levelForXp, EXAMPLE_STREAK, EXAMPLE_THRESHOLDS
} from './levelSystem';

// Formula mode config
const formulaCfg = { mode: 'formula' as const, base: 100, curve: 1.6, streak: EXAMPLE_STREAK };
let state = { xp: 0, level: 1 };

// Award XP for 10 topics
state = addXp(state, 10 * 25, formulaCfg);
console.log('After 10 topics:', state, levelForXp(state.xp, formulaCfg));

// Award XP for 50 topics (should trigger multiple level-ups)
state = addXp(state, 50 * 25, formulaCfg);
console.log('After 50 topics:', state, levelForXp(state.xp, formulaCfg));

// Apply streak bonus for 7-day streak
state = applyStreak(state, 7, formulaCfg);
console.log('After 7-day streak:', state, levelForXp(state.xp, formulaCfg));

// Table mode config
const tableCfg = { mode: 'table' as const, thresholds: EXAMPLE_THRESHOLDS, streak: EXAMPLE_STREAK };
let tableState = { xp: 0, level: 1 };

tableState = addXp(tableState, 350, tableCfg);
console.log('Table mode after 350 XP:', tableState, levelForXp(tableState.xp, tableCfg));
