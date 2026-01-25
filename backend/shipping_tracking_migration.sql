-- Add shipping tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add check constraint for shipping_status
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_shipping_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_shipping_status_check 
CHECK (shipping_status IN ('pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON public.orders(shipping_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
