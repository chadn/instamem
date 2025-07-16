export type Database = {
  public: {
    Tables: {
      tag_keys: {
        Row: {
          id: string
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      tag_values: {
        Row: {
          id: string
          tag_id: string
          text: string
        }
        Insert: {
          id?: string
          tag_id: string
          text: string
        }
        Update: {
          id?: string
          tag_id?: string
          text?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          content: string
          memory_date: string
          created_at: string
          updated_at: string
          url: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          content: string
          memory_date: string
          created_at?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          memory_date?: string
          created_at?: string
          updated_at?: string
          url?: string | null
        }
      }
      memory_tag: {
        Row: {
          memory_id: string
          tag_id: string
        }
        Insert: {
          memory_id: string
          tag_id: string
        }
        Update: {
          memory_id?: string
          tag_id?: string
        }
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

export type Memory = Database['public']['Tables']['memories']['Row']
export type TagKey = Database['public']['Tables']['tag_keys']['Row']
export type TagValue = Database['public']['Tables']['tag_values']['Row']
export type MemoryTag = Database['public']['Tables']['memory_tag']['Row']