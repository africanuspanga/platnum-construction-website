-- Fix invoice_type CHECK constraint to allow 'manual', 'project', and 'rental'
-- The previous scripts created conflicting constraints

-- Drop the old constraint if it exists
DO $$ 
BEGIN
  -- Drop any existing check constraints on invoice_type
  ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_type_check;
  ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_type_check1;
  ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_type_check2;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add the correct constraint that allows 'manual', 'project', and 'rental'
ALTER TABLE public.invoices
ADD CONSTRAINT invoices_invoice_type_check 
CHECK (invoice_type IN ('manual', 'project', 'rental'));

-- Update any existing NULL values to 'manual' as default
UPDATE public.invoices 
SET invoice_type = 'manual' 
WHERE invoice_type IS NULL;
