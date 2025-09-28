import { supabase } from '@/integrations/supabase/client';

export interface ContentItem {
  id: string;
  subject: string;
  difficulty_level: string;
  content_type: string;
  title: string;
  content: string;
  code_examples?: any;
  estimated_duration?: number;
  tags?: string[];
  thumbnail_url?: string;
  is_active: boolean;
  created_by_ai_at: string;
  used_count: number;
}

export class ContentService {
  /**
   * Load content from the AI content pool based on filters
   */
  static async loadContent(
    subject: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    contentType: 'video_script' | 'text_snippet',
    limit: number = 20
  ): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('ai_content_pool')
      .select('*')
      .eq('subject', subject.toLowerCase())
      .eq('difficulty_level', difficulty)
      .eq('content_type', contentType)
      .eq('is_active', true)
      .lt('used_count', 10) // Avoid overused content
      .order('created_by_ai_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading content:', error);
      throw error;
    }

    return data as ContentItem[] || [];
  }

  /**
   * Get fresh content by mixing older and newer content
   */
  static async getFreshContent(
    subject: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    contentType: 'video_script' | 'text_snippet',
    userId?: string
  ): Promise<ContentItem[]> {
    let query = supabase
      .from('ai_content_pool')
      .select('*')
      .eq('subject', subject.toLowerCase())
      .eq('difficulty_level', difficulty)
      .eq('content_type', contentType)
      .eq('is_active', true)
      .lt('used_count', 15);

    // If user is provided, exclude content they've already consumed
    if (userId) {
      const { data: consumedIds } = await supabase
        .from('user_content_consumption')
        .select('content_id')
        .eq('user_id', userId)
        .eq('subject', subject.toLowerCase())
        .eq('difficulty_level', difficulty);

      if (consumedIds && consumedIds.length > 0) {
        const ids = consumedIds.map(c => c.content_id);
        query = query.not('id', 'in', `(${ids.join(',')})`);
      }
    }

    const { data, error } = await query
      .order('used_count', { ascending: true }) // Prioritize less used content
      .order('created_by_ai_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error getting fresh content:', error);
      throw error;
    }

    return data as ContentItem[] || [];
  }

  /**
   * Mark content as consumed by a user
   */
  static async markContentConsumed(
    userId: string,
    contentId: string,
    subject: string,
    difficulty: string,
    completionPercentage: number
  ): Promise<void> {
    // Insert or update consumption record
    const { error: consumptionError } = await supabase
      .from('user_content_consumption')
      .upsert({
        user_id: userId,
        content_id: contentId,
        subject: subject.toLowerCase(),
        difficulty_level: difficulty,
        completion_percentage: completionPercentage,
        consumed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,content_id'
      });

    if (consumptionError) {
      console.error('Error marking content consumed:', consumptionError);
      throw consumptionError;
    }

    // Increment usage count using RPC
  await (supabase as any).rpc('increment_content_usage', { content_id: contentId });
  }

  /**
   * Update user interaction with content (like, bookmark, share)
   */
  static async updateContentInteraction(
    userId: string,
    contentId: string,
    interactionType: 'liked' | 'bookmarked' | 'shared',
    value: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('user_content_consumption')
      .update({ [interactionType]: value })
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      console.error('Error updating content interaction:', error);
      throw error;
    }
  }

  /**
   * Get user's consumption statistics
   */
  static async getUserConsumptionStats(userId: string) {
    const { data, error } = await supabase
      .from('user_content_consumption')
      .select('subject, difficulty_level, completion_percentage, consumed_at')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false });

    if (error) {
      console.error('Error getting user consumption stats:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Check if content generation is needed and trigger it
   */
  static async checkAndTriggerGeneration(
    userId: string,
    subject: string,
    difficulty: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('check-content-levels', {
        body: {
          userId,
          subject,
          difficulty
        }
      });

      if (error) {
        console.error('Error checking content levels:', error);
      } else {
        console.log('Content level check result:', data);
      }
    } catch (error) {
      console.error('Error in checkAndTriggerGeneration:', error);
    }
  }

  /**
   * Get content pool statistics
   */
  static async getContentPoolStats() {
    const { data, error } = await supabase
      .from('ai_content_pool')
      .select('subject, difficulty_level, content_type, used_count, is_active')
      .eq('is_active', true);

    if (error) {
      console.error('Error getting content pool stats:', error);
      throw error;
    }

    // Group by subject, difficulty, and content type
    const stats = data?.reduce((acc, item) => {
      const key = `${item.subject}-${item.difficulty_level}-${item.content_type}`;
      if (!acc[key]) {
        acc[key] = {
          subject: item.subject,
          difficulty: item.difficulty_level,
          contentType: item.content_type,
          totalItems: 0,
          availableItems: 0,
          averageUsage: 0
        };
      }
      
      acc[key].totalItems += 1;
      if (item.used_count < 10) {
        acc[key].availableItems += 1;
      }
      acc[key].averageUsage += item.used_count;
      
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate averages
    Object.values(stats).forEach((stat: any) => {
      stat.averageUsage = stat.averageUsage / stat.totalItems;
    });

    return stats;
  }
}