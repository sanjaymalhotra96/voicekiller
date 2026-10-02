// Database types in the shape `supabase gen types` produces.
// Keep in sync with supabase/migrations, or regenerate with:
//   npx supabase gen types typescript --project-id dldaotgunhqhpyhukpkd > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      acting_instructions: {
        Row: {
          id: string;
          name: string;
          category: string;
          instructions: string;
          sample_script: string;
          sample_audio_url: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          instructions: string;
          sample_script?: string;
          sample_audio_url?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          instructions?: string;
          sample_script?: string;
          sample_audio_url?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      custom_instructions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          instructions: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          instructions: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          instructions?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      library_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          tool: string;
          voice_name: string | null;
          duration_seconds: number;
          audio_url: string;
          campaign_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          tool: string;
          voice_name?: string | null;
          duration_seconds?: number;
          audio_url: string;
          campaign_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          tool?: string;
          voice_name?: string | null;
          duration_seconds?: number;
          audio_url?: string;
          campaign_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          plan: string;
          usage_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          plan?: string;
          usage_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan?: string;
          usage_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      voice_favorites: {
        Row: {
          user_id: string;
          voice_id: string;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          voice_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          voice_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'voice_favorites_voice_id_fkey';
            columns: ['voice_id'];
            isOneToOne: false;
            referencedRelation: 'voices';
            referencedColumns: ['id'];
          },
        ];
      };
      voices: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string;
          provider: string;
          gender: string;
          accent: string;
          language: string;
          source: string;
          preview_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string;
          provider: string;
          gender: string;
          accent?: string;
          language?: string;
          source?: string;
          preview_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          description?: string;
          provider?: string;
          gender?: string;
          accent?: string;
          language?: string;
          source?: string;
          preview_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      delete_user: { Args: Record<PropertyKey, never>; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database['public']['Tables'];
export type TableRow<T extends keyof PublicTables> = PublicTables[T]['Row'];
