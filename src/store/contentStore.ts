import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  /**
   * Load more content for the current subject/difficulty/mode and append to the feed.
   */
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
        toast.error('Error loading more content. Please try again.');
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


  /**
   * Generate content in the background for all subjects (used for prefetching).
   */
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
        toast.error(`Error generating content for ${subject}. Please try again.`);
      } else {
        console.log(`Content generation result for ${subject}:`, data);
      }
    }
  },

  /**
   * Generate content for the currently selected subject/difficulty/mode.
   */
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
      toast.error(`Error generating content for ${selectedSubject}. Please try again.`);
    } else {
      console.log(`Content generation result for ${selectedSubject}:`, data);
    }
  },

  /**
   * Get all content items that the user has bookmarked.
   */
  getSavedContent: () => {
    const { content, userConsumption } = get();
    // Find all content items where userConsumption has bookmarked true
    const bookmarkedIds = userConsumption.filter(uc => uc.bookmarked).map(uc => uc.content_id);
    return content.filter(item => bookmarkedIds.includes(item.id));
  },

  /**
   * Set the content array, deduplicating by id.
   */
  setContent: (content) => {
    // Deduplicate by id
    const unique = Array.from(new Map(content.map(item => [item.id, item])).values());
    set({ content: unique });
  },
  /**
   * Set the current index in the feed.
   */
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  /**
   * Set the loading state for content operations.
   */
  setLoading: (loading) => set({ loading }),
  /**
   * Set the currently selected subject for filtering content.
   */
  setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
  /**
   * Set the currently selected difficulty for filtering content.
   */
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  /**
   * Set the current content mode (video_script or text_snippet).
   */
  setMode: (mode) => set({ mode }),

  /**
   * Load content for the current subject/difficulty/mode. Triggers generation if not enough content.
   */
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
        toast.error('Error loading content. Please try again.');
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
              toast.error('Error polling for new content. Please try again.');
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

  /**
   * Alias for loadContent for compatibility.
   */
  loadInitialContent: async () => {
      // Alias for loadContent for compatibility
      return get().loadContent();
  },

  /**
   * Mark a content item as consumed by the user, updating or inserting the record.
   */
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
        toast.error('Error loading user progress. Please try again.');
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
          toast.error('Error saving your progress. Please try again.');
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
          toast.error('Error saving your progress. Please try again.');
        }
      }

      // Update content usage count using RPC
      const { error: rpcError } = await (supabase as any).rpc('increment_content_usage', { content_id: contentId });
      if (rpcError) {
        console.error('Error calling increment_content_usage RPC:', rpcError);
        toast.error('Error updating content usage. Please try again.');
      }
    } catch (error) {
      console.error('Error marking content consumed:', error);
    }
  },

  /**
   * Update user interaction (like, bookmark, share) for a content item.
   */
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
        toast.error('Error loading your interaction. Please try again.');
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from('user_content_consumption')
          .update({ [type]: value })
          .eq('id', existing.id);
        if (updateError) {
          console.error('Error updating user_content_consumption:', updateError);
          toast.error('Error saving your interaction. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating content interaction:', error);
      toast.error('Error updating content interaction. Please try again.');
    }
  },

  /**
   * Check if content generation is needed and trigger it if required.
   */
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
          toast.error('Error checking content levels. Please try again.');
        } else {
          console.log('Content level check completed:', data);
        }
      } catch (error) {
        console.error('Error in checkAndTriggerGeneration:', error);
        toast.error('Error checking content levels. Please try again.');
      }
    }
  }
}));