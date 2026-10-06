// Database types in the shape `supabase gen types` produces.
// Keep in sync with the database schema, or regenerate with:
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
      // Voice catalog (read only in the app).
      voices: {
        Row: {
          id: string;
          voice: string;
          display_name: string;
          gender: string | null;
          sample: string | null;
          provider: string;
          locale: string | null;
          language: string | null;
          accent: string | null;
          plan: string | null;
          age: string | null;
          denoise: boolean | null;
          description: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          voice?: string;
          display_name?: string;
          gender?: string | null;
          sample?: string | null;
          provider?: string;
          locale?: string | null;
          language?: string | null;
          accent?: string | null;
          plan?: string | null;
          age?: string | null;
          denoise?: boolean | null;
          description?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          voice?: string;
          display_name?: string;
          gender?: string | null;
          sample?: string | null;
          provider?: string;
          locale?: string | null;
          language?: string | null;
          accent?: string | null;
          plan?: string | null;
          age?: string | null;
          denoise?: boolean | null;
          description?: string[] | null;
          created_at?: string;
          updated_at?: string;
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
