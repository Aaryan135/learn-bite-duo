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
  selectedSubject: string;
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  mode: 'video_script' | 'text_snippet';
  userConsumption: UserConsumption[];
  
  // Actions
  setContent: (content: ContentItem[]) => void;
  setCurrentIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setSelectedSubject: (subject: string) => void;
  setSelectedDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  setMode: (mode: 'video_script' | 'text_snippet') => void;
  loadContent: () => Promise<void>;
  markContentConsumed: (contentId: string, completionPercentage: number) => Promise<void>;
  updateContentInteraction: (contentId: string, type: 'liked' | 'bookmarked' | 'shared', value: boolean) => Promise<void>;
  checkAndTriggerGeneration: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: [],
  currentIndex: 0,
  loading: false,
  selectedSubject: 'javascript',
  selectedDifficulty: 'beginner',
  mode: 'video_script',
  userConsumption: [],

  setContent: (content) => set({ content }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setLoading: (loading) => set({ loading }),
  setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setMode: (mode) => set({ mode }),

  loadContent: async () => {
    const { selectedSubject, selectedDifficulty, mode } = get();
    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('ai_content_pool')
        .select('*')
        .eq('subject', selectedSubject.toLowerCase())
        .eq('difficulty_level', selectedDifficulty)
        .eq('content_type', mode)
        .eq('is_active', true)
        .order('created_by_ai_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading content:', error);
        return;
      }

      set({ content: data as ContentItem[] || [], currentIndex: 0 });
    } catch (error) {
      console.error('Error in loadContent:', error);
    } finally {
      set({ loading: false });
    }
  },

  markContentConsumed: async (contentId: string, completionPercentage: number) => {
    const { selectedSubject, selectedDifficulty } = get();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already consumed
      const { data: existing } = await supabase
        .from('user_content_consumption')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('user_content_consumption')
          .update({ 
            completion_percentage: Math.max(existing.completion_percentage, completionPercentage),
            consumed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Insert new consumption record
        await supabase
          .from('user_content_consumption')
          .insert({
            user_id: user.id,
            content_id: contentId,
            subject: selectedSubject.toLowerCase(),
            difficulty_level: selectedDifficulty,
            completion_percentage: completionPercentage
          });
      }

      // Update content usage count using RPC
      await supabase.rpc('increment_content_usage', { content_id: contentId });

    } catch (error) {
      console.error('Error marking content consumed:', error);
    }
  },

  updateContentInteraction: async (contentId: string, type: 'liked' | 'bookmarked' | 'shared', value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('user_content_consumption')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single();

      if (existing) {
        await supabase
          .from('user_content_consumption')
          .update({ [type]: value })
          .eq('id', existing.id);
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