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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      certificates: {
        Row: {
          enrollment_id: string
          id: string
          issued_at: string
          total_hours: number
          verification_code: string
        }
        Insert: {
          enrollment_id: string
          id?: string
          issued_at?: string
          total_hours: number
          verification_code?: string
        }
        Update: {
          enrollment_id?: string
          id?: string
          issued_at?: string
          total_hours?: number
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "enrollment_progress"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content_ref: string
          id: string
          published_at: string
          slug: string
          summary: string | null
          title: string
          total_duration_minutes: number
          total_sections: number
          version: number
        }
        Insert: {
          content_ref: string
          id?: string
          published_at?: string
          slug: string
          summary?: string | null
          title: string
          total_duration_minutes?: number
          total_sections?: number
          version: number
        }
        Update: {
          content_ref?: string
          id?: string
          published_at?: string
          slug?: string
          summary?: string | null
          title?: string
          total_duration_minutes?: number
          total_sections?: number
          version?: number
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_slug: string
          course_version: number
          enrolled_at: string
          id: string
          organization_id: string
          profile_id: string
        }
        Insert: {
          course_slug: string
          course_version: number
          enrolled_at?: string
          id?: string
          organization_id: string
          profile_id: string
        }
        Update: {
          course_slug?: string
          course_version?: number
          enrolled_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_slug_course_version_fkey"
            columns: ["course_slug", "course_version"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["slug", "version"]
          },
          {
            foreignKeyName: "enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["membership_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["membership_role"]
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["membership_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["membership_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          id: string
          license_ends_on: string | null
          license_starts_on: string
          name: string
          seats_total: number
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          id?: string
          license_ends_on?: string | null
          license_starts_on?: string
          name: string
          seats_total: number
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          id?: string
          license_ends_on?: string | null
          license_starts_on?: string
          name?: string
          seats_total?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferred_locale: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          preferred_locale?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferred_locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          enrollment_id: string
          id: string
          passed: boolean
          score: number
          section_id: string
          submitted_at: string
        }
        Insert: {
          answers: Json
          attempt_number: number
          enrollment_id: string
          id?: string
          passed: boolean
          score: number
          section_id: string
          submitted_at?: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          enrollment_id?: string
          id?: string
          passed?: boolean
          score?: number
          section_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollment_progress"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      section_progress: {
        Row: {
          completed_at: string | null
          duration_minutes: number
          enrollment_id: string
          id: string
          percent: number
          section_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["section_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          duration_minutes?: number
          enrollment_id: string
          id?: string
          percent?: number
          section_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["section_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          duration_minutes?: number
          enrollment_id?: string
          id?: string
          percent?: number
          section_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["section_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollment_progress"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "section_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      video_assets: {
        Row: {
          captions: Json
          created_at: string
          duration_seconds: number | null
          logical_id: string
          playback_id: string
          provider: string
          provider_asset_id: string
        }
        Insert: {
          captions?: Json
          created_at?: string
          duration_seconds?: number | null
          logical_id: string
          playback_id: string
          provider?: string
          provider_asset_id: string
        }
        Update: {
          captions?: Json
          created_at?: string
          duration_seconds?: number | null
          logical_id?: string
          playback_id?: string
          provider?: string
          provider_asset_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      enrollment_progress: {
        Row: {
          completed_minutes: number | null
          completed_sections: number | null
          course_slug: string | null
          course_version: number | null
          enrollment_id: string | null
          organization_id: string | null
          percent_complete: number | null
          profile_id: string | null
          total_sections: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_slug_course_version_fkey"
            columns: ["course_slug", "course_version"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["slug", "version"]
          },
          {
            foreignKeyName: "enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_pending_invitations: {
        Args: { target_email: string; target_profile_id: string }
        Returns: undefined
      }
      current_role_in: {
        Args: { target_org_id: string }
        Returns: Database["public"]["Enums"]["membership_role"]
      }
      is_member_of: { Args: { target_org_id: string }; Returns: boolean }
      verify_certificate: {
        Args: { code: string }
        Returns: {
          course_title: string
          issued_at: string
          teacher_name: string
          total_hours: number
          verification_code: string
        }[]
      }
    }
    Enums: {
      membership_role: "TEACHER" | "COORDINATOR" | "ADMIN"
      section_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      membership_role: ["TEACHER", "COORDINATOR", "ADMIN"],
      section_status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
    },
  },
} as const
