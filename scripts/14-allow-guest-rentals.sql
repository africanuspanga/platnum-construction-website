-- Simple script to allow guest rental submissions
-- This enables unauthenticated users to create rental requests

-- First, disable RLS temporarily to clean up
ALTER TABLE public.rentals DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on rentals table
DROP POLICY IF EXISTS "Users can view their own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can view all rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can update all rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can delete rentals" ON public.rentals;
DROP POLICY IF EXISTS "Anyone can create rental requests" ON public.rentals;
DROP POLICY IF EXISTS "Public can create rental requests" ON public.rentals;

-- Re-enable RLS
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Create the is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow ANYONE (including unauthenticated users) to INSERT rentals
-- This is for guest bookings
CREATE POLICY "Allow public rental submissions"
  ON public.rentals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own rentals
CREATE POLICY "Users view own rentals"
  ON public.rentals
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR is_admin(auth.uid())
  );

-- Admins can update rentals
CREATE POLICY "Admins update rentals"
  ON public.rentals
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can delete rentals
CREATE POLICY "Admins delete rentals"
  ON public.rentals
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
