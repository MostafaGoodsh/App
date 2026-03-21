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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      active_callouts: {
        Row: {
          callout_text: string
          contact_button_text: string | null
          contact_link: string | null
          created_at: string
          created_by: string | null
          id: string
          personality_description: string | null
          personality_image_url: string | null
          personality_name: string
          personality_title: string | null
          updated_at: string
        }
        Insert: {
          callout_text?: string
          contact_button_text?: string | null
          contact_link?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          personality_description?: string | null
          personality_image_url?: string | null
          personality_name: string
          personality_title?: string | null
          updated_at?: string
        }
        Update: {
          callout_text?: string
          contact_button_text?: string | null
          contact_link?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          personality_description?: string | null
          personality_image_url?: string | null
          personality_name?: string
          personality_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      active_live_streams: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          likes_count: number | null
          started_at: string | null
          stream_key: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          started_at?: string | null
          stream_key: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          started_at?: string | null
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          viewer_count?: number | null
        }
        Relationships: []
      }
      announcement_dismissals: {
        Row: {
          announcement_id: string
          dismissed_at: string
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          dismissed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          dismissed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_dismissals_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "platform_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      anubis_2fa_codes: {
        Row: {
          anubis_user_id: string
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          used_at: string | null
        }
        Insert: {
          anubis_user_id: string
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at?: string
          id?: string
          used_at?: string | null
        }
        Update: {
          anubis_user_id?: string
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anubis_2fa_codes_anubis_user_id_fkey"
            columns: ["anubis_user_id"]
            isOneToOne: false
            referencedRelation: "anubis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      anubis_2fa_settings: {
        Row: {
          anubis_user_id: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          method: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          anubis_user_id: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          method?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          anubis_user_id?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          method?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anubis_2fa_settings_anubis_user_id_fkey"
            columns: ["anubis_user_id"]
            isOneToOne: true
            referencedRelation: "anubis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      anubis_sessions: {
        Row: {
          anubis_user_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          anubis_user_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          anubis_user_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anubis_sessions_anubis_user_id_fkey"
            columns: ["anubis_user_id"]
            isOneToOne: false
            referencedRelation: "anubis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      anubis_settings: {
        Row: {
          created_at: string | null
          currency: string | null
          free_tier_enabled: boolean | null
          id: string
          monthly_price: number | null
          payment_enabled: boolean | null
          quarterly_price: number | null
          updated_at: string | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          free_tier_enabled?: boolean | null
          id?: string
          monthly_price?: number | null
          payment_enabled?: boolean | null
          quarterly_price?: number | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          free_tier_enabled?: boolean | null
          id?: string
          monthly_price?: number | null
          payment_enabled?: boolean | null
          quarterly_price?: number | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      anubis_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          payment_amount: number | null
          payment_currency: string | null
          payment_method: string | null
          payment_reference: string | null
          start_date: string | null
          status: string
          subscription_type: string
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          two_factor_verified_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          start_date?: string | null
          status?: string
          subscription_type?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          two_factor_verified_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          start_date?: string | null
          status?: string
          subscription_type?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          two_factor_verified_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      anubis_users: {
        Row: {
          created_at: string | null
          email: string
          end_date: string | null
          full_name: string | null
          id: string
          last_login: string | null
          password_hash: string
          phone: string | null
          status: string | null
          subscription_type: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          end_date?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          password_hash: string
          phone?: string | null
          status?: string | null
          subscription_type?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          end_date?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          password_hash?: string
          phone?: string | null
          status?: string | null
          subscription_type?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_content: {
        Row: {
          alt_text: string | null
          content_key: string
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          position_order: number | null
          text_content: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          content_key: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position_order?: number | null
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          content_key?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position_order?: number | null
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_typography_settings: {
        Row: {
          created_at: string | null
          font_family: string | null
          font_size: string | null
          font_weight: string | null
          id: string
          is_active: boolean | null
          letter_spacing: string | null
          line_height: string | null
          section_key: string
          section_label: string
          section_label_en: string | null
          text_align: string | null
          text_color: string | null
          title_font_family: string | null
          title_font_size: string | null
          title_font_weight: string | null
          title_text_align: string | null
          title_text_color: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          id?: string
          is_active?: boolean | null
          letter_spacing?: string | null
          line_height?: string | null
          section_key: string
          section_label: string
          section_label_en?: string | null
          text_align?: string | null
          text_color?: string | null
          title_font_family?: string | null
          title_font_size?: string | null
          title_font_weight?: string | null
          title_text_align?: string | null
          title_text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          id?: string
          is_active?: boolean | null
          letter_spacing?: string | null
          line_height?: string | null
          section_key?: string
          section_label?: string
          section_label_en?: string | null
          text_align?: string | null
          text_color?: string | null
          title_font_family?: string | null
          title_font_size?: string | null
          title_font_weight?: string | null
          title_text_align?: string | null
          title_text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_en: string | null
          icon_emoji: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      callout_card_content: {
        Row: {
          contact_button_text: string | null
          contact_link: string | null
          created_at: string
          created_by: string | null
          description: string
          fixed_image_url: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          contact_button_text?: string | null
          contact_link?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          fixed_image_url?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          contact_button_text?: string | null
          contact_link?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          fixed_image_url?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      callout_personalities: {
        Row: {
          category: string | null
          contact_button_text: string | null
          contact_link: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          title: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_button_text?: string | null
          contact_link?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_button_text?: string | null
          contact_link?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversion_settings: {
        Row: {
          created_at: string
          daily_conversion_limit: number
          id: string
          is_active: boolean
          maximum_conversion_points: number
          minimum_conversion_points: number
          points_to_token_rate: number
          token_decimals: number
          token_name: string
          token_symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_conversion_limit?: number
          id?: string
          is_active?: boolean
          maximum_conversion_points?: number
          minimum_conversion_points?: number
          points_to_token_rate?: number
          token_decimals?: number
          token_name?: string
          token_symbol?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_conversion_limit?: number
          id?: string
          is_active?: boolean
          maximum_conversion_points?: number
          minimum_conversion_points?: number
          points_to_token_rate?: number
          token_decimals?: number
          token_name?: string
          token_symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      crypto_addresses: {
        Row: {
          address: string
          created_at: string
          cryptocurrency: string
          id: string
          is_active: boolean | null
          label: string | null
          wallet_id: string
        }
        Insert: {
          address: string
          created_at?: string
          cryptocurrency: string
          id?: string
          is_active?: boolean | null
          label?: string | null
          wallet_id: string
        }
        Update: {
          address?: string
          created_at?: string
          cryptocurrency?: string
          id?: string
          is_active?: boolean | null
          label?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_addresses_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_payment_addresses: {
        Row: {
          address: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          memo_tag: string | null
          network_key: string
          network_name: string
          supported_assets: string | null
          updated_at: string
          warnings: string | null
          warnings_en: string | null
        }
        Insert: {
          address: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          memo_tag?: string | null
          network_key: string
          network_name: string
          supported_assets?: string | null
          updated_at?: string
          warnings?: string | null
          warnings_en?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          memo_tag?: string | null
          network_key?: string
          network_name?: string
          supported_assets?: string | null
          updated_at?: string
          warnings?: string | null
          warnings_en?: string | null
        }
        Relationships: []
      }
      custom_tokens: {
        Row: {
          contract_address: string
          created_at: string | null
          decimals: number | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          network: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          contract_address: string
          created_at?: string | null
          decimals?: number | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          network: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          contract_address?: string
          created_at?: string | null
          decimals?: number | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          network?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_media_content: {
        Row: {
          article_content: string | null
          created_at: string
          description: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string | null
          points_reward: number | null
          text_direction: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          article_content?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url?: string | null
          points_reward?: number | null
          text_direction?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          article_content?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string | null
          points_reward?: number | null
          text_direction?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          points_reward: number | null
          task_key: string
          task_type: string | null
          text_direction: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          task_key: string
          task_type?: string | null
          text_direction?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          task_key?: string
          task_type?: string | null
          text_direction?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_tasks_card_content: {
        Row: {
          background_image_url: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      early_access: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          date_of_birth: string | null
          document_back_url: string | null
          document_front_url: string | null
          full_name: string
          id: string
          is_active: boolean
          national_id: string | null
          relationship: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          national_id?: string | null
          relationship: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          national_id?: string | null
          relationship?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      home_page_cards: {
        Row: {
          background_color: string | null
          background_gradient: string | null
          background_image: string | null
          card_type: string
          content_font_size: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          description_text_align: string | null
          display_order: number | null
          external_widget_url: string | null
          font_family: string | null
          font_size: string | null
          font_weight: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_coming_soon: boolean | null
          page_content: string | null
          page_content_en: string | null
          route_path: string | null
          slug: string
          text_color: string | null
          title: string
          title_en: string | null
          title_font_size: string | null
          title_text_align: string | null
          updated_at: string
          widget_config: Json | null
          widget_type: string | null
        }
        Insert: {
          background_color?: string | null
          background_gradient?: string | null
          background_image?: string | null
          card_type?: string
          content_font_size?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          description_text_align?: string | null
          display_order?: number | null
          external_widget_url?: string | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_coming_soon?: boolean | null
          page_content?: string | null
          page_content_en?: string | null
          route_path?: string | null
          slug: string
          text_color?: string | null
          title: string
          title_en?: string | null
          title_font_size?: string | null
          title_text_align?: string | null
          updated_at?: string
          widget_config?: Json | null
          widget_type?: string | null
        }
        Update: {
          background_color?: string | null
          background_gradient?: string | null
          background_image?: string | null
          card_type?: string
          content_font_size?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          description_text_align?: string | null
          display_order?: number | null
          external_widget_url?: string | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_coming_soon?: boolean | null
          page_content?: string | null
          page_content_en?: string | null
          route_path?: string | null
          slug?: string
          text_color?: string | null
          title?: string
          title_en?: string | null
          title_font_size?: string | null
          title_text_align?: string | null
          updated_at?: string
          widget_config?: Json | null
          widget_type?: string | null
        }
        Relationships: []
      }
      identity_verification: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          document_back_url: string | null
          document_front_url: string | null
          document_number: string | null
          document_type: string | null
          full_name: string | null
          id: string
          nationality: string | null
          phone_number: string | null
          selfie_url: string | null
          status: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          document_number?: string | null
          document_type?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone_number?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_type?: string
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          document_number?: string | null
          document_type?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone_number?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      internal_swaps: {
        Row: {
          created_at: string
          exchange_rate: number
          fee_amount: number
          from_amount: number
          from_token_id: string
          id: string
          status: string
          to_amount: number
          to_token_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange_rate: number
          fee_amount?: number
          from_amount: number
          from_token_id: string
          id?: string
          status?: string
          to_amount: number
          to_token_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number
          fee_amount?: number
          from_amount?: number
          from_token_id?: string
          id?: string
          status?: string
          to_amount?: number
          to_token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_swaps_from_token_id_fkey"
            columns: ["from_token_id"]
            isOneToOne: false
            referencedRelation: "internal_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_swaps_to_token_id_fkey"
            columns: ["to_token_id"]
            isOneToOne: false
            referencedRelation: "internal_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_tokens: {
        Row: {
          created_at: string
          decimals: number
          description: string | null
          exchange_rate_usd: number
          icon_url: string | null
          id: string
          is_active: boolean
          is_base_currency: boolean
          name: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decimals?: number
          description?: string | null
          exchange_rate_usd?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_base_currency?: boolean
          name: string
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decimals?: number
          description?: string | null
          exchange_rate_usd?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_base_currency?: boolean
          name?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_wallet_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          locked_balance: number
          token_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          locked_balance?: number
          token_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          locked_balance?: number
          token_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_wallet_balances_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "internal_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_comments: {
        Row: {
          comment: string
          content_id: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          content_id: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          content_id?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "learning_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content: {
        Row: {
          admin_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          author_name: string | null
          category: string | null
          comments_count: number | null
          content: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          difficulty_level: string | null
          id: string
          is_published: boolean | null
          language: string | null
          likes_count: number | null
          media_type: string | null
          media_urls: string[] | null
          rejected_at: string | null
          submission_notes: string | null
          tags: string[] | null
          text_direction: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_name?: string | null
          category?: string | null
          comments_count?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          likes_count?: number | null
          media_type?: string | null
          media_urls?: string[] | null
          rejected_at?: string | null
          submission_notes?: string | null
          tags?: string[] | null
          text_direction?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_name?: string | null
          category?: string | null
          comments_count?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          likes_count?: number | null
          media_type?: string | null
          media_urls?: string[] | null
          rejected_at?: string | null
          submission_notes?: string | null
          tags?: string[] | null
          text_direction?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_likes: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_pools: {
        Row: {
          apy_percentage: number
          created_at: string
          description: string | null
          description_en: string | null
          fee_percentage: number
          icon_url: string | null
          id: string
          is_active: boolean
          max_deposit: number | null
          min_deposit: number
          name: string
          name_en: string | null
          pool_type: string
          providers_count: number
          slug: string
          token_a_symbol: string | null
          token_b_symbol: string | null
          total_value_locked: number
          total_volume_24h: number
          updated_at: string
        }
        Insert: {
          apy_percentage?: number
          created_at?: string
          description?: string | null
          description_en?: string | null
          fee_percentage?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean
          max_deposit?: number | null
          min_deposit?: number
          name: string
          name_en?: string | null
          pool_type?: string
          providers_count?: number
          slug: string
          token_a_symbol?: string | null
          token_b_symbol?: string | null
          total_value_locked?: number
          total_volume_24h?: number
          updated_at?: string
        }
        Update: {
          apy_percentage?: number
          created_at?: string
          description?: string | null
          description_en?: string | null
          fee_percentage?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean
          max_deposit?: number | null
          min_deposit?: number
          name?: string
          name_en?: string | null
          pool_type?: string
          providers_count?: number
          slug?: string
          token_a_symbol?: string | null
          token_b_symbol?: string | null
          total_value_locked?: number
          total_volume_24h?: number
          updated_at?: string
        }
        Relationships: []
      }
      liquidity_positions: {
        Row: {
          auto_compound_enabled: boolean
          created_at: string
          current_value: number
          deposited_amount: number
          earned_rewards: number
          id: string
          is_staked: boolean
          lp_tokens: number
          pool_id: string
          stake_unlock_at: string | null
          staked_at: string | null
          staking_plan_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_compound_enabled?: boolean
          created_at?: string
          current_value?: number
          deposited_amount?: number
          earned_rewards?: number
          id?: string
          is_staked?: boolean
          lp_tokens?: number
          pool_id: string
          stake_unlock_at?: string | null
          staked_at?: string | null
          staking_plan_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_compound_enabled?: boolean
          created_at?: string
          current_value?: number
          deposited_amount?: number
          earned_rewards?: number
          id?: string
          is_staked?: boolean
          lp_tokens?: number
          pool_id?: string
          stake_unlock_at?: string | null
          staked_at?: string | null
          staking_plan_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_positions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "liquidity_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_transactions: {
        Row: {
          amount: number
          created_at: string
          fee_amount: number
          id: string
          limit_status: string | null
          notes: string | null
          pool_id: string
          position_id: string | null
          price_impact: number | null
          slippage_tolerance: number | null
          source_reference: string | null
          source_type: string | null
          status: string
          transaction_type: string
          trigger_price: number | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          fee_amount?: number
          id?: string
          limit_status?: string | null
          notes?: string | null
          pool_id: string
          position_id?: string | null
          price_impact?: number | null
          slippage_tolerance?: number | null
          source_reference?: string | null
          source_type?: string | null
          status?: string
          transaction_type: string
          trigger_price?: number | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          fee_amount?: number
          id?: string
          limit_status?: string | null
          notes?: string | null
          pool_id?: string
          position_id?: string | null
          price_impact?: number | null
          slippage_tolerance?: number | null
          source_reference?: string | null
          source_type?: string | null
          status?: string
          transaction_type?: string
          trigger_price?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_transactions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "liquidity_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidity_transactions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "liquidity_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_approvals: {
        Row: {
          created_at: string
          description: string | null
          email: string
          follower_count: number | null
          full_name: string
          id: string
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media_links: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          follower_count?: number | null
          full_name: string
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          follower_count?: number | null
          full_name?: string
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_stream_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          stream_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          stream_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_comments_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "active_live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_gifts: {
        Row: {
          created_at: string
          gift_type: string
          gift_value: number
          id: string
          message: string | null
          sender_id: string
          stream_id: string
        }
        Insert: {
          created_at?: string
          gift_type?: string
          gift_value?: number
          id?: string
          message?: string | null
          sender_id: string
          stream_id: string
        }
        Update: {
          created_at?: string
          gift_type?: string
          gift_value?: number
          id?: string
          message?: string | null
          sender_id?: string
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_gifts_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "active_live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_likes: {
        Row: {
          created_at: string | null
          id: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_likes_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "active_live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_views: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          stream_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          stream_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          stream_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_views_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "active_live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          likes_count: number | null
          started_at: string | null
          status: string
          stream_key: string
          thumbnail_url: string | null
          title: string
          total_views: number | null
          updated_at: string | null
          user_id: string
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          likes_count?: number | null
          started_at?: string | null
          status?: string
          stream_key: string
          thumbnail_url?: string | null
          title: string
          total_views?: number | null
          updated_at?: string | null
          user_id: string
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          likes_count?: number | null
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
          viewer_count?: number | null
        }
        Relationships: []
      }
      market_locations: {
        Row: {
          accepts_msra: boolean
          address: string | null
          admin_notes: string | null
          bio: string | null
          cooperation_note: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          location_type: string
          logo_url: string | null
          longitude: number
          name: string
          name_en: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          accepts_msra?: boolean
          address?: string | null
          admin_notes?: string | null
          bio?: string | null
          cooperation_note?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          location_type?: string
          logo_url?: string | null
          longitude: number
          name: string
          name_en?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          accepts_msra?: boolean
          address?: string | null
          admin_notes?: string | null
          bio?: string | null
          cooperation_note?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          location_type?: string
          logo_url?: string | null
          longitude?: number
          name?: string
          name_en?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      market_products: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_id: string
          name: string
          name_en: string | null
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_id: string
          name: string
          name_en?: string | null
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_id?: string
          name?: string
          name_en?: string | null
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_products_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "market_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_sessions: {
        Row: {
          challenge_code: string
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
          verified: boolean | null
          wallet_id: string | null
        }
        Insert: {
          challenge_code: string
          created_at?: string
          expires_at?: string
          id?: string
          session_token: string
          user_id: string
          verified?: boolean | null
          wallet_id?: string | null
        }
        Update: {
          challenge_code?: string
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
          verified?: boolean | null
          wallet_id?: string | null
        }
        Relationships: []
      }
      mining_history: {
        Row: {
          account_strength: number
          amount_mined: number
          created_at: string
          hour_timestamp: string
          id: string
          level_number: number
          mining_rate: number
          user_id: string
        }
        Insert: {
          account_strength: number
          amount_mined: number
          created_at?: string
          hour_timestamp: string
          id?: string
          level_number: number
          mining_rate: number
          user_id: string
        }
        Update: {
          account_strength?: number
          amount_mined?: number
          created_at?: string
          hour_timestamp?: string
          id?: string
          level_number?: number
          mining_rate?: number
          user_id?: string
        }
        Relationships: []
      }
      mining_levels: {
        Row: {
          created_at: string
          id: number
          level_name: string
          level_number: number
          mining_rate_per_hour: number
          required_account_strength: number
          upgrade_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          level_name: string
          level_number: number
          mining_rate_per_hour: number
          required_account_strength: number
          upgrade_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          level_name?: string
          level_number?: number
          mining_rate_per_hour?: number
          required_account_strength?: number
          upgrade_cost?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_admin_notification: boolean | null
          is_read: boolean | null
          message: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_admin_notification?: boolean | null
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_admin_notification?: boolean | null
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          failed_at: string | null
          id: string
          internal_token_id: string | null
          ip_address: unknown
          notes: string | null
          payment_details: Json | null
          payment_method: string
          phone_number: string | null
          provider: string
          provider_reference: string | null
          provider_response: Json | null
          provider_transaction_id: string | null
          status: string
          tokens_credited: number | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          id?: string
          internal_token_id?: string | null
          ip_address?: unknown
          notes?: string | null
          payment_details?: Json | null
          payment_method: string
          phone_number?: string | null
          provider: string
          provider_reference?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          status?: string
          tokens_credited?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          id?: string
          internal_token_id?: string | null
          ip_address?: unknown
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string
          phone_number?: string | null
          provider?: string
          provider_reference?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          status?: string
          tokens_credited?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_internal_token_id_fkey"
            columns: ["internal_token_id"]
            isOneToOne: false
            referencedRelation: "internal_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_deposits: {
        Row: {
          amount: number
          confirmations: number | null
          created_at: string
          cryptocurrency: string
          detected_at: string
          from_address: string
          id: string
          network: string
          processed_at: string | null
          required_confirmations: number | null
          status: string
          to_address: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          confirmations?: number | null
          created_at?: string
          cryptocurrency: string
          detected_at?: string
          from_address: string
          id?: string
          network: string
          processed_at?: string | null
          required_confirmations?: number | null
          status?: string
          to_address: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          confirmations?: number | null
          created_at?: string
          cryptocurrency?: string
          detected_at?: string
          from_address?: string
          id?: string
          network?: string
          processed_at?: string | null
          required_confirmations?: number | null
          status?: string
          to_address?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: []
      }
      personality_development_tasks: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          points_reward: number | null
          text_direction: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          text_direction?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          text_direction?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_announcements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_urgent: boolean
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      point_to_token_conversions: {
        Row: {
          completed_at: string | null
          conversion_rate: number
          created_at: string
          id: string
          points_amount: number
          status: string
          token_amount: number
          token_mint_address: string | null
          transaction_signature: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversion_rate?: number
          created_at?: string
          id?: string
          points_amount: number
          status?: string
          token_amount: number
          token_mint_address?: string | null
          transaction_signature?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversion_rate?: number
          created_at?: string
          id?: string
          points_amount?: number
          status?: string
          token_amount?: number
          token_mint_address?: string | null
          transaction_signature?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pool_auto_routing: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          pool_id: string
          routing_percentage: number
          source_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          pool_id: string
          routing_percentage?: number
          source_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          pool_id?: string
          routing_percentage?: number
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_auto_routing_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "liquidity_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_charity_programs: {
        Row: {
          allocation_percentage: number
          beneficiaries_count: number
          created_at: string
          description: string | null
          description_en: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          pool_id: string
          total_distributed: number
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number
          beneficiaries_count?: number
          created_at?: string
          description?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          pool_id: string
          total_distributed?: number
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number
          beneficiaries_count?: number
          created_at?: string
          description?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          pool_id?: string
          total_distributed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_charity_programs_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "liquidity_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_staking_plans: {
        Row: {
          apy_bonus: number
          created_at: string
          duration_days: number
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number
          name: string
          name_en: string | null
          pool_id: string
          updated_at: string
        }
        Insert: {
          apy_bonus?: number
          created_at?: string
          duration_days: number
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          name: string
          name_en?: string | null
          pool_id: string
          updated_at?: string
        }
        Update: {
          apy_bonus?: number
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          name?: string
          name_en?: string | null
          pool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_staking_plans_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "liquidity_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_customization: {
        Row: {
          background_color: string | null
          background_gradient: string | null
          background_image: string | null
          card_arrangement: Json | null
          content_font_size: string | null
          created_at: string
          external_widgets: Json | null
          font_family: string | null
          font_weight: string | null
          header_font_size: string | null
          id: string
          layout_type: string | null
          profile_visibility: string | null
          show_activity: boolean | null
          show_follow_stats: boolean | null
          show_join_date: boolean | null
          show_social_links: boolean | null
          show_stats: boolean | null
          show_todo_list: boolean | null
          theme_mode: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          background_color?: string | null
          background_gradient?: string | null
          background_image?: string | null
          card_arrangement?: Json | null
          content_font_size?: string | null
          created_at?: string
          external_widgets?: Json | null
          font_family?: string | null
          font_weight?: string | null
          header_font_size?: string | null
          id?: string
          layout_type?: string | null
          profile_visibility?: string | null
          show_activity?: boolean | null
          show_follow_stats?: boolean | null
          show_join_date?: boolean | null
          show_social_links?: boolean | null
          show_stats?: boolean | null
          show_todo_list?: boolean | null
          theme_mode?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          background_color?: string | null
          background_gradient?: string | null
          background_image?: string | null
          card_arrangement?: Json | null
          content_font_size?: string | null
          created_at?: string
          external_widgets?: Json | null
          font_family?: string | null
          font_weight?: string | null
          header_font_size?: string | null
          id?: string
          layout_type?: string | null
          profile_visibility?: string | null
          show_activity?: boolean | null
          show_follow_stats?: boolean | null
          show_join_date?: boolean | null
          show_social_links?: boolean | null
          show_stats?: boolean | null
          show_todo_list?: boolean | null
          theme_mode?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anubis_expires_at: string | null
          anubis_subscription_type: string | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          facebook_url: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          has_access: boolean | null
          has_anubis_access: boolean | null
          has_early_access: boolean | null
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          linkedin_url: string | null
          marital_status: string | null
          phone: string | null
          preferred_language: string | null
          referral_code: string | null
          referral_count: number
          referred_by: string | null
          solana_address: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          anubis_expires_at?: string | null
          anubis_subscription_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          has_access?: boolean | null
          has_anubis_access?: boolean | null
          has_early_access?: boolean | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          marital_status?: string | null
          phone?: string | null
          preferred_language?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          solana_address?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          anubis_expires_at?: string | null
          anubis_subscription_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          has_access?: boolean | null
          has_anubis_access?: boolean | null
          has_early_access?: boolean | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          marital_status?: string | null
          phone?: string | null
          preferred_language?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          solana_address?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles_audit: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string
          fields_accessed: string[] | null
          id: string
          ip_address: unknown
          profile_id: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: unknown
          profile_id: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: unknown
          profile_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_audit_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_pages: {
        Row: {
          admin_notes: string | null
          arabic_image_url: string | null
          arabic_text: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          juz_number: number
          page_number: number
          points_reward: number | null
          surah_name: string
          translation_image_url: string | null
          translation_text: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          arabic_image_url?: string | null
          arabic_text: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          juz_number: number
          page_number: number
          points_reward?: number | null
          surah_name: string
          translation_image_url?: string | null
          translation_text?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          arabic_image_url?: string | null
          arabic_text?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          juz_number?: number
          page_number?: number
          points_reward?: number | null
          surah_name?: string
          translation_image_url?: string | null
          translation_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reels_card_content: {
        Row: {
          background_image_url: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reels_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reels_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          reel_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reel_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reel_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reels_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels_content"
            referencedColumns: ["id"]
          },
        ]
      }
      reels_content: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          display_order: number | null
          duration: number | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          title_en: string | null
          updated_at: string
          video_url: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
          video_url: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
          video_url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reels_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "reels_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reels_likes: {
        Row: {
          created_at: string
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reels_likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels_content"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
          tokens_rewarded: number
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
          tokens_rewarded?: number
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
          tokens_rewarded?: number
        }
        Relationships: []
      }
      roadmap_cards: {
        Row: {
          background_color: string | null
          background_gradient: string | null
          content_font_size: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_en: string | null
          display_order: number | null
          external_widget_url: string | null
          font_family: string | null
          font_size: string | null
          font_weight: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_coming_soon: boolean | null
          page_background: string | null
          page_content: string | null
          page_content_en: string | null
          page_cover_image: string | null
          page_text_color: string | null
          page_title: string | null
          page_title_en: string | null
          sections: Json | null
          slug: string
          title: string
          title_en: string | null
          title_font_size: string | null
          updated_at: string | null
          widget_config: Json | null
          widget_type: string | null
        }
        Insert: {
          background_color?: string | null
          background_gradient?: string | null
          content_font_size?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          external_widget_url?: string | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_coming_soon?: boolean | null
          page_background?: string | null
          page_content?: string | null
          page_content_en?: string | null
          page_cover_image?: string | null
          page_text_color?: string | null
          page_title?: string | null
          page_title_en?: string | null
          sections?: Json | null
          slug: string
          title: string
          title_en?: string | null
          title_font_size?: string | null
          updated_at?: string | null
          widget_config?: Json | null
          widget_type?: string | null
        }
        Update: {
          background_color?: string | null
          background_gradient?: string | null
          content_font_size?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          display_order?: number | null
          external_widget_url?: string | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_coming_soon?: boolean | null
          page_background?: string | null
          page_content?: string | null
          page_content_en?: string | null
          page_cover_image?: string | null
          page_text_color?: string | null
          page_title?: string | null
          page_title_en?: string | null
          sections?: Json | null
          slug?: string
          title?: string
          title_en?: string | null
          title_font_size?: string | null
          updated_at?: string | null
          widget_config?: Json | null
          widget_type?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          admin_response: string | null
          created_at: string
          id: string
          message: string
          priority: string | null
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          completed_at: string
          id: string
          responses: Json
          survey_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          responses: Json
          survey_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          responses?: Json
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          language: string | null
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          questions: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          questions?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_section_introductions: {
        Row: {
          content: string
          content_en: string | null
          created_at: string
          id: string
          is_active: boolean
          section_type: string
          text_direction: string
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          content: string
          content_en?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_type: string
          text_direction?: string
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_en?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_type?: string
          text_direction?: string
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      todo_list_introduction: {
        Row: {
          content: string
          content_en: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          text_direction: string
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          content_en?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          text_direction?: string
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_en?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          text_direction?: string
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          gas_fee: number | null
          id: string
          network: string | null
          reference_id: string | null
          status: string | null
          transaction_hash: string | null
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          gas_fee?: number | null
          id?: string
          network?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_hash?: string | null
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          gas_fee?: number | null
          id?: string
          network?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_hash?: string | null
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_audit: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string
          accessed_by: string
          id: string
          ip_address: unknown
          masked_data: boolean | null
          transaction_id: string
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string
          accessed_by: string
          id?: string
          ip_address?: unknown
          masked_data?: boolean | null
          transaction_id: string
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          id?: string
          ip_address?: unknown
          masked_data?: boolean | null
          transaction_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      trusted_devices: {
        Row: {
          created_at: string
          device_fingerprint: string
          device_name: string | null
          first_seen: string
          id: string
          is_trusted: boolean | null
          last_used: string
          trust_expires_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          first_seen?: string
          id?: string
          is_trusted?: boolean | null
          last_used?: string
          trust_expires_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          first_seen?: string
          id?: string
          is_trusted?: boolean | null
          last_used?: string
          trust_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_task_completions: {
        Row: {
          completed_date: string
          created_at: string
          id: string
          is_one_time_task: boolean | null
          points_earned: number | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          id?: string
          is_one_time_task?: boolean | null
          points_earned?: number | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          id?: string
          is_one_time_task?: boolean | null
          points_earned?: number | null
          task_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_engagement_stats: {
        Row: {
          created_at: string
          current_streak: number | null
          daily_logins: number | null
          id: string
          last_login_date: string | null
          longest_streak: number | null
          monthly_logins: number | null
          profile_completion_score: number | null
          total_comments: number | null
          total_content_views: number | null
          total_likes: number | null
          total_mining_hours: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          weekly_logins: number | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          daily_logins?: number | null
          id?: string
          last_login_date?: string | null
          longest_streak?: number | null
          monthly_logins?: number | null
          profile_completion_score?: number | null
          total_comments?: number | null
          total_content_views?: number | null
          total_likes?: number | null
          total_mining_hours?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          weekly_logins?: number | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          daily_logins?: number | null
          id?: string
          last_login_date?: string | null
          longest_streak?: number | null
          monthly_logins?: number | null
          profile_completion_score?: number | null
          total_comments?: number | null
          total_content_views?: number | null
          total_likes?: number | null
          total_mining_hours?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          weekly_logins?: number | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_media_completions: {
        Row: {
          completed_date: string
          created_at: string
          id: string
          media_id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          id?: string
          media_id: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          id?: string
          media_id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_media_completions_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "daily_media_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mining_profiles: {
        Row: {
          account_strength: number
          created_at: string
          current_level: number
          id: string
          is_mining_active: boolean
          last_mining_update: string
          mining_rate_per_hour: number
          total_mined: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_strength?: number
          created_at?: string
          current_level?: number
          id?: string
          is_mining_active?: boolean
          last_mining_update?: string
          mining_rate_per_hour?: number
          total_mined?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_strength?: number
          created_at?: string
          current_level?: number
          id?: string
          is_mining_active?: boolean
          last_mining_update?: string
          mining_rate_per_hour?: number
          total_mined?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mining_profiles_current_level_fkey"
            columns: ["current_level"]
            isOneToOne: false
            referencedRelation: "mining_levels"
            referencedColumns: ["level_number"]
          },
        ]
      }
      user_personality_completions: {
        Row: {
          completed_date: string
          created_at: string
          id: string
          points_earned: number | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          id?: string
          points_earned?: number | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          id?: string
          points_earned?: number | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_personality_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "personality_development_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points_balance: {
        Row: {
          available_points: number
          converted_points: number
          id: string
          last_updated: string
          total_points: number
          user_id: string
        }
        Insert: {
          available_points?: number
          converted_points?: number
          id?: string
          last_updated?: string
          total_points?: number
          user_id: string
        }
        Update: {
          available_points?: number
          converted_points?: number
          id?: string
          last_updated?: string
          total_points?: number
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string
          id: string
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string
          id?: string
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string
          id?: string
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quran_completions: {
        Row: {
          completed_date: string
          created_at: string
          id: string
          page_id: string
          points_earned: number | null
          reading_time_seconds: number
          user_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          id?: string
          page_id: string
          points_earned?: number | null
          reading_time_seconds: number
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          id?: string
          page_id?: string
          points_earned?: number | null
          reading_time_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quran_completions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "quran_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_todo_items: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          priority: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          payment_amount: number | null
          payment_currency: string | null
          payment_method: string | null
          payment_reference: string | null
          start_date: string | null
          status: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          start_date?: string | null
          status?: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          start_date?: string | null
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_access_audit: {
        Row: {
          access_type: string
          accessed_at: string
          block_reason: string | null
          blocked: boolean | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          mfa_verified: boolean | null
          risk_score: number | null
          user_agent: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          block_reason?: string | null
          blocked?: boolean | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          mfa_verified?: boolean | null
          risk_score?: number | null
          user_agent?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          block_reason?: string | null
          blocked?: boolean | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          mfa_verified?: boolean | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: []
      }
      wallet_security: {
        Row: {
          access_count: number | null
          created_at: string | null
          encryption_version: number | null
          id: string
          last_accessed: string | null
          mnemonic_encrypted: string | null
          private_key_encrypted: string | null
          wallet_id: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          encryption_version?: number | null
          id?: string
          last_accessed?: string | null
          mnemonic_encrypted?: string | null
          private_key_encrypted?: string | null
          wallet_id: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          encryption_version?: number | null
          id?: string
          last_accessed?: string | null
          mnemonic_encrypted?: string | null
          private_key_encrypted?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_security_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_security_settings: {
        Row: {
          auto_lock_minutes: number | null
          created_at: string
          id: string
          ip_whitelist: string[] | null
          max_daily_access: number | null
          mfa_required: boolean | null
          require_device_verification: boolean | null
          updated_at: string
          wallet_id: string
        }
        Insert: {
          auto_lock_minutes?: number | null
          created_at?: string
          id?: string
          ip_whitelist?: string[] | null
          max_daily_access?: number | null
          mfa_required?: boolean | null
          require_device_verification?: boolean | null
          updated_at?: string
          wallet_id: string
        }
        Update: {
          auto_lock_minutes?: number | null
          created_at?: string
          id?: string
          ip_whitelist?: string[] | null
          max_daily_access?: number | null
          mfa_required?: boolean | null
          require_device_verification?: boolean | null
          updated_at?: string
          wallet_id?: string
        }
        Relationships: []
      }
      wallet_tokens: {
        Row: {
          balance: number | null
          contract_address: string | null
          created_at: string | null
          cryptocurrency: string | null
          id: string
          is_active: boolean | null
          network: string
          token_id: string | null
          wallet_id: string
        }
        Insert: {
          balance?: number | null
          contract_address?: string | null
          created_at?: string | null
          cryptocurrency?: string | null
          id?: string
          is_active?: boolean | null
          network: string
          token_id?: string | null
          wallet_id: string
        }
        Update: {
          balance?: number | null
          contract_address?: string | null
          created_at?: string | null
          cryptocurrency?: string | null
          id?: string
          is_active?: boolean | null
          network?: string
          token_id?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wallet_tokens_wallet_id"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_tokens_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "custom_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string
          cryptocurrency: string | null
          id: string
          is_active: boolean | null
          is_multi_network: boolean | null
          mnemonic_encrypted: string | null
          networks: string[] | null
          private_key_encrypted: string | null
          public_key: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_name: string | null
          wallet_type: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string
          cryptocurrency?: string | null
          id?: string
          is_active?: boolean | null
          is_multi_network?: boolean | null
          mnemonic_encrypted?: string | null
          networks?: string[] | null
          private_key_encrypted?: string | null
          public_key?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_name?: string | null
          wallet_type?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string
          cryptocurrency?: string | null
          id?: string
          is_active?: boolean | null
          is_multi_network?: boolean | null
          mnemonic_encrypted?: string | null
          networks?: string[] | null
          private_key_encrypted?: string | null
          public_key?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_name?: string | null
          wallet_type?: string | null
        }
        Relationships: []
      }
      wheel_outer_segments: {
        Row: {
          color: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          label: string
          label_en: string | null
          probability: number
          reward_value: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          label: string
          label_en?: string | null
          probability?: number
          reward_value?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          label?: string
          label_en?: string | null
          probability?: number
          reward_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      wheel_segments: {
        Row: {
          color: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          label: string
          label_en: string | null
          probability: number
          reward_description: string | null
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          label: string
          label_en?: string | null
          probability?: number
          reward_description?: string | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          label?: string
          label_en?: string | null
          probability?: number
          reward_description?: string | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      wheel_settings: {
        Row: {
          background_color: string | null
          badge_font_size: string | null
          badge_inner_bg: string | null
          badge_inner_border_color: string | null
          badge_inner_font_size: string | null
          badge_inner_label: string | null
          badge_inner_text_color: string | null
          badge_inner_top: string | null
          badge_middle_bg: string | null
          badge_middle_border_color: string | null
          badge_middle_font_size: string | null
          badge_middle_label: string | null
          badge_middle_text_color: string | null
          badge_middle_top: string | null
          badge_outer_bg: string | null
          badge_outer_border_color: string | null
          badge_outer_font_size: string | null
          badge_outer_label: string | null
          badge_outer_text_color: string | null
          badge_outer_top: string | null
          center_bg_color: string | null
          center_icon: string | null
          center_size: number | null
          center_text_color: string | null
          created_at: string
          description: string | null
          description_en: string | null
          divider_color: string | null
          free_spins_per_day: number
          id: string
          inner_ring_bg_image: string | null
          inner_ring_stroke_color: string | null
          intro_text: string | null
          intro_text_en: string | null
          is_active: boolean
          is_visible: boolean
          middle_ring_bg_image: string | null
          middle_ring_stroke_color: string | null
          note_text: string | null
          note_text_en: string | null
          outer_ring_bg_image: string | null
          outer_ring_stroke_color: string | null
          pointer_color: string | null
          ring_inner_ratio: number | null
          ring_middle_ratio: number | null
          ring_outer_ratio: number | null
          segment_font_family: string | null
          segment_font_size: string | null
          spin_cost_xp: number
          title: string
          title_en: string | null
          updated_at: string
          wheel_background_image: string | null
          wheel_border_color: string | null
          wheel_border_width: number | null
        }
        Insert: {
          background_color?: string | null
          badge_font_size?: string | null
          badge_inner_bg?: string | null
          badge_inner_border_color?: string | null
          badge_inner_font_size?: string | null
          badge_inner_label?: string | null
          badge_inner_text_color?: string | null
          badge_inner_top?: string | null
          badge_middle_bg?: string | null
          badge_middle_border_color?: string | null
          badge_middle_font_size?: string | null
          badge_middle_label?: string | null
          badge_middle_text_color?: string | null
          badge_middle_top?: string | null
          badge_outer_bg?: string | null
          badge_outer_border_color?: string | null
          badge_outer_font_size?: string | null
          badge_outer_label?: string | null
          badge_outer_text_color?: string | null
          badge_outer_top?: string | null
          center_bg_color?: string | null
          center_icon?: string | null
          center_size?: number | null
          center_text_color?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          divider_color?: string | null
          free_spins_per_day?: number
          id?: string
          inner_ring_bg_image?: string | null
          inner_ring_stroke_color?: string | null
          intro_text?: string | null
          intro_text_en?: string | null
          is_active?: boolean
          is_visible?: boolean
          middle_ring_bg_image?: string | null
          middle_ring_stroke_color?: string | null
          note_text?: string | null
          note_text_en?: string | null
          outer_ring_bg_image?: string | null
          outer_ring_stroke_color?: string | null
          pointer_color?: string | null
          ring_inner_ratio?: number | null
          ring_middle_ratio?: number | null
          ring_outer_ratio?: number | null
          segment_font_family?: string | null
          segment_font_size?: string | null
          spin_cost_xp?: number
          title?: string
          title_en?: string | null
          updated_at?: string
          wheel_background_image?: string | null
          wheel_border_color?: string | null
          wheel_border_width?: number | null
        }
        Update: {
          background_color?: string | null
          badge_font_size?: string | null
          badge_inner_bg?: string | null
          badge_inner_border_color?: string | null
          badge_inner_font_size?: string | null
          badge_inner_label?: string | null
          badge_inner_text_color?: string | null
          badge_inner_top?: string | null
          badge_middle_bg?: string | null
          badge_middle_border_color?: string | null
          badge_middle_font_size?: string | null
          badge_middle_label?: string | null
          badge_middle_text_color?: string | null
          badge_middle_top?: string | null
          badge_outer_bg?: string | null
          badge_outer_border_color?: string | null
          badge_outer_font_size?: string | null
          badge_outer_label?: string | null
          badge_outer_text_color?: string | null
          badge_outer_top?: string | null
          center_bg_color?: string | null
          center_icon?: string | null
          center_size?: number | null
          center_text_color?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          divider_color?: string | null
          free_spins_per_day?: number
          id?: string
          inner_ring_bg_image?: string | null
          inner_ring_stroke_color?: string | null
          intro_text?: string | null
          intro_text_en?: string | null
          is_active?: boolean
          is_visible?: boolean
          middle_ring_bg_image?: string | null
          middle_ring_stroke_color?: string | null
          note_text?: string | null
          note_text_en?: string | null
          outer_ring_bg_image?: string | null
          outer_ring_stroke_color?: string | null
          pointer_color?: string | null
          ring_inner_ratio?: number | null
          ring_middle_ratio?: number | null
          ring_outer_ratio?: number | null
          segment_font_family?: string | null
          segment_font_size?: string | null
          spin_cost_xp?: number
          title?: string
          title_en?: string | null
          updated_at?: string
          wheel_background_image?: string | null
          wheel_border_color?: string | null
          wheel_border_width?: number | null
        }
        Relationships: []
      }
      wheel_spin_history: {
        Row: {
          created_at: string
          id: string
          reward_type: string
          reward_value: number
          segment_id: string | null
          spin_date: string
          user_id: string
          xp_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          reward_type: string
          reward_value?: number
          segment_id?: string | null
          spin_date?: string
          user_id: string
          xp_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          reward_type?: string
          reward_value?: number
          segment_id?: string | null
          spin_date?: string
          user_id?: string
          xp_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "wheel_spin_history_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "wheel_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_upgrade_segments: {
        Row: {
          color: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          label: string
          label_en: string | null
          probability: number
          reward_description: string | null
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          label: string
          label_en?: string | null
          probability?: number
          reward_description?: string | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          label?: string
          label_en?: string | null
          probability?: number
          reward_description?: string | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          created_at: string
          id: string
          internal_amount: number
          internal_token_id: string
          processed_at: string | null
          status: string
          target_address: string
          target_amount: number
          target_token: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_amount: number
          internal_token_id: string
          processed_at?: string | null
          status?: string
          target_address: string
          target_amount: number
          target_token: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_amount?: number
          internal_token_id?: string
          processed_at?: string | null
          status?: string
          target_address?: string
          target_amount?: number
          target_token?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_internal_token_id_fkey"
            columns: ["internal_token_id"]
            isOneToOne: false
            referencedRelation: "internal_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_content: {
        Args: { p_admin_notes?: string; p_content_id: string }
        Returns: boolean
      }
      calculate_account_strength: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_user_points: { Args: { p_user_id: string }; Returns: number }
      check_anubis_subscription_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_early_access: { Args: { _user_id: string }; Returns: boolean }
      cleanup_expired_2fa_codes: { Args: never; Returns: undefined }
      cleanup_expired_anubis_sessions: { Args: never; Returns: undefined }
      cleanup_old_live_streams: { Args: never; Returns: undefined }
      complete_daily_task: { Args: { p_task_id: string }; Returns: Json }
      count_admin_unread_notifications: {
        Args: { p_user_id: string }
        Returns: number
      }
      count_unread_notifications:
        | { Args: never; Returns: number }
        | { Args: { p_user_id: string }; Returns: number }
      create_initial_internal_balances: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_new_callout: {
        Args: {
          p_callout_text?: string
          p_contact_button_text?: string
          p_contact_link?: string
          p_personality_description?: string
          p_personality_image_url?: string
          p_personality_name: string
          p_personality_title?: string
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_is_admin?: boolean
          p_message: string
          p_related_id?: string
          p_related_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_wallet_mfa_session: {
        Args: { p_wallet_id: string }
        Returns: Json
      }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_identity_verification_admin_view: {
        Args: never
        Returns: {
          created_at: string
          document_info_masked: string
          document_status: string
          full_name: string
          id: string
          status: string
          user_id: string
          verification_notes: string
          verification_type: string
          verified_at: string
        }[]
      }
      get_profiles_admin_view: {
        Args: never
        Returns: {
          access_count: number
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          last_accessed: string
          masked_email: string
          masked_phone: string
          preferred_language: string
          solana_address: string
          updated_at: string
          user_id: string
        }[]
      }
      get_secure_profile_export: {
        Args: never
        Returns: {
          avg_profile_age_days: number
          profiles_with_email: number
          profiles_with_phone: number
          total_profiles: number
        }[]
      }
      get_secure_transaction_export: {
        Args: {
          p_access_reason: string
          p_date_from?: string
          p_date_to?: string
        }
        Returns: {
          avg_amount_range: string
          network_distribution: Json
          total_volume_range: string
          transaction_count: number
        }[]
      }
      get_total_mining_stats: { Args: never; Returns: Json }
      get_wallet_security_with_logging: {
        Args: { p_wallet_id: string }
        Returns: {
          access_count: number
          encryption_version: number
          last_accessed: string
          mnemonic_encrypted: string
          private_key_encrypted: string
          wallet_id: string
        }[]
      }
      grant_admin_role: { Args: { user_email: string }; Returns: boolean }
      grant_anubis_access: {
        Args: {
          p_duration_days?: number
          p_subscription_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
      grant_user_access: { Args: { p_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_vault_access: { Args: { _user_id: string }; Returns: boolean }
      internal_token_swap: {
        Args: {
          p_from_amount: number
          p_from_token_symbol: string
          p_to_token_symbol: string
        }
        Returns: Json
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      mark_all_notifications_read: {
        Args: { p_is_admin?: boolean; p_user_id: string }
        Returns: number
      }
      mask_contact_info: {
        Args: { email: string; phone: string }
        Returns: {
          masked_email: string
          masked_phone: string
        }[]
      }
      mask_transaction_data: {
        Args: {
          p_amount: number
          p_reference_id: string
          p_transaction_hash: string
          p_wallet_id: string
        }
        Returns: Json
      }
      notify_all_admins: {
        Args: {
          p_action_url?: string
          p_message: string
          p_related_id?: string
          p_related_type?: string
          p_title: string
          p_type: string
        }
        Returns: number
      }
      process_referral: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: Json
      }
      process_wheel_reward: {
        Args: {
          p_is_bonus?: boolean
          p_reward_type: string
          p_reward_value: number
          p_spin_cost?: number
          p_user_id: string
        }
        Returns: Json
      }
      register_trusted_device: {
        Args: { p_device_fingerprint: string; p_device_name?: string }
        Returns: Json
      }
      reject_content: {
        Args: { p_admin_notes?: string; p_content_id: string }
        Returns: boolean
      }
      revoke_anubis_access: { Args: { p_user_id: string }; Returns: boolean }
      revoke_user_access: { Args: { p_user_id: string }; Returns: boolean }
      secure_wallet_access: {
        Args: {
          p_access_type: string
          p_device_fingerprint?: string
          p_mfa_token?: string
          p_wallet_id: string
        }
        Returns: Json
      }
      unverify_user_profile: { Args: { p_user_id: string }; Returns: boolean }
      update_kyc_status: {
        Args: {
          admin_notes?: string
          new_status: string
          verification_id: string
        }
        Returns: boolean
      }
      update_mining_progress: { Args: { p_user_id: string }; Returns: Json }
      update_user_engagement_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      update_user_points_balance: { Args: { p_user_id: string }; Returns: Json }
      upload_avatar: {
        Args: { content_type?: string; file_data: string; file_name: string }
        Returns: Json
      }
      validate_wallet_access: {
        Args: {
          p_access_type: string
          p_device_fingerprint?: string
          p_ip_address?: unknown
          p_wallet_id: string
        }
        Returns: Json
      }
      verify_anubis_session: {
        Args: { p_session_token: string }
        Returns: Json
      }
      verify_user_profile: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
