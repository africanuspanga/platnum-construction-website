-- Add currency column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'TSH'));

-- Add comment to explain the column
COMMENT ON COLUMN public.projects.currency IS 'Currency for project budget (USD or TSH)';
