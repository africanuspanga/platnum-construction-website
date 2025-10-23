-- Add 'pending' status to projects table
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('pending', 'planning', 'in_progress', 'completed', 'on_hold', 'cancelled'));

-- Create project_files table for file attachments
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON public.project_files(uploaded_by);

-- Drop existing projects INSERT policy if it exists
DROP POLICY IF EXISTS "Clients can create project requests" ON public.projects;

-- Updated to use is_admin() instead of get_user_role()
-- Add INSERT policy for clients to create project requests
CREATE POLICY "Clients can create project requests"
  ON public.projects FOR INSERT
  WITH CHECK (
    -- Clients can only create projects for themselves with 'pending' status
    (auth.uid() = client_id AND status = 'pending') OR
    -- Admins and project managers can create any project
    is_admin(auth.uid())
  );

-- Updated to use is_admin() instead of get_user_role()
-- Add UPDATE policy for admins to approve/manage projects
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (is_admin(auth.uid()));

-- Added DROP POLICY IF EXISTS for all project_files policies to make script idempotent
-- Project files policies
DROP POLICY IF EXISTS "Users can view files for their projects" ON public.project_files;

CREATE POLICY "Users can view files for their projects"
  ON public.project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND (
        client_id = auth.uid() OR
        manager_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can upload files to their projects" ON public.project_files;

CREATE POLICY "Users can upload files to their projects"
  ON public.project_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND (
        client_id = auth.uid() OR
        manager_id = auth.uid() OR
        is_admin(auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete their own uploaded files" ON public.project_files;

CREATE POLICY "Users can delete their own uploaded files"
  ON public.project_files FOR DELETE
  USING (
    uploaded_by = auth.uid() OR
    is_admin(auth.uid())
  );
