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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_reviews: {
        Row: {
          appointment_id: string
          comment: string
          id: string
          negative_items: string[]
          positive_items: string[]
          rating: number
          released_at: string | null
          reviewee_id: string
          reviewer_id: string
          submitted_at: string
        }
        Insert: {
          appointment_id: string
          comment?: string
          id?: string
          negative_items?: string[]
          positive_items?: string[]
          rating: number
          released_at?: string | null
          reviewee_id: string
          reviewer_id: string
          submitted_at?: string
        }
        Update: {
          appointment_id?: string
          comment?: string
          id?: string
          negative_items?: string[]
          positive_items?: string[]
          rating?: number
          released_at?: string | null
          reviewee_id?: string
          reviewer_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reviews_appointment_id_reviewer_id_fkey"
            columns: ["appointment_id", "reviewer_id"]
            isOneToOne: true
            referencedRelation: "completion_confirmations"
            referencedColumns: ["appointment_id", "user_id"]
          },
          {
            foreignKeyName: "appointment_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          ends_at: string
          guest_id: string
          host_id: string
          id: string
          post_id: string
          public_location: string
          request_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          ends_at: string
          guest_id: string
          host_id: string
          id?: string
          post_id: string
          public_location: string
          request_id: string
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          ends_at?: string
          guest_id?: string
          host_id?: string
          id?: string
          post_id?: string
          public_location?: string
          request_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_request_id_post_id_host_id_guest_id_fkey"
            columns: ["request_id", "post_id", "host_id", "guest_id"]
            isOneToOne: false
            referencedRelation: "join_requests"
            referencedColumns: ["id", "post_id", "host_id", "requester_id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          sort_order: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          room_id: string
          sender_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind?: string
          room_id: string
          sender_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          room_id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "join_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_confirmations: {
        Row: {
          appointment_id: string
          confirmed_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          confirmed_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          confirmed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_confirmations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_confirmations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string
          ends_on: string
          external_id: string | null
          fetched_at: string | null
          id: string
          image_url: string | null
          kind: string
          location: string
          source_name: string | null
          source_type: string
          source_url: string | null
          starts_on: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          ends_on: string
          external_id?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          kind: string
          location?: string
          source_name?: string | null
          source_type: string
          source_url?: string | null
          starts_on: string
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          ends_on?: string
          external_id?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          location?: string
          source_name?: string | null
          source_type?: string
          source_url?: string | null
          starts_on?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorite_friends: {
        Row: {
          notify_new_posts: boolean
          owner_id: string
          saved_at: string
          target_id: string
        }
        Insert: {
          notify_new_posts?: boolean
          owner_id: string
          saved_at?: string
          target_id: string
        }
        Update: {
          notify_new_posts?: boolean
          owner_id?: string
          saved_at?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_friends_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_friends_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          id: string
          post_id: string
          received_at: string
          recipient_id: string
          sender_id: string
          status: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          received_at?: string
          recipient_id: string
          sender_id: string
          status?: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          received_at?: string
          recipient_id?: string
          sender_id?: string
          status?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_post_id_sender_id_fkey"
            columns: ["post_id", "sender_id"]
            isOneToOne: false
            referencedRelation: "meetup_posts"
            referencedColumns: ["id", "author_id"]
          },
          {
            foreignKeyName: "invitations_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          agreed_revision: number | null
          cancellation_reason: string | null
          created_at: string
          host_id: string
          id: string
          message: string
          post_id: string
          public_condition_snapshot: Json
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agreed_revision?: number | null
          cancellation_reason?: string | null
          created_at?: string
          host_id: string
          id?: string
          message: string
          post_id: string
          public_condition_snapshot?: Json
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agreed_revision?: number | null
          cancellation_reason?: string | null
          created_at?: string
          host_id?: string
          id?: string
          message?: string
          post_id?: string
          public_condition_snapshot?: Json
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_post_id_host_id_fkey"
            columns: ["post_id", "host_id"]
            isOneToOne: false
            referencedRelation: "meetup_posts"
            referencedColumns: ["id", "author_id"]
          },
          {
            foreignKeyName: "join_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetup_post_locations: {
        Row: {
          post_id: string
          secret_location: string
          updated_at: string
        }
        Insert: {
          post_id: string
          secret_location: string
          updated_at?: string
        }
        Update: {
          post_id?: string
          secret_location?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_post_locations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "meetup_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      meetup_posts: {
        Row: {
          author_id: string
          category_id: string
          closed_reason: string | null
          companion_type: string
          created_at: string
          description: string
          ends_at: string
          event_id: string | null
          id: string
          image_url: string | null
          partner_gender: string
          partner_preferences: string
          pro_details: Json | null
          public_location: string
          recruitment_ends_at: string
          region: string
          revision: number
          starts_at: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id: string
          closed_reason?: string | null
          companion_type?: string
          created_at?: string
          description?: string
          ends_at: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          partner_gender?: string
          partner_preferences?: string
          pro_details?: Json | null
          public_location: string
          recruitment_ends_at: string
          region?: string
          revision?: number
          starts_at: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: string
          closed_reason?: string | null
          companion_type?: string
          created_at?: string
          description?: string
          ends_at?: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          partner_gender?: string
          partner_preferences?: string
          pro_details?: Json | null
          public_location?: string
          recruitment_ends_at?: string
          region?: string
          revision?: number
          starts_at?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetup_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetup_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          stranger_invitations: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          stranger_invitations?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          stranger_invitations?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          created_at: string
          description: string
          id: string
          invitation_id: string | null
          post_id: string | null
          read_at: string | null
          recipient_id: string
          review_id: string | null
          room_id: string | null
          title: string
          type: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          description?: string
          id?: string
          invitation_id?: string | null
          post_id?: string | null
          read_at?: string | null
          recipient_id: string
          review_id?: string | null
          room_id?: string | null
          title: string
          type: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          description?: string
          id?: string
          invitation_id?: string | null
          post_id?: string | null
          read_at?: string | null
          recipient_id?: string
          review_id?: string | null
          room_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "meetup_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "appointment_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      private_profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          gender: string
          join_route: string | null
          real_name: string | null
          referral_code: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
          user_id: string
          work_email: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          gender?: string
          join_route?: string | null
          real_name?: string | null
          referral_code?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          user_id: string
          work_email?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          gender?: string
          join_route?: string | null
          real_name?: string | null
          referral_code?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          user_id?: string
          work_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_group: string
          avatar_url: string | null
          bio: string
          created_at: string
          deleted_at: string | null
          display_name: string
          hobbies: string[]
          id: string
          is_kyc_verified: boolean
          is_phone_verified: boolean
          is_pro_host: boolean
          neighborhood: string
          sugar_content: number
          traits: string[]
          updated_at: string
        }
        Insert: {
          age_group?: string
          avatar_url?: string | null
          bio?: string
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          hobbies?: string[]
          id: string
          is_kyc_verified?: boolean
          is_phone_verified?: boolean
          is_pro_host?: boolean
          neighborhood?: string
          sugar_content?: number
          traits?: string[]
          updated_at?: string
        }
        Update: {
          age_group?: string
          avatar_url?: string | null
          bio?: string
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          hobbies?: string[]
          id?: string
          is_kyc_verified?: boolean
          is_phone_verified?: boolean
          is_pro_host?: boolean
          neighborhood?: string
          sugar_content?: number
          traits?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      schedule_proposals: {
        Row: {
          appointment_id: string
          created_at: string
          ends_at: string
          id: string
          proposed_location: string
          proposer_id: string
          responded_at: string | null
          starts_at: string
          status: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          ends_at: string
          id?: string
          proposed_location: string
          proposer_id: string
          responded_at?: string | null
          starts_at: string
          status?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          proposed_location?: string
          proposer_id?: string
          responded_at?: string | null
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_proposals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          created_at: string
          details: string
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_command: {
        Args: { p_action: string; p_actor: string; p_data?: Json }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

