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
          comments_count: number | null
          content: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          difficulty_level: string | null
          id: string
          is_published: boolean | null
          likes_count: number | null
          media_type: string | null
          media_urls: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_urls?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_urls?: string[] | null
          tags?: string[] | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      update_kyc_status: {
        Args: {
          admin_notes?: string
          new_status: string
          verification_id: string
        }
        Returns: boolean
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
