-- Phase 3: Link Invoices to Projects and Rentals
-- This script adds relationships between invoices and projects/rentals

-- 1. Add project_id to invoices table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    CREATE INDEX idx_invoices_project ON invoices(project_id);
  END IF;
END $$;

-- 2. Add rental_id to invoices table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'rental_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL;
    CREATE INDEX idx_invoices_rental ON invoices(rental_id);
  END IF;
END $$;

-- 3. Add invoice_type to help categorize invoices
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'invoice_type'
  ) THEN
    ALTER TABLE invoices ADD COLUMN invoice_type TEXT CHECK (invoice_type IN ('project', 'rental', 'other'));
  END IF;
END $$;

-- 4. Add notes field for invoice context
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'notes'
  ) THEN
    ALTER TABLE invoices ADD COLUMN notes TEXT;
  END IF;
END $$;
