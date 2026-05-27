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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_conversations: {
        Row: {
          avatar_emoji: string
          created_at: string
          description: string | null
          enabled_workflows: string[]
          id: string
          model: string
          system_prompt: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_emoji?: string
          created_at?: string
          description?: string | null
          enabled_workflows?: string[]
          id?: string
          model?: string
          system_prompt?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_emoji?: string
          created_at?: string
          description?: string | null
          enabled_workflows?: string[]
          id?: string
          model?: string
          system_prompt?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
          tool_results: Json | null
          user_id: string
          workflow_run_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
          tool_results?: Json | null
          user_id: string
          workflow_run_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
          tool_results?: Json | null
          user_id?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_assets: {
        Row: {
          created_at: string
          id: string
          platforms: string[]
          result: Json
          style: string
          tags: string[]
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platforms?: string[]
          result?: Json
          style?: string
          tags?: string[]
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platforms?: string[]
          result?: Json
          style?: string
          tags?: string[]
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contract_reviews: {
        Row: {
          attachment_id: string | null
          contract_type: string
          created_at: string
          error: string | null
          file_name: string
          id: string
          raw_text: string | null
          risks: Json
          score: number | null
          status: string
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_id?: string | null
          contract_type?: string
          created_at?: string
          error?: string | null
          file_name: string
          id?: string
          raw_text?: string | null
          risks?: Json
          score?: number | null
          status?: string
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_id?: string | null
          contract_type?: string
          created_at?: string
          error?: string | null
          file_name?: string
          id?: string
          raw_text?: string | null
          risks?: Json
          score?: number | null
          status?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_analyses: {
        Row: {
          cost_structure: Json
          created_at: string
          error: string | null
          file_name: string
          forecast: Json
          id: string
          insights: Json
          kpis: Json
          monthly: Json
          risks: Json
          row_count: number
          status: string
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_structure?: Json
          created_at?: string
          error?: string | null
          file_name: string
          forecast?: Json
          id?: string
          insights?: Json
          kpis?: Json
          monthly?: Json
          risks?: Json
          row_count?: number
          status?: string
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_structure?: Json
          created_at?: string
          error?: string | null
          file_name?: string
          forecast?: Json
          id?: string
          insights?: Json
          kpis?: Json
          monthly?: Json
          risks?: Json
          row_count?: number
          status?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          model: string | null
          output: string | null
          prompt: string | null
          status: string
          task_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          model?: string | null
          output?: string | null
          prompt?: string | null
          status?: string
          task_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          model?: string | null
          output?: string | null
          prompt?: string | null
          status?: string
          task_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_runs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          input_summary: string | null
          priority: string
          result: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_summary?: string | null
          priority?: string
          result?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_summary?: string | null
          priority?: string
          result?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          default_model: string | null
          id: string
          notifications: Json
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_model?: string | null
          id?: string
          notifications?: Json
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_model?: string | null
          id?: string
          notifications?: Json
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          input: Json
          output: Json | null
          status: string
          steps: Json
          user_id: string
          workflow_id: string | null
          workflow_name: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
          steps?: Json
          user_id: string
          workflow_id?: string | null
          workflow_name: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
          steps?: Json
          user_id?: string
          workflow_id?: string | null
          workflow_name?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          graph: Json
          id: string
          is_template: boolean
          node_count: number
          scene: string | null
          status: string
          tags: string[]
          thumbnail: string | null
          title: string
          updated_at: string
          user_id: string
          version: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          graph?: Json
          id?: string
          is_template?: boolean
          node_count?: number
          scene?: string | null
          status?: string
          tags?: string[]
          thumbnail?: string | null
          title: string
          updated_at?: string
          user_id: string
          version?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          graph?: Json
          id?: string
          is_template?: boolean
          node_count?: number
          scene?: string | null
          status?: string
          tags?: string[]
          thumbnail?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          version?: string
        }
        Relationships: []
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
