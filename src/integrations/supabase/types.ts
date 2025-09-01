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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_deletions: {
        Row: {
          deleted_at: string
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          user_email: string
          user_id: string
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          is_makeup: boolean
          mood_score: number | null
          note: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          is_makeup?: boolean
          mood_score?: number | null
          note?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          is_makeup?: boolean
          mood_score?: number | null
          note?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diabetes_records: {
        Row: {
          blood_sugar: number
          created_at: string
          diet: string | null
          exercise: string | null
          id: string
          insulin_dose: string | null
          measurement_time: string
          medication: string | null
          note: string | null
          timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_sugar: number
          created_at?: string
          diet?: string | null
          exercise?: string | null
          id?: string
          insulin_dose?: string | null
          measurement_time?: string
          medication?: string | null
          note?: string | null
          timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_sugar?: number
          created_at?: string
          diet?: string | null
          exercise?: string | null
          id?: string
          insulin_dose?: string | null
          measurement_time?: string
          medication?: string | null
          note?: string | null
          timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      education_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          reading_time: number | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          reading_time?: number | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          reading_time?: number | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_sms_logs: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          location_data: Json | null
          message: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          location_data?: Json | null
          message: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          location_data?: Json | null
          message?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_sms_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "emergency_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      english_listening: {
        Row: {
          content: string
          created_at: string
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          title: string
          topic: string | null
          translation: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          title: string
          topic?: string | null
          translation: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          title?: string
          topic?: string | null
          translation?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: []
      }
      english_phrases: {
        Row: {
          category: string | null
          created_at: string
          difficulty_level: string | null
          example_sentence: string | null
          example_translation: string | null
          id: string
          meaning_explanation: string
          phrase_chinese: string
          phrase_english: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          difficulty_level?: string | null
          example_sentence?: string | null
          example_translation?: string | null
          id?: string
          meaning_explanation: string
          phrase_chinese: string
          phrase_english: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          difficulty_level?: string | null
          example_sentence?: string | null
          example_translation?: string | null
          id?: string
          meaning_explanation?: string
          phrase_chinese?: string
          phrase_english?: string
          updated_at?: string
        }
        Relationships: []
      }
      english_quotes: {
        Row: {
          author: string
          author_translation: string | null
          category: string | null
          created_at: string
          difficulty_level: string | null
          id: string
          quote_text: string
          quote_translation: string
          updated_at: string
        }
        Insert: {
          author: string
          author_translation?: string | null
          category?: string | null
          created_at?: string
          difficulty_level?: string | null
          id?: string
          quote_text: string
          quote_translation: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_translation?: string | null
          category?: string | null
          created_at?: string
          difficulty_level?: string | null
          id?: string
          quote_text?: string
          quote_translation?: string
          updated_at?: string
        }
        Relationships: []
      }
      english_words: {
        Row: {
          created_at: string
          difficulty_level: string | null
          example_sentence: string
          example_translation: string
          frequency_rank: number | null
          id: string
          meaning: string
          pronunciation: string
          updated_at: string
          word: string
          word_type: string | null
        }
        Insert: {
          created_at?: string
          difficulty_level?: string | null
          example_sentence: string
          example_translation: string
          frequency_rank?: number | null
          id?: string
          meaning: string
          pronunciation: string
          updated_at?: string
          word: string
          word_type?: string | null
        }
        Update: {
          created_at?: string
          difficulty_level?: string | null
          example_sentence?: string
          example_translation?: string
          frequency_rank?: number | null
          id?: string
          meaning?: string
          pronunciation?: string
          updated_at?: string
          word?: string
          word_type?: string | null
        }
        Relationships: []
      }
      family_calendar_events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_all_day: boolean
          participants: string[] | null
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_all_day?: boolean
          participants?: string[] | null
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_all_day?: boolean
          participants?: string[] | null
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          payer: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          payer: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          payer?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          address: string | null
          avatar_url: string | null
          birthday: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          sender_name: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_name: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_name?: string
          user_id?: string
        }
        Relationships: []
      }
      family_reminders: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          is_recurring: boolean
          recurring_pattern: string | null
          reminder_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          is_recurring?: boolean
          recurring_pattern?: string | null
          reminder_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          is_recurring?: boolean
          recurring_pattern?: string | null
          reminder_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gomoku_rooms: {
        Row: {
          created_at: string
          game_state: Json
          guest_id: string | null
          host_id: string
          id: string
          room_code: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_state?: Json
          guest_id?: string | null
          host_id: string
          id?: string
          room_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_state?: Json
          guest_id?: string | null
          host_id?: string
          id?: string
          room_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          date: string
          department: string | null
          diagnosis: string | null
          doctor: string | null
          hospital: string | null
          id: string
          next_appointment: string | null
          notes: string | null
          prescribed_medications: string[] | null
          record_type: string
          symptoms: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          department?: string | null
          diagnosis?: string | null
          doctor?: string | null
          hospital?: string | null
          id?: string
          next_appointment?: string | null
          notes?: string | null
          prescribed_medications?: string[] | null
          record_type: string
          symptoms?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          department?: string | null
          diagnosis?: string | null
          doctor?: string | null
          hospital?: string | null
          id?: string
          next_appointment?: string | null
          notes?: string | null
          prescribed_medications?: string[] | null
          record_type?: string
          symptoms?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meniere_records: {
        Row: {
          created_at: string
          data: Json
          diet: string[] | null
          dosage: string | null
          duration: string | null
          id: string
          medications: string[] | null
          note: string | null
          severity: string | null
          sleep: string | null
          stress: string | null
          symptoms: string[] | null
          timestamp: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          diet?: string[] | null
          dosage?: string | null
          duration?: string | null
          id?: string
          medications?: string[] | null
          note?: string | null
          severity?: string | null
          sleep?: string | null
          stress?: string | null
          symptoms?: string[] | null
          timestamp?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          diet?: string[] | null
          dosage?: string | null
          duration?: string | null
          id?: string
          medications?: string[] | null
          note?: string | null
          severity?: string | null
          sleep?: string | null
          stress?: string | null
          symptoms?: string[] | null
          timestamp?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      points_store_items: {
        Row: {
          created_at: string
          icon_url: string | null
          id: string
          is_available: boolean
          item_description: string | null
          item_name: string
          item_type: string
          price_points: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url?: string | null
          id?: string
          is_available?: boolean
          item_description?: string | null
          item_name: string
          item_type: string
          price_points: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url?: string | null
          id?: string
          is_available?: boolean
          item_description?: string | null
          item_name?: string
          item_type?: string
          price_points?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          contact_info: string | null
          content: string
          created_at: string
          feedback_type: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_info?: string | null
          content: string
          created_at?: string
          feedback_type?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_info?: string | null
          content?: string
          created_at?: string
          feedback_type?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_item_inventory: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_manual: {
        Row: {
          content: string
          created_at: string
          icon: string | null
          id: string
          order_index: number | null
          section: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          icon?: string | null
          id?: string
          order_index?: number | null
          section: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          icon?: string | null
          id?: string
          order_index?: number | null
          section?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_medications: {
        Row: {
          created_at: string
          frequency: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          checkin_streak: number
          created_at: string
          id: string
          last_checkin_date: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_streak?: number
          created_at?: string
          id?: string
          last_checkin_date?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_streak?: number
          created_at?: string
          id?: string
          last_checkin_date?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          age: number | null
          allergies: string[] | null
          birthday: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          family_medical_history: string[] | null
          gender: string | null
          height: number | null
          id: string
          last_birthday_wish_year: number | null
          medical_history: string[] | null
          preferred_language: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          birthday?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_medical_history?: string[] | null
          gender?: string | null
          height?: number | null
          id?: string
          last_birthday_wish_year?: number | null
          medical_history?: string[] | null
          preferred_language?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          birthday?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_medical_history?: string[] | null
          gender?: string | null
          height?: number | null
          id?: string
          last_birthday_wish_year?: number | null
          medical_history?: string[] | null
          preferred_language?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          is_active: boolean
          item_id: string
          points_spent: number
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          item_id: string
          points_spent: number
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          item_id?: string
          points_spent?: number
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "points_store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_records: {
        Row: {
          created_at: string
          duration: number
          expires_at: string
          file_path: string | null
          file_size: number | null
          id: string
          note: string | null
          title: string
          transcription: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number
          expires_at?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          note?: string | null
          title?: string
          transcription?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          expires_at?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          note?: string | null
          title?: string
          transcription?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user_points: {
        Args: {
          description?: string
          points_change: number
          target_user_id: string
          transaction_type: string
        }
        Returns: boolean
      }
      delete_expired_voice_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_effective_user_points: {
        Args: { check_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_suspended: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
