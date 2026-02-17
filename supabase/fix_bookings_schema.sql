-- Fix missing columns in bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS distance_km_estimated decimal(10,2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_minutes_estimated int;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS airline text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS flight_number text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meet_and_greet boolean DEFAULT false;
