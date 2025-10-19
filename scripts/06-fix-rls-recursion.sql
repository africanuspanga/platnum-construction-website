-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Project managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins can manage all rentals" ON public.rentals;
DROP POLICY IF EXISTS "Clients can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Project managers can manage milestones" ON public.project_milestones;

-- Create a security definer function to check user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Recreate policies using the security definer function
-- Users table policies
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.get_user_role() = 'admin');

-- Equipment table policies
CREATE POLICY "Admins can manage equipment"
  ON public.equipment FOR ALL
  USING (public.get_user_role() = 'admin');

-- Projects table policies
CREATE POLICY "Clients can view their own projects"
  ON public.projects FOR SELECT
  USING (
    client_id = auth.uid() OR
    public.get_user_role() IN ('admin', 'project_manager')
  );

CREATE POLICY "Project managers can manage projects"
  ON public.projects FOR ALL
  USING (public.get_user_role() IN ('admin', 'project_manager'));

-- Rentals table policies
CREATE POLICY "Clients can view their own rentals"
  ON public.rentals FOR SELECT
  USING (
    client_id = auth.uid() OR
    public.get_user_role() IN ('admin', 'project_manager')
  );

CREATE POLICY "Admins can manage all rentals"
  ON public.rentals FOR ALL
  USING (public.get_user_role() = 'admin');

-- Invoices table policies
CREATE POLICY "Clients can view their own invoices"
  ON public.invoices FOR SELECT
  USING (
    client_id = auth.uid() OR
    public.get_user_role() IN ('admin', 'project_manager')
  );

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL
  USING (public.get_user_role() = 'admin');

-- Project milestones policies
CREATE POLICY "Project managers can manage milestones"
  ON public.project_milestones FOR ALL
  USING (public.get_user_role() IN ('admin', 'project_manager'));
