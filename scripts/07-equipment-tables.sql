-- Create equipment table with all necessary fields
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  daily_rate DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_created_by ON public.equipment(created_by);

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available equipment" ON public.equipment;
DROP POLICY IF EXISTS "Admins can manage all equipment" ON public.equipment;
DROP POLICY IF EXISTS "Managers can view all equipment" ON public.equipment;

-- RLS Policies for equipment
-- Anyone can view available equipment
CREATE POLICY "Anyone can view available equipment"
  ON public.equipment FOR SELECT
  USING (status = 'available' OR auth.uid() IS NOT NULL);

-- Admins can do everything with equipment
CREATE POLICY "Admins can manage all equipment"
  ON public.equipment FOR ALL
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Project managers can view all equipment
CREATE POLICY "Managers can view all equipment"
  ON public.equipment FOR SELECT
  USING (get_user_role(auth.uid()) = 'project_manager');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS equipment_updated_at ON public.equipment;
CREATE TRIGGER equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_updated_at();

-- Grant permissions
GRANT SELECT ON public.equipment TO anon, authenticated;
GRANT ALL ON public.equipment TO authenticated;
