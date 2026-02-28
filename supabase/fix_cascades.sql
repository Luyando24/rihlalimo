-- Add ON DELETE CASCADE to foreign keys to allow user deletion

-- 1. Fix drivers table
ALTER TABLE public.drivers
DROP CONSTRAINT IF EXISTS drivers_id_fkey,
ADD CONSTRAINT drivers_id_fkey
FOREIGN KEY (id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 2. Fix bookings table (customer_id)
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey,
ADD CONSTRAINT bookings_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Fix bookings table (driver_id)
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_driver_id_fkey,
ADD CONSTRAINT bookings_driver_id_fkey
FOREIGN KEY (driver_id)
REFERENCES public.drivers(id)
ON DELETE SET NULL; -- Keep bookings but remove driver link if driver is deleted

-- 4. Fix payments table
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_booking_id_fkey,
ADD CONSTRAINT payments_booking_id_fkey
FOREIGN KEY (booking_id)
REFERENCES public.bookings(id)
ON DELETE CASCADE;
