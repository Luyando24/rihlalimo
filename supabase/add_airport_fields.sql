ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS airline text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meet_and_greet boolean DEFAULT false;
