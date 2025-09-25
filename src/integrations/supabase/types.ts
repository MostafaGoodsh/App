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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          phone: string | null
          preferred_language: string | null
          solana_address: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone?: string | null
          preferred_language?: string | null
          solana_address?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone?: string | null
          preferred_language?: string | null
          solana_address?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
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
          ip_address: unknown | null
          profile_id: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: unknown | null
          profile_id: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: unknown | null
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
      user_daily_task_completions: {
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
      wallet_access_audit: {
        Row: {
          access_type: string
          accessed_at: string
          block_reason: string | null
          blocked: boolean | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
      calculate_user_points: {
        Args: { p_user_id: string }
        Returns: number
      }
      complete_daily_task: {
        Args: { p_task_id: string }
        Returns: Json
      }
      create_initial_internal_balances: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_wallet_mfa_session: {
        Args: { p_wallet_id: string }
        Returns: Json
      }
      get_identity_verification_admin_view: {
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
      grant_admin_role: {
        Args: { user_email: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      internal_token_swap: {
        Args: {
          p_from_amount: number
          p_from_token_symbol: string
          p_to_token_symbol: string
        }
        Returns: Json
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
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
      register_trusted_device: {
        Args: { p_device_fingerprint: string; p_device_name?: string }
        Returns: Json
      }
      reject_content: {
        Args: { p_admin_notes?: string; p_content_id: string }
        Returns: boolean
      }
      secure_wallet_access: {
        Args: {
          p_access_type: string
          p_device_fingerprint?: string
          p_mfa_token?: string
          p_wallet_id: string
        }
        Returns: Json
      }
      update_kyc_status: {
        Args: {
          admin_notes?: string
          new_status: string
          verification_id: string
        }
        Returns: boolean
      }
      update_mining_progress: {
        Args: { p_user_id: string }
        Returns: Json
      }
      update_user_engagement_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      update_user_points_balance: {
        Args: { p_user_id: string }
        Returns: Json
      }
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
