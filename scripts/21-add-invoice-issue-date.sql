-- Add issue_date column to invoices table
-- This stores when the invoice was issued/created

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing invoices to have issue_date set to their created_at date
UPDATE invoices 
SET issue_date = created_at 
WHERE issue_date IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
