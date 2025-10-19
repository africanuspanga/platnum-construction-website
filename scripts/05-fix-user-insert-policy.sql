-- Add missing INSERT policy for users table
-- This allows new users to create their own profile during signup

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also add a policy to allow service role to insert (for admin creation)
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);
