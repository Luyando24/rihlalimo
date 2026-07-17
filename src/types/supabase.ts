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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      airport_fees: {
        Row: {
          airport_code: string
          amount: number
          created_at: string
          fee_type: string
          id: string
        }
        Insert: {
          airport_code: string
          amount: number
          created_at?: string
          fee_type: string
          id?: string
        }
        Update: {
          airport_code?: string
          amount?: number
          created_at?: string
          fee_type?: string
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          airline: string | null
          created_at: string
          customer_id: string
          distance_km_estimated: number | null
          distance_miles_estimated: number | null
          driver_id: string | null
          dropoff_location_address: string | null
          dropoff_location_lat: number | null
          dropoff_location_lng: number | null
          duration_minutes_estimated: number | null
          flight_number: string | null
          id: string
          meet_and_greet: boolean | null
          notes: string | null
          passenger_name: string | null
          passenger_phone: string | null
          payment_status: string | null
          pickup_location_address: string
          pickup_location_lat: number | null
          pickup_location_lng: number | null
          pickup_time: string
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id: string | null
          total_price_calculated: number
          vehicle_type_id: string
        }
        Insert: {
          airline?: string | null
          created_at?: string
          customer_id: string
          distance_km_estimated?: number | null
          distance_miles_estimated?: number | null
          driver_id?: string | null
          dropoff_location_address?: string | null
          dropoff_location_lat?: number | null
          dropoff_location_lng?: number | null
          duration_minutes_estimated?: number | null
          flight_number?: string | null
          id?: string
          meet_and_greet?: boolean | null
          notes?: string | null
          passenger_name?: string | null
          passenger_phone?: string | null
          payment_status?: string | null
          pickup_location_address: string
          pickup_location_lat?: number | null
          pickup_location_lng?: number | null
          pickup_time: string
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id?: string | null
          total_price_calculated: number
          vehicle_type_id: string
        }
        Update: {
          airline?: string | null
          created_at?: string
          customer_id?: string
          distance_km_estimated?: number | null
          distance_miles_estimated?: number | null
          driver_id?: string | null
          dropoff_location_address?: string | null
          dropoff_location_lat?: number | null
          dropoff_location_lng?: number | null
          duration_minutes_estimated?: number | null
          flight_number?: string | null
          id?: string
          meet_and_greet?: boolean | null
          notes?: string | null
          passenger_name?: string | null
          passenger_phone?: string | null
          payment_status?: string | null
          pickup_location_address?: string
          pickup_location_lat?: number | null
          pickup_location_lng?: number | null
          pickup_time?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id?: string | null
          total_price_calculated?: number
          vehicle_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          current_vehicle_id: string | null
          id: string
          license_number: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          current_vehicle_id?: string | null
          id: string
          license_number?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          current_vehicle_id?: string | null
          id?: string
          license_number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_current_vehicle_id_fkey"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hourly_rates: {
        Row: {
          created_at: string
          id: string
          min_hours: number | null
          rate_per_hour: number
          vehicle_type_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          min_hours?: number | null
          rate_per_hour: number
          vehicle_type_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          min_hours?: number | null
          rate_per_hour?: number
          vehicle_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hourly_rates_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          id: string
          status: string
          stripe_payment_intent_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          id?: string
          status: string
          stripe_payment_intent_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string
          description: string | null
          effective_end: string | null
          effective_start: string | null
          id: string
          is_active: boolean | null
          multiplier: number | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          effective_end?: string | null
          effective_start?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          effective_end?: string | null
          effective_start?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          processed: boolean | null
          stripe_event_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          stripe_event_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          stripe_event_id?: string
          type?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      time_multipliers: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          multiplier: number
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          multiplier: number
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          multiplier?: number
          start_time?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          base_fare_usd: number
          capacity_luggage: number
          capacity_passengers: number
          created_at: string
          description: string | null
          distance_unit: string | null
          id: string
          image_url: string | null
          min_hours_booking: number | null
          minimum_fare_usd: number
          name: string
          complimentary_wait_minutes: number
          price_per_distance_usd: number
          price_per_hour_usd: number
          price_per_mile_usd: number
          price_per_minute_usd: number
          wait_rate_per_minute_usd: number
        }
        Insert: {
          base_fare_usd: number
          capacity_luggage: number
          capacity_passengers: number
          created_at?: string
          description?: string | null
          distance_unit?: string | null
          id?: string
          image_url?: string | null
          min_hours_booking?: number | null
          minimum_fare_usd?: number
          name: string
          complimentary_wait_minutes?: number
          price_per_distance_usd: number
          price_per_hour_usd: number
          price_per_mile_usd: number
          price_per_minute_usd?: number
          wait_rate_per_minute_usd?: number
        }
        Update: {
          base_fare_usd?: number
          capacity_luggage?: number
          capacity_passengers?: number
          created_at?: string
          description?: string | null
          distance_unit?: string | null
          id?: string
          image_url?: string | null
          min_hours_booking?: number | null
          minimum_fare_usd?: number
          name?: string
          complimentary_wait_minutes?: number
          price_per_distance_usd?: number
          price_per_hour_usd?: number
          price_per_mile_usd?: number
          price_per_minute_usd?: number
          wait_rate_per_minute_usd?: number
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          id: string
          license_plate: string
          make: string
          model: string
          status: string | null
          vehicle_type_id: string
          year: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          license_plate: string
          make: string
          model: string
          status?: string | null
          vehicle_type_id: string
          year: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          license_plate?: string
          make?: string
          model?: string
          status?: string | null
          vehicle_type_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "assigned"
        | "en_route"
        | "in_progress"
        | "completed"
        | "cancelled"
      service_type:
        | "point_to_point"
        | "hourly"
        | "airport_pickup"
        | "airport_dropoff"
      user_role: "customer" | "driver" | "admin"
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
      booking_status: [
        "pending",
        "confirmed",
        "assigned",
        "en_route",
        "in_progress",
        "completed",
        "cancelled",
      ],
      service_type: [
        "point_to_point",
        "hourly",
        "airport_pickup",
        "airport_dropoff",
      ],
      user_role: ["customer", "driver", "admin"],
    },
  },
} as const
