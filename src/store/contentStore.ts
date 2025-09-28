import { create } from 'zustand';
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

export interface UserConsumption {
  id: string;
  user_id: string;
  content_id: string;
  subject: string;
  difficulty_level: string;
  consumed_at: string;
  completion_percentage: number;
  liked: boolean;
  bookmarked: boolean;
  shared: boolean;
}


interface ContentState {
  content: ContentItem[];
  currentIndex: number;
  loading: boolean;
  loadingMore: boolean;
  selectedSubject: string | 'all';
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  mode: 'video_script' | 'text_snippet';
  userConsumption: UserConsumption[];

  // Selectors
  getSavedContent: () => ContentItem[];

  // Actions
  setContent: (content: ContentItem[]) => void;
  setCurrentIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setSelectedSubject: (subject: string | 'all') => void;
  setSelectedDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all') => void;
  setMode: (mode: 'video_script' | 'text_snippet') => void;
  loadContent: () => Promise<void>;
  loadInitialContent: () => Promise<void>;
  loadMoreContent: () => Promise<void>;
  triggerBackgroundGeneration: () => void;
  triggerContentGeneration: () => void;
  markContentConsumed: (contentId: string, completionPercentage: number) => Promise<void>;
  updateContentInteraction: (contentId: string, type: 'liked' | 'bookmarked' | 'shared', value: boolean) => Promise<void>;
  checkAndTriggerGeneration: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: [],
  currentIndex: 0,
  loading: false,
  loadingMore: false,
  selectedSubject: 'all',
  selectedDifficulty: 'all',
  mode: 'video_script',
  userConsumption: [],
  loadMoreContent: async () => {
    const { selectedSubject, selectedDifficulty, mode, content } = get();
    set({ loadingMore: true });
    try {
      let query = supabase
        .from('ai_content_pool')
        .select('*')
        .eq('content_type', mode)
        .eq('is_active', true)
        .order('created_by_ai_at', { ascending: false })
        .range(content.length, content.length + 19);

      if (selectedSubject && selectedSubject !== 'all') {
        query = query.eq('subject', selectedSubject.toLowerCase());
      }
      if (selectedDifficulty && selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error loading more content:', error);
        return;
      }
      if (data && data.length > 0) {
        set({ content: [...content, ...data] });
      }
    } catch (error) {
      console.error('Error in loadMoreContent:', error);
    } finally {
      set({ loadingMore: false });
    }
  },


