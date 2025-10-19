-- Drop dependent policies first before dropping the function
DROP POLICY IF EXISTS "Users can view their own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Users can create rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can view all rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can update rentals" ON public.rentals;
DROP POLICY IF EXISTS "Anyone can create rental requests" ON public.rentals;
DROP POLICY IF EXISTS "Admins can update all rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can delete rentals" ON public.rentals;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make client_id nullable to support guest bookings
ALTER TABLE public.rentals 
  ALTER COLUMN client_id DROP NOT NULL;

-- Add guest booking columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rentals' AND column_name = 'guest_name') THEN
    ALTER TABLE public.rentals ADD COLUMN guest_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rentals' AND column_name = 'guest_phone') THEN
    ALTER TABLE public.rentals ADD COLUMN guest_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rentals' AND column_name = 'guest_email') THEN
    ALTER TABLE public.rentals ADD COLUMN guest_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rentals' AND column_name = 'guest_company') THEN
    ALTER TABLE public.rentals ADD COLUMN guest_company TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rentals' AND column_name = 'notes') THEN
    ALTER TABLE public.rentals ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Drop existing constraint if it exists
ALTER TABLE public.rentals DROP CONSTRAINT IF EXISTS rentals_client_or_guest_check;

-- Add check constraint to ensure either client_id OR guest details are provided
ALTER TABLE public.rentals 
  ADD CONSTRAINT rentals_client_or_guest_check 
  CHECK (
    (client_id IS NOT NULL) OR 
    (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
  );

-- Enable RLS on rentals table
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Allow anyone including unauthenticated users to create rental requests
CREATE POLICY "Anyone can create rental requests"
  ON public.rentals FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own rentals (if logged in)
CREATE POLICY "Users can view their own rentals"
  ON public.rentals FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    is_admin(auth.uid())
  );

-- Admins can view all rentals
CREATE POLICY "Admins can view all rentals"
  ON public.rentals FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update all rentals
CREATE POLICY "Admins can update all rentals"
  ON public.rentals FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can delete rentals
CREATE POLICY "Admins can delete rentals"
  ON public.rentals FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
