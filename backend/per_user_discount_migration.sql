-- Add per_user_limit column to discounts table
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT NULL;

-- Create user_discount_usage table to track per-user usage
CREATE TABLE IF NOT EXISTS public.user_discount_usage (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    discount_id uuid NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
    discount_code TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, discount_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_discount_usage_user_id ON public.user_discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discount_usage_discount_id ON public.user_discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_user_discount_usage_code ON public.user_discount_usage(discount_code);

-- Enable RLS
ALTER TABLE public.user_discount_usage ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage
CREATE POLICY "Users can view own discount usage" ON public.user_discount_usage 
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update (via backend)