  triggerBackgroundGeneration: async () => {
    // Generate content for all subjects (hardcoded list for now)
    const subjects = ['javascript', 'react', 'python', 'typescript'];
    const { selectedDifficulty, mode } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const subject of subjects) {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          subject,
          difficulty: selectedDifficulty === 'all' ? 'beginner' : selectedDifficulty,
          contentType: mode,
          count: 5
        }
      });
      if (error) {
        console.error(`Error generating content for subject ${subject}:`, error);
      } else {
        console.log(`Content generation result for ${subject}:`, data);
      }
    }
  },

  triggerContentGeneration: async () => {
    // Generate content for the selected subject
    const { selectedSubject, selectedDifficulty, mode } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedSubject || selectedSubject === 'all') return;
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        subject: selectedSubject,
        difficulty: selectedDifficulty === 'all' ? 'beginner' : selectedDifficulty,
        contentType: mode,
        count: 5
      }
    });
    if (error) {
      console.error(`Error generating content for subject ${selectedSubject}:`, error);
    } else {
      console.log(`Content generation result for ${selectedSubject}:`, data);
    }
  },

  getSavedContent: () => {
    const { content, userConsumption } = get();
    // Find all content items where userConsumption has bookmarked true
    const bookmarkedIds = userConsumption.filter(uc => uc.bookmarked).map(uc => uc.content_id);
    return content.filter(item => bookmarkedIds.includes(item.id));
  },

  setContent: (content) => set({ content }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setLoading: (loading) => set({ loading }),
  setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setMode: (mode) => set({ mode }),

  loadContent: async () => {
    const { selectedSubject, selectedDifficulty, mode, triggerContentGeneration } = get();
    set({ loading: true });
    try {
      let query = supabase
        .from('ai_content_pool')
        .select('*')
        .eq('content_type', mode)
        .eq('is_active', true)
        .order('created_by_ai_at', { ascending: false })
        .limit(20);

      if (selectedSubject && selectedSubject !== 'all') {
        query = query.eq('subject', selectedSubject.toLowerCase());
      }
      if (selectedDifficulty && selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error loading content:', error);
        return;
      }
      set({ content: data as ContentItem[] || [], currentIndex: 0 });

      // If less than 10 reels, trigger content generation and poll for new content
      if (!data || data.length < 10) {
        if (typeof triggerContentGeneration === 'function') {
          await triggerContentGeneration();
          // Poll for new content up to 10 seconds
          let attempts = 0;
          let lastPollData = data;
          while (attempts < 10) {
            await new Promise(res => setTimeout(res, 1000));
            let pollQuery = supabase
              .from('ai_content_pool')
              .select('*')
              .eq('content_type', mode)
              .eq('is_active', true)
              .order('created_by_ai_at', { ascending: false })
              .limit(20);
            if (selectedSubject && selectedSubject !== 'all') {
              pollQuery = pollQuery.eq('subject', selectedSubject.toLowerCase());
            }
            if (selectedDifficulty && selectedDifficulty !== 'all') {
              pollQuery = pollQuery.eq('difficulty_level', selectedDifficulty);
            }
            const { data: pollData, error: pollError } = await pollQuery;
            if (pollError) {
              console.error('Error polling for new content:', pollError);
              break;
            }
            if (pollData && pollData.length > (lastPollData?.length || 0)) {
              set({ content: pollData as ContentItem[] || [], currentIndex: 0 });
              break;
            }
            lastPollData = pollData;
            attempts++;
          }
        }
      }
    } catch (error) {
      console.error('Error in loadContent:', error);
    } finally {
      set({ loading: false });
    }
  },

    loadInitialContent: async () => {
      // Alias for loadContent for compatibility
      return get().loadContent();
  },

  markContentConsumed: async (contentId: string, completionPercentage: number) => {
    const { selectedSubject, selectedDifficulty } = get();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already consumed
      const { data: existing, error: selectError } = await supabase
        .from('user_content_consumption')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .maybeSingle();
      if (selectError) {
        console.error('Error selecting user_content_consumption:', selectError);
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_content_consumption')
          .update({ 
            completion_percentage: Math.max(existing.completion_percentage, completionPercentage),
            consumed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        if (updateError) {
          console.error('Error updating user_content_consumption:', updateError);
        }
      } else {
        // Insert new consumption record
        const { error: insertError } = await supabase
          .from('user_content_consumption')
          .insert({
            user_id: user.id,
            content_id: contentId,
            subject: selectedSubject.toLowerCase(),
            difficulty_level: selectedDifficulty,
            completion_percentage: completionPercentage
          });
        if (insertError) {
          console.error('Error inserting user_content_consumption:', insertError);
        }
      }

      // Update content usage count using RPC
      const { error: rpcError } = await (supabase as any).rpc('increment_content_usage', { content_id: contentId });
      if (rpcError) {
        console.error('Error calling increment_content_usage RPC:', rpcError);
      }
    } catch (error) {
      console.error('Error marking content consumed:', error);
    }
  },

  updateContentInteraction: async (contentId: string, type: 'liked' | 'bookmarked' | 'shared', value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing, error: selectError } = await supabase
        .from('user_content_consumption')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .maybeSingle();
      if (selectError) {
        console.error('Error selecting user_content_consumption:', selectError);
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from('user_content_consumption')
          .update({ [type]: value })
          .eq('id', existing.id);
        if (updateError) {
          console.error('Error updating user_content_consumption:', updateError);
        }
      }
    } catch (error) {
      console.error('Error updating content interaction:', error);
    }
  },

  checkAndTriggerGeneration: async () => {
    const { selectedSubject, selectedDifficulty, currentIndex } = get();
    
    // Only check every 5 items viewed
    if (currentIndex > 0 && currentIndex % 5 === 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Call the check-content-levels function
        const { data, error } = await supabase.functions.invoke('check-content-levels', {
          body: {
            userId: user.id,
            subject: selectedSubject,
            difficulty: selectedDifficulty
          }
        });

        if (error) {
          console.error('Error checking content levels:', error);
        } else {
          console.log('Content level check completed:', data);
        }
      } catch (error) {
        console.error('Error in checkAndTriggerGeneration:', error);
      }
    }
  }
}));