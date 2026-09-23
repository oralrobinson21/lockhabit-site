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
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      order_confirmation_deliveries: {
        Row: {
          attempts: number
          checkout_session_id: string
          claimed_at: string | null
          created_at: string
          last_error: string | null
          order_id: string
          provider_message_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          checkout_session_id: string
          claimed_at?: string | null
          created_at?: string
          last_error?: string | null
          order_id: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          checkout_session_id?: string
          claimed_at?: string | null
          created_at?: string
          last_error?: string | null
          order_id?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_confirmation_deliveries_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["checkout_session_id"]
          },
          {
            foreignKeyName: "order_confirmation_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_shipping: number
          amount_subtotal: number
          amount_tax: number
          amount_total: number
          checkout_session_id: string
          confirmation_sent_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          fulfillment_status: string
          tracking_carrier: string | null
          tracking_number: string | null
          tracking_url: string | null
          shipped_at: string | null
          tracking_notified_at: string | null
          id: string
          items: Json
          order_number: number
          payment_intent_id: string | null
          payment_status: string
          shipping_details: Json | null
          stripe_event_id: string | null
          stripe_livemode: boolean | null
          updated_at: string
        }
        Insert: {
          amount_shipping?: number
          amount_subtotal?: number
          amount_tax?: number
          amount_total: number
          checkout_session_id: string
          confirmation_sent_at?: string | null
          created_at?: string
          currency: string
          customer_email?: string | null
          customer_name?: string | null
          fulfillment_status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          shipped_at?: string | null
          tracking_notified_at?: string | null
          id?: string
          items?: Json
          order_number?: number
          payment_intent_id?: string | null
          payment_status: string
          shipping_details?: Json | null
          stripe_event_id?: string | null
          stripe_livemode?: boolean | null
          updated_at?: string
        }
        Update: {
          amount_shipping?: number
          amount_subtotal?: number
          amount_tax?: number
          amount_total?: number
          checkout_session_id?: string
          confirmation_sent_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          fulfillment_status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          shipped_at?: string | null
          tracking_notified_at?: string | null
          id?: string
          items?: Json
          order_number?: number
          payment_intent_id?: string | null
          payment_status?: string
          shipping_details?: Json | null
          stripe_event_id?: string | null
          stripe_livemode?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          checkout_session_id: string
          created_at: string
          event_id: string
          event_type: string
          outcome: string
          updated_at: string
        }
        Insert: {
          checkout_session_id: string
          created_at?: string
          event_id: string
          event_type: string
          outcome: string
          updated_at?: string
        }
        Update: {
          checkout_session_id?: string
          created_at?: string
          event_id?: string
          event_type?: string
          outcome?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_lockhabit_admin_login: {
        Args: { p_email: string }
        Returns: boolean
      }
      claim_order_confirmation: {
        Args: { p_checkout_session_id: string }
        Returns: {
          order_id: string
        }[]
      }
      record_paid_checkout: {
        Args: {
          p_amount_shipping: number
          p_amount_subtotal: number
          p_amount_tax: number
          p_amount_total: number
          p_checkout_session_id: string
          p_currency: string
          p_customer_email: string
          p_customer_name: string | null
          p_event_id: string
          p_event_type: string
          p_items: Json
          p_payment_intent_id: string | null
          p_shipping_details: Json
        }
        Returns: {
          order_id: string
          order_number: number
        }[]
      }
      record_stripe_checkout_event: {
        Args: {
          p_checkout_session_id: string
          p_event_id: string
          p_event_type: string
          p_outcome: string
        }
        Returns: undefined
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
