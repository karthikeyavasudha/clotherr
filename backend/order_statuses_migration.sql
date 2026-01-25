-- Order Statuses Table
-- This table stores all valid order statuses that can be used in the system
-- Run this migration in Supabase SQL Editor

-- Create order_statuses table
CREATE TABLE IF NOT EXISTS public.order_statuses (
    id SERIAL PRIMARY KEY,
    status_code TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default order statuses
INSERT INTO public.order_statuses (status_code, display_name, description, sort_order, icon, color) VALUES
    ('pending', 'Pending', 'Order has been placed and awaiting payment', 1, '📦', '#f59e0b'),
    ('paid', 'Paid', 'Payment has been received', 2, '💳', '#10b981'),
    ('shipped', 'Shipped', 'Order has been shipped', 3, '🚚', '#3b82f6'),
    ('in_transit', 'In Transit', 'Order is in transit to destination', 4, '✈️', '#8b5cf6'),
    ('out_for_delivery', 'Out for Delivery', 'Order is out for delivery', 5, '🛵', '#ec4899'),
    ('delivered', 'Delivered', 'Order has been delivered', 6, '✅', '#22c55e'),
    ('cancelled', 'Cancelled', 'Order has been cancelled', 7, '❌', '#ef4444')
ON CONFLICT (status_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- Enable RLS but allow public read access
ALTER TABLE public.order_statuses ENABLE ROW LEVEL SECURITY;

-- Anyone can read order statuses (public information)
CREATE POLICY "Order statuses are viewable by everyone" 
    ON public.order_statuses 
    FOR SELECT 
    USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_statuses_sort_order ON public.order_statuses(sort_order);
CREATE INDEX IF NOT EXISTS idx_order_statuses_active ON public.order_statuses(is_active);
