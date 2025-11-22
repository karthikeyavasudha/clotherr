-- Fix RLS policies for orders and order_items tables
-- Since we're using custom JWT authentication, we need to allow backend operations

-- For orders table
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Allow all operations from backend (backend handles authorization via JWT)
CREATE POLICY "Allow backend operations on orders" ON public.orders
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- For order_items table
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Allow backend operations on order_items" ON public.order_items
    FOR ALL
    USING (true)
    WITH CHECK (true);
