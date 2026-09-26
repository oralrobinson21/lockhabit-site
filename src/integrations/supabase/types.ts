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
      checkin_offer_claims: {
        Row: { session_token: string; claimed_at: string; last_seen_at: string };
        Insert: { session_token: string; claimed_at?: string; last_seen_at?: string };
        Update: { session_token?: string; claimed_at?: string; last_seen_at?: string };
        Relationships: [];
      };
      journal_comments: {
        Row: {
          id: string;
          post_id: string;
          author_user_id: string | null;
          author_name: string;
          body: string;
          status: string;
          created_at: string;
          moderated_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_user_id?: string | null;
          author_name: string;
          body: string;
          status?: string;
          created_at?: string;
          moderated_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_user_id?: string | null;
          author_name?: string;
          body?: string;
          status?: string;
          created_at?: string;
          moderated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "journal_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "journal_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      journal_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          category: string;
          status: string;
          body: Json;
          author: string;
          reviewed_at: string | null;
          reading_time_minutes: number | null;
          related_product_slugs: string[];
          seo_title: string | null;
          seo_description: string | null;
          hero_image_url: string | null;
          hero_image_alt: string | null;
          reference_items: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string;
          category: string;
          status?: string;
          body?: Json;
          author?: string;
          reviewed_at?: string | null;
          reading_time_minutes?: number | null;
          related_product_slugs?: string[];
          seo_title?: string | null;
          seo_description?: string | null;
          hero_image_url?: string | null;
          hero_image_alt?: string | null;
          reference_items?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          category?: string;
          status?: string;
          body?: Json;
          author?: string;
          reviewed_at?: string | null;
          reading_time_minutes?: number | null;
          related_product_slugs?: string[];
          seo_title?: string | null;
          seo_description?: string | null;
          hero_image_url?: string | null;
          hero_image_alt?: string | null;
          reference_items?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      creator_attributions: {
        Row: {
          attribution_token: string | null
          checkout_session_id: string | null
          created_at: string
          creator_id: string
          currency: string
          id: string
          order_number: number | null
          paid_at: string
          paid_merchandise_cents: number
          payment_intent_id: string | null
        }
        Insert: {
          attribution_token?: string | null
          checkout_session_id?: string | null
          created_at?: string
          creator_id: string
          currency?: string
          id?: string
          order_number?: number | null
          paid_at: string
          paid_merchandise_cents: number
          payment_intent_id?: string | null
        }
        Update: {
          attribution_token?: string | null
          checkout_session_id?: string | null
          created_at?: string
          creator_id?: string
          currency?: string
          id?: string
          order_number?: number | null
          paid_at?: string
          paid_merchandise_cents?: number
          payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_attributions_attribution_token_fkey"
            columns: ["attribution_token"]
            isOneToOne: false
            referencedRelation: "creator_referral_clicks"
            referencedColumns: ["attribution_token"]
          },
          {
            foreignKeyName: "creator_attributions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_commission_ledger: {
        Row: {
          amount_cents: number
          attribution_id: string | null
          available_at: string | null
          created_at: string
          creator_id: string
          currency: string
          entry_type: string
          id: string
          idempotency_key: string
          note: string | null
          status: string
          stripe_event_id: string | null
        }
        Insert: {
          amount_cents: number
          attribution_id?: string | null
          available_at?: string | null
          created_at?: string
          creator_id: string
          currency?: string
          entry_type: string
          id?: string
          idempotency_key: string
          note?: string | null
          status: string
          stripe_event_id?: string | null
        }
        Update: {
          amount_cents?: number
          attribution_id?: string | null
          available_at?: string | null
          created_at?: string
          creator_id?: string
          currency?: string
          entry_type?: string
          id?: string
          idempotency_key?: string
          note?: string | null
          status?: string
          stripe_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_commission_ledger_attribution_id_fkey"
            columns: ["attribution_id"]
            isOneToOne: false
            referencedRelation: "creator_attributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_commission_ledger_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_outreach: {
        Row: {
          contact: string | null
          created_at: string
          creator_id: string | null
          follower_count: number | null
          id: string
          last_contacted_at: string | null
          name_or_brand: string
          niche: string | null
          notes: string | null
          platform: string | null
          profile_url: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          creator_id?: string | null
          follower_count?: number | null
          id?: string
          last_contacted_at?: string | null
          name_or_brand: string
          niche?: string | null
          notes?: string | null
          platform?: string | null
          profile_url?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          creator_id?: string | null
          follower_count?: number | null
          id?: string
          last_contacted_at?: string | null
          name_or_brand?: string
          niche?: string | null
          notes?: string | null
          platform?: string | null
          profile_url?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_outreach_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payout_requests: {
        Row: {
          amount_cents: number
          creator_id: string
          currency: string
          id: string
          owner_note: string | null
          paid_at: string | null
          requested_at: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          creator_id: string
          currency?: string
          id?: string
          owner_note?: string | null
          paid_at?: string | null
          requested_at?: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          creator_id?: string
          currency?: string
          id?: string
          owner_note?: string | null
          paid_at?: string | null
          requested_at?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_payout_requests_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          agreement_version: string | null
          activated_at: string | null
          agreement_accepted_at: string | null
          auth_user_id: string | null
          commission_bps: number
          created_at: string
          disclosure_acknowledged_at: string | null
          display_name: string
          email: string
          id: string
          invited_at: string | null
          payout_status: string
          referral_code: string
          referral_slug: string
          reset_requested_at: string | null
          status: string
          tax_status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          agreement_version?: string | null
          activated_at?: string | null
          agreement_accepted_at?: string | null
          auth_user_id?: string | null
          commission_bps?: number
          created_at?: string
          disclosure_acknowledged_at?: string | null
          display_name: string
          email: string
          id?: string
          invited_at?: string | null
          payout_status?: string
          referral_code: string
          referral_slug: string
          reset_requested_at?: string | null
          status?: string
          tax_status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          agreement_version?: string | null
          activated_at?: string | null
          agreement_accepted_at?: string | null
          auth_user_id?: string | null
          commission_bps?: number
          created_at?: string
          disclosure_acknowledged_at?: string | null
          display_name?: string
          email?: string
          id?: string
          invited_at?: string | null
          payout_status?: string
          referral_code?: string
          referral_slug?: string
          reset_requested_at?: string | null
          status?: string
          tax_status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      creator_referral_clicks: {
        Row: {
          attribution_token: string
          created_at: string
          creator_id: string
          expires_at: string
          id: string
          landing_path: string | null
          referrer_host: string | null
          user_agent_hash: string | null
        }
        Insert: {
          attribution_token?: string
          created_at?: string
          creator_id: string
          expires_at?: string
          id?: string
          landing_path?: string | null
          referrer_host?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          attribution_token?: string
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: string
          landing_path?: string | null
          referrer_host?: string | null
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_referral_clicks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      front_desk_message_requests: {
        Row: {
          last_sent_at: string
          sender_key: string
        }
        Insert: {
          last_sent_at?: string
          sender_key: string
        }
        Update: {
          last_sent_at?: string
          sender_key?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent_at: string | null
          created_at: string
          email: string
          id: string
          source: string
          unsubscribe_token: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          consent_at?: string | null
          created_at?: string
          email: string
          id?: string
          source?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          consent_at?: string | null
          created_at?: string
          email?: string
          id?: string
          source?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_admin_login_requests: {
        Row: {
          email: string
          last_sent_at: string
        }
        Insert: {
          email: string
          last_sent_at?: string
        }
        Update: {
          email?: string
          last_sent_at?: string
        }
        Relationships: []
      }
      order_admin_password_challenges: {
        Row: {
          attempts: number
          code_digest: string
          created_at: string
          email: string
          expires_at: string
        }
        Insert: {
          attempts?: number
          code_digest: string
          created_at?: string
          email: string
          expires_at: string
        }
        Update: {
          attempts?: number
          code_digest?: string
          created_at?: string
          email?: string
          expires_at?: string
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
          estimated_delivery_date: string | null
          fulfillment_status: string
          id: string
          items: Json
          order_number: number
          payment_intent_id: string | null
          payment_status: string
          shipped_at: string | null
          shipping_details: Json | null
          stripe_event_id: string | null
          stripe_livemode: boolean | null
          tracking_carrier: string | null
          tracking_notified_at: string | null
          tracking_number: string | null
          tracking_url: string | null
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
          estimated_delivery_date?: string | null
          fulfillment_status?: string
          id?: string
          items?: Json
          order_number?: number
          payment_intent_id?: string | null
          payment_status: string
          shipped_at?: string | null
          shipping_details?: Json | null
          stripe_event_id?: string | null
          stripe_livemode?: boolean | null
          tracking_carrier?: string | null
          tracking_notified_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
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
          estimated_delivery_date?: string | null
          fulfillment_status?: string
          id?: string
          items?: Json
          order_number?: number
          payment_intent_id?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_details?: Json | null
          stripe_event_id?: string | null
          stripe_livemode?: boolean | null
          tracking_carrier?: string | null
          tracking_notified_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
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
      customer_reward_redemptions: {
        Row: {
          created_at: string
          id: string
          redeemed_at: string | null
          redeemed_checkout_session_id: string | null
          source_order_id: string
          source_order_number: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_checkout_session_id?: string | null
          source_order_id: string
          source_order_number: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_checkout_session_id?: string | null
          source_order_id?: string
          source_order_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_reward_redemptions_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reader_profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          display_name: string | null
          email: string
          id: string
          newsletter_opt_in: boolean
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          newsletter_opt_in?: boolean
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          newsletter_opt_in?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bind_returning_customer_reward: {
        Args: { p_checkout_session_id: string; p_redemption_id: string }
        Returns: boolean
      }
      owner_transition_creator_payout: {
        Args: { p_request_id: string; p_action: string; p_note?: string | null };
        Returns: string;
      }
      capture_creator_referral: {
        Args: {
          p_landing_path?: string
          p_referrer_host?: string
          p_slug: string
          p_user_agent_hash?: string
        }
        Returns: {
          attribution_token: string
          expires_at: string
        }[]
      }
      claim_front_desk_message: {
        Args: { p_sender_key: string }
        Returns: boolean
      }
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
      creator_dashboard_summary: {
        Args: never
        Returns: {
          available_cents: number
          clicks: number
          merchandise_cents: number
          paid_cents: number
          paid_orders: number
          pending_cents: number
        }[]
      }
      creator_profile_for_current_user: {
        Args: never
        Returns: {
          agreement_accepted_at: string
          commission_bps: number
          disclosure_acknowledged_at: string
          display_name: string
          email: string
          id: string
          payout_status: string
          referral_code: string
          referral_slug: string
          status: string
          tax_status: string
          username: string
        }[]
      }
      promote_creator_commissions: { Args: never; Returns: number }
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
      redeem_returning_customer_reward: {
        Args: { p_checkout_session_id: string }
        Returns: boolean
      }
      release_returning_customer_reward: {
        Args: { p_checkout_session_id: string }
        Returns: boolean
      }
      release_returning_customer_reward_by_id: {
        Args: { p_redemption_id: string }
        Returns: boolean
      }
      request_creator_payout: {
        Args: { p_amount_cents: number }
        Returns: string
      }
      reserve_returning_customer_reward: {
        Args: { p_order_number: number }
        Returns: {
          ok: boolean
          reason: string
          redemption_id: string
          source_order_id: string
        }[]
      }
      validate_returning_customer_reward: {
        Args: { p_order_number: number }
        Returns: {
          eligible: boolean
          source_order_id: string
        }[]
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
