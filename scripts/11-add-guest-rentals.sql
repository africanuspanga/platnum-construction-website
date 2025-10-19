-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add columns to rentals table to support guest bookings (no login required)
ALTER TABLE public.rentals 
  ALTER COLUMN client_id DROP NOT NULL,
  ADD COLUMN guest_name TEXT,
  ADD COLUMN guest_phone TEXT,
  ADD COLUMN guest_email TEXT,
  ADD COLUMN guest_company TEXT,
  ADD COLUMN notes TEXT;

-- Add check constraint to ensure either client_id OR guest details are provided
ALTER TABLE public.rentals 
  ADD CONSTRAINT rentals_client_or_guest_check 
  CHECK (
    (client_id IS NOT NULL) OR 
    (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
  );

-- Update RLS policies to allow guests to create rental requests
DROP POLICY IF EXISTS "Users can view their own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Users can create rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can view all rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can update rentals" ON public.rentals;

-- Allow anyone to create rental requests (guests or logged-in users)
CREATE POLICY "Anyone can create rental requests"
  ON public.rentals FOR INSERT
  WITH CHECK (true);

-- Users can view their own rentals (if logged in)
CREATE POLICY "Users can view their own rentals"
  ON public.rentals FOR SELECT
  USING (
    auth.uid() = client_id OR
    is_admin(auth.uid())
  );

-- Admins can view and update all rentals
CREATE POLICY "Admins can view all rentals"
  ON public.rentals FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all rentals"
  ON public.rentals FOR UPDATE
  USING (is_admin(auth.uid()));
