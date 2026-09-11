/**
 * Database types.
 *
 * Hand-written to match supabase/schema.sql. Once the CLI is set up these can
 * be regenerated instead:
 *
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 *
 * Keep the two in step — the schema is the source of truth, this file only
 * teaches TypeScript about it.
 */

import type { QuestionOutcome } from "@/lib/storage";

export type ProfileRow = {
  id: string;
  display_name: string;
  grade_year: 10 | 11 | 12;
  parallel: "kazakh" | "russian";
  profile_subject_ids: string[];
  target_grade: string;
  locale: "kk" | "ru" | "en";
  created_at: string;
  updated_at: string;
}

export type AttemptRow = {
  id: string;
  user_id: string;
  client_id: string;
  paper_id: string;
  paper_title: string;
  subject_id: string;
  component_index: number;
  grade_year: 10 | 11 | 12;
  finished_at: string;
  raw_mark: number;
  available_marks: number;
  scaled_mark: number;
  component_max: number;
  grade: string;
  duration_seconds: number;
  outcomes: QuestionOutcome[];
  created_at: string;
}

export type ActivityDayRow = {
  user_id: string;
  day: string;
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> &
          Partial<Pick<ProfileRow, "created_at" | "updated_at">>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      attempts: {
        Row: AttemptRow;
        Insert: Omit<AttemptRow, "id" | "created_at"> &
          Partial<Pick<AttemptRow, "id" | "created_at">>;
        Update: Partial<AttemptRow>;
        Relationships: [];
      };
      activity_days: {
        Row: ActivityDayRow;
        Insert: ActivityDayRow;
        Update: Partial<ActivityDayRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      delete_my_data: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
