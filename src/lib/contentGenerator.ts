import { supabase } from '@/integrations/supabase/client';

export class ContentGenerationService {
  
  static async scheduleGeneration(userId: string, subjects: string[], difficulties: string[]) {
    // This runs automatically based on user behavior
    for (const subject of subjects) {
      for (const difficulty of difficulties) {
        
        // Check if we need more content for this combination
        const needsGeneration = await this.checkContentLevels(userId, subject, difficulty);
        
        if (needsGeneration) {
          // Generate content in background using Supabase Edge Function
          try {
            await supabase.functions.invoke('generate-content', {
              body: {
                subject,
                difficulty,
                contentType: Math.random() > 0.5 ? 'video_script' : 'text_snippet',
                count: 10
              }
            });
            
            console.log(`Triggered generation for ${subject} - ${difficulty}`);
          } catch (error) {
            console.error('Error generating content:', error);
          }
        }
      }
    }
  }

  static async checkContentLevels(userId: string, subject: string, difficulty: string): Promise<boolean> {
    try {
      // Count user's consumption
      const { count: consumedCount } = await supabase
        .from('user_content_consumption')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('difficulty_level', difficulty);

      // Count available unused content
      const { count: availableCount } = await supabase
        .from('ai_content_pool')
        .select('*', { count: 'exact' })
        .eq('subject', subject)
        .eq('difficulty_level', difficulty)
        .eq('is_active', true)
        .lt('used_count', 5);

      // Generate if user consumed 5+ and we have less than 5 available
      return (consumedCount || 0) >= 5 && (availableCount || 0) < 5;
    } catch (error) {
      console.error('Error checking content levels:', error);
      return false;
    }
  }

  static async initializeContentPool() {
    // Check if we have enough initial content
    const subjects = ['javascript', 'react', 'python', 'typescript'];
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    
    for (const subject of subjects) {
      for (const difficulty of difficulties) {
        const { count } = await supabase
          .from('ai_content_pool')
          .select('*', { count: 'exact' })
          .eq('subject', subject)
          .eq('difficulty_level', difficulty)
          .eq('is_active', true);

        // If we have less than 5 pieces, generate more
        if ((count || 0) < 5) {
          try {
            await supabase.functions.invoke('generate-content', {
              body: {
                subject,
                difficulty,
                contentType: Math.random() > 0.5 ? 'video_script' : 'text_snippet',
                count: 10
              }
            });
          } catch (error) {
            console.error(`Error initializing content for ${subject}-${difficulty}:`, error);
          }
        }
      }
    }
  }
}