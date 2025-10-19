-- Add PDF URL field to invoices table for manual invoice uploads
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add invoice type field to distinguish between manual and project invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'project' CHECK (invoice_type IN ('manual', 'project'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_pdf_url ON public.invoices(pdf_url) WHERE pdf_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(invoice_type);
