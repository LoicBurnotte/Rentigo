// This file should be generated with:
// supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
//
// Below is a placeholder that matches the expected schema.
// Replace with generated types for full type safety.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          location: string | null;
          stripe_account_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          location?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          location?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
        };
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          category_id: string;
          price_per_day: number;
          latitude: number;
          longitude: number;
          city: string;
          images: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          category_id: string;
          price_per_day: number;
          latitude: number;
          longitude: number;
          city: string;
          images?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          category_id?: string;
          price_per_day?: number;
          latitude?: number;
          longitude?: number;
          city?: string;
          images?: string[];
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          item_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          stripe_payment_intent: string | null;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          stripe_payment_intent?: string | null;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          renter_id?: string;
          start_date?: string;
          end_date?: string;
          total_price?: number;
          stripe_payment_intent?: string | null;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          renter_id: string;
          owner_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          renter_id: string;
          owner_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          renter_id?: string;
          owner_id?: string;
          item_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          message?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed";
    };
  };
}

// Convenience types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
