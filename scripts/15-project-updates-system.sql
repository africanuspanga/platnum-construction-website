-- Phase 2: Project Updates, Comments, and Files System
-- This script creates tables for project management workflow

-- 1. Project Updates Table (PM adds progress updates)
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  update_text TEXT NOT NULL,
  progress_percentage INT CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Project Comments Table (PM and Client can comment)
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Project Files Table (Photos, PDFs, Excel uploads)
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'pdf', 'excel'
  file_size INT NOT NULL, -- in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_updates_project ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);

-- 5. RLS Policies for project_updates
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view updates for their projects" ON project_updates;
CREATE POLICY "Users can view updates for their projects"
  ON project_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_updates.project_id
      AND (projects.client_id = auth.uid() OR projects.manager_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "PM and Admin can create updates" ON project_updates;
CREATE POLICY "PM and Admin can create updates"
  ON project_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_updates.project_id
      AND (projects.manager_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- 6. RLS Policies for project_comments
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments for their projects" ON project_comments;
CREATE POLICY "Users can view comments for their projects"
  ON project_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_comments.project_id
      AND (projects.client_id = auth.uid() OR projects.manager_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can add comments to their projects" ON project_comments;
CREATE POLICY "Users can add comments to their projects"
  ON project_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_comments.project_id
      AND (projects.client_id = auth.uid() OR projects.manager_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- 7. RLS Policies for project_files
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view files for their projects" ON project_files;
CREATE POLICY "Users can view files for their projects"
  ON project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND (projects.client_id = auth.uid() OR projects.manager_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "PM and Admin can upload files" ON project_files;
CREATE POLICY "PM and Admin can upload files"
  ON project_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND (projects.manager_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Uploader can delete their files" ON project_files;
CREATE POLICY "Uploader can delete their files"
  ON project_files FOR DELETE
  USING (uploaded_by = auth.uid() OR is_admin(auth.uid()));
