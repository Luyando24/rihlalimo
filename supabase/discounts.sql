-- Create the discounts table
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);

-- Enable RLS
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can do anything
CREATE POLICY "Admins can manage discounts" ON public.discounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Everyone (unauthenticated too) can select to validate codes, 
-- but only if they are active and not expired.
CREATE POLICY "Anyone can check active discounts" ON public.discounts
    FOR SELECT USING (
        is_active = true AND (expires_at IS NULL OR expires_at > now())
    );

-- Update bookings table to track discounts
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS discount_id UUID REFERENCES public.discounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS promo_code TEXT;
