-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS public.settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    number_value DECIMAL(10, 2),
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add is_custom column if not exists (for existing tables)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;

-- Insert default settings
-- Boolean-only settings (just enabled toggle)
INSERT INTO public.settings (key, enabled, description, is_custom) VALUES
    ('payment_cod_enabled', true, 'Enable Cash on Delivery payment option', false),
    ('payment_razorpay_enabled', true, 'Enable Razorpay online payment option', false)
ON CONFLICT (key) DO NOTHING;

-- Numeric settings with enable/disable toggle
INSERT INTO public.settings (key, enabled, number_value, description, is_custom) VALUES
    ('min_order_amount', false, 0, 'Minimum order amount required', false),
    ('cod_extra_charge', false, 0, 'Extra charge for COD orders', false)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);

-- Only service role can update (admin operations use service role key)
