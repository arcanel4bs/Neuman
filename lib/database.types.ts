export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      console_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          last_accessed: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          last_accessed?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          last_accessed?: string
        }
      }
      response: {
        Row: {
          id: string
          prompt: string
          format: string
          data_size: string
          generated_data: Json
          created_at: string
          status: string
          metadata: Json
          rating?: number
          upvotes?: number
          downvotes?: number
        }
        Insert: {
          id?: string
          prompt: string
          format: string
          data_size: string
          generated_data: Json
          created_at?: string
          status?: string
          metadata?: Json
          rating?: number
          upvotes?: number
          downvotes?: number
        }
        Update: {
          id?: string
          prompt?: string
          format?: string
          data_size?: string
          generated_data?: Json
          created_at?: string
          status?: string
          metadata?: Json
          rating?: number
          upvotes?: number
          downvotes?: number
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          default_size: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_size: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_size?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_history: {
        Row: {
          id: string
          user_id: string
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          created_at?: string
        }
      }
      error_logs: {
        Row: {
          id: string
          error: Json
          timestamp: string
          data_sample: string
        }
        Insert: {
          id?: string
          error: Json
          timestamp?: string
          data_sample?: string
        }
        Update: {
          id?: string
          error?: Json
          timestamp?: string
          data_sample?: string
        }
      }
      early_access_signups: {
        Row: {
          id: string
          email: string
          status: string
          signed_up_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          email: string
          status?: string
          signed_up_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          status?: string
          signed_up_at?: string
          metadata?: Json
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
  }
} 