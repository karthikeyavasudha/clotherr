-- Add waive_extra_charges column to discounts table
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS waive_extra_charges BOOLEAN DEFAULT false;

-- Add waive_charges_list column to store which specific charges to waive (JSON array)
-- Example: ["cod_charge", "delivery_charge", "custom_charge_key"]
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS waive_charges_list TEXT[] DEFAULT '{}';

-- Update the type check constraint to allow 'waive_charges' type
ALTER TABLE public.discounts DROP CONSTRAINT IF EXISTS discounts_type_check;
ALTER TABLE public.discounts ADD CONSTRAINT discounts_type_check CHECK (type IN ('percentage', 'fixed', 'waive_charges'));
