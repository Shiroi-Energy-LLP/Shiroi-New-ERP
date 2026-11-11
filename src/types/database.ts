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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      lead_activities: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          from_stage: Database["public"]["Enums"]["lead_stage"] | null
          id: string
          lead_id: string
          to_stage: Database["public"]["Enums"]["lead_stage"] | null
          type: Database["public"]["Enums"]["lead_activity_type"]
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          from_stage?: Database["public"]["Enums"]["lead_stage"] | null
          id?: string
          lead_id: string
          to_stage?: Database["public"]["Enums"]["lead_stage"] | null
          type: Database["public"]["Enums"]["lead_activity_type"]
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          from_stage?: Database["public"]["Enums"]["lead_stage"] | null
          id?: string
          lead_id?: string
          to_stage?: Database["public"]["Enums"]["lead_stage"] | null
          type?: Database["public"]["Enums"]["lead_activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          created_at: string
          created_by: string | null
          customer_name: string
          division: Database["public"]["Enums"]["business_division"]
          email: string | null
          id: string
          latitude: number | null
          lead_number: number
          load_requirement_kw: number | null
          longitude: number | null
          lost_at: string | null
          lost_reason: string | null
          monthly_eb_bill: number | null
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          pincode: string | null
          roof_type: Database["public"]["Enums"]["roof_type"] | null
          site_visit_at: string | null
          source: Database["public"]["Enums"]["lead_source"]
          stage: Database["public"]["Enums"]["lead_stage"]
          stage_changed_at: string
          updated_at: string
          won_at: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          customer_name: string
          division: Database["public"]["Enums"]["business_division"]
          email?: string | null
          id?: string
          latitude?: number | null
          lead_number?: never
          load_requirement_kw?: number | null
          longitude?: number | null
          lost_at?: string | null
          lost_reason?: string | null
          monthly_eb_bill?: number | null
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          pincode?: string | null
          roof_type?: Database["public"]["Enums"]["roof_type"] | null
          site_visit_at?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          stage?: Database["public"]["Enums"]["lead_stage"]
          stage_changed_at?: string
          updated_at?: string
          won_at?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string
          division?: Database["public"]["Enums"]["business_division"]
          email?: string | null
          id?: string
          latitude?: number | null
          lead_number?: never
          load_requirement_kw?: number | null
          longitude?: number | null
          lost_at?: string | null
          lost_reason?: string | null
          monthly_eb_bill?: number | null
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          pincode?: string | null
          roof_type?: Database["public"]["Enums"]["roof_type"] | null
          site_visit_at?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          stage?: Database["public"]["Enums"]["lead_stage"]
          stage_changed_at?: string
          updated_at?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crm_dashboard_summary: {
        Args: { p_division: Database["public"]["Enums"]["business_division"] }
        Returns: {
          new_leads: number
          open_leads: number
          overdue_follow_ups: number
          proposals_pending: number
          todays_follow_ups: number
          upcoming_site_visits: number
          won_this_month: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "director"
        | "sales_manager"
        | "sales_engineer"
        | "project_manager"
        | "project_engineer"
        | "purchase"
        | "accounts"
        | "hr"
        | "store_manager"
        | "technician"
      business_division: "rooftop" | "ground_mount"
      lead_activity_type:
        | "created"
        | "note"
        | "call"
        | "whatsapp"
        | "email"
        | "site_visit"
        | "follow_up"
        | "stage_change"
      lead_source:
        | "website"
        | "manual"
        | "whatsapp"
        | "referral"
        | "indiamart"
        | "facebook"
        | "google"
      lead_stage:
        | "new"
        | "contacted"
        | "site_visit"
        | "proposal_sent"
        | "negotiation"
        | "won"
        | "lost"
      roof_type:
        | "rcc"
        | "metal_sheet"
        | "tile"
        | "asbestos"
        | "open_land"
        | "other"
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
    Enums: {
      app_role: [
        "super_admin",
        "director",
        "sales_manager",
        "sales_engineer",
        "project_manager",
        "project_engineer",
        "purchase",
        "accounts",
        "hr",
        "store_manager",
        "technician",
      ],
      business_division: ["rooftop", "ground_mount"],
      lead_activity_type: [
        "created",
        "note",
        "call",
        "whatsapp",
        "email",
        "site_visit",
        "follow_up",
        "stage_change",
      ],
      lead_source: [
        "website",
        "manual",
        "whatsapp",
        "referral",
        "indiamart",
        "facebook",
        "google",
      ],
      lead_stage: [
        "new",
        "contacted",
        "site_visit",
        "proposal_sent",
        "negotiation",
        "won",
        "lost",
      ],
      roof_type: [
        "rcc",
        "metal_sheet",
        "tile",
        "asbestos",
        "open_land",
        "other",
      ],
    },
  },
} as const
