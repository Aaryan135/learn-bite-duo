import { supabase } from '@/integrations/supabase/client';

export type XpAction = 'view' | 'complete' | 'like' | 'bookmark' | 'share';

export interface XpProfile {
  xp: number;
  level: number;
}

export async function awardXp(action: XpAction) {
  const { data, error } = await supabase
    .rpc('award_xp', { p_action: action });

  if (error) throw error;
  // data: { new_xp, new_level, leveled_up }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    xp: row?.new_xp as number,
    level: row?.new_level as number,
    leveledUp: Boolean(row?.leveled_up),
  };
}

export async function getXpProfile(): Promise<XpProfile | null> {
  const { data, error } = await supabase
    .from('user_xp_profile')
    .select('xp, level')
    .single();
  if (error) return null;
  return { xp: data.xp, level: data.level };
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  totalActions: number;
  xp: number;
}

export async function getActivityHeatmap(startDateISO: string, endDateISO: string): Promise<ActivityDay[]> {
  const { data, error } = await supabase
    .from('user_activity_log')
    .select('activity_date, views, completes, likes, bookmarks, shares, xp_earned')
    .gte('activity_date', startDateISO)
    .lte('activity_date', endDateISO)
    .order('activity_date', { ascending: true });

  if (error) return [];

  return (data || []).map((d: any) => ({
    date: d.activity_date,
    totalActions: (d.views || 0) + (d.completes || 0) + (d.likes || 0) + (d.bookmarks || 0) + (d.shares || 0),
    xp: d.xp_earned || 0,
  }));
}


