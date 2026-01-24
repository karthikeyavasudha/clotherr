-- Add Razorpay fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);

-- Update status enum to include new payment states
-- Note: If you have a status constraint, you may need to update it
-- The following statuses are now supported:
-- 'pending' - Order placed (COD)
-- 'payment_pending' - Razorpay order created, awaiting payment
-- 'payment_failed' - Payment verification failed
-- 'paid' - Payment successful
-- 'processing' - Order is being prepared
-- 'shipped' - Order has been shipped
-- 'delivered' - Order delivered
-- 'cancelled' - Order cancelled
