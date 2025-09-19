export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_content_pool: {
        Row: {
          code_examples: Json | null
          content: string
          content_type: string
          created_by_ai_at: string | null
          difficulty_level: string
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          subject: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          used_count: number | null
        }
        Insert: {
          code_examples?: Json | null
          content: string
          content_type: string
          created_by_ai_at?: string | null
          difficulty_level: string
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          subject: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          used_count?: number | null
        }
        Update: {
          code_examples?: Json | null
          content?: string
          content_type?: string
          created_by_ai_at?: string | null
          difficulty_level?: string
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          subject?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          used_count?: number | null
        }
        Relationships: []
      }
      content_generation: {
        Row: {
          content_type: string
          created_at: string | null
          difficulty_level: string
          generated_count: number | null
          id: string
          last_generated_at: string | null
          next_generation_threshold: number | null
          subject: string
          user_id: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          difficulty_level: string
          generated_count?: number | null
          id?: string
          last_generated_at?: string | null
          next_generation_threshold?: number | null
          subject: string
          user_id?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          difficulty_level?: string
          generated_count?: number | null
          id?: string
          last_generated_at?: string | null
          next_generation_threshold?: number | null
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_generation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_difficulty: string | null
          preferred_subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_difficulty?: string | null
          preferred_subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_difficulty?: string | null
          preferred_subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_content_consumption: {
        Row: {
          bookmarked: boolean | null
          completion_percentage: number | null
          consumed_at: string | null
          content_id: string
          difficulty_level: string
          id: string
          liked: boolean | null
          shared: boolean | null
          subject: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean | null
          completion_percentage?: number | null
          consumed_at?: string | null
          content_id: string
          difficulty_level: string
          id?: string
          liked?: boolean | null
          shared?: boolean | null
          subject: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean | null
          completion_percentage?: number | null
          consumed_at?: string | null
          content_id?: string
          difficulty_level?: string
          id?: string
          liked?: boolean | null
          shared?: boolean | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_consumption_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "ai_content_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_content_consumption_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
