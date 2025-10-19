-- Seed equipment data for rental system
-- This script populates the equipment table with the equipment shown on the /rent page

-- First add unique constraint on name column to support ON CONFLICT
ALTER TABLE public.equipment 
ADD CONSTRAINT equipment_name_unique UNIQUE (name);

-- Insert equipment data
INSERT INTO public.equipment (name, category, daily_rate, status, description) VALUES
  ('Caterpillar Motor Grader', 'Heavy Machinery', 800000.00, 'available', 'Professional motor grader for road construction and maintenance'),
  ('Caterpillar Excavator', 'Heavy Machinery', 800000.00, 'available', 'Heavy-duty excavator for digging and earthmoving'),
  ('Caterpillar Bulldozer', 'Heavy Machinery', 1200000.00, 'available', 'Powerful bulldozer for land clearing and grading'),
  ('JCB Backhoe', 'Heavy Machinery', 700000.00, 'available', 'Versatile backhoe loader for excavation and loading'),
  ('JCB Hydraulic Excavator', 'Heavy Machinery', 800000.00, 'available', 'Hydraulic excavator with precision controls'),
  ('Hyundai Excavator', 'Heavy Machinery', 800000.00, 'available', 'Reliable excavator for various construction tasks'),
  ('Sany Concrete Mixer', 'Concrete Equipment', 500000.00, 'available', 'High-capacity concrete mixer truck'),
  ('Qingnong Concrete Mixer', 'Concrete Equipment', 500000.00, 'available', 'Efficient concrete mixing equipment'),
  ('Schwinn Stetter Concrete Pump', 'Concrete Equipment', 700000.00, 'available', 'Professional concrete pump for high-rise construction'),
  ('Sino Truck', 'Transport', 600000.00, 'available', 'Heavy-duty transport truck'),
  ('Mitsubishi Crane', 'Lifting Equipment', 1500000.00, 'available', 'Large capacity crane for heavy lifting'),
  ('Hino Crane', 'Lifting Equipment', 400000.00, 'available', 'Mobile crane for medium-duty lifting'),
  ('Mitsubishi', 'Transport', 400000.00, 'available', 'Reliable transport vehicle'),
  ('Mitsubishi Canter', 'Transport', 400000.00, 'available', 'Light commercial truck for material transport'),
  ('Toyota Townace', 'Transport', 400000.00, 'available', 'Compact van for light transport'),
  ('Mitsubishi Fuso', 'Transport', 400000.00, 'available', 'Medium-duty truck for construction materials'),
  ('KM Trailer', 'Transport', 600000.00, 'available', 'Heavy-duty trailer for equipment transport'),
  ('CIMC Trailer', 'Transport', 600000.00, 'available', 'Container trailer for large loads')
ON CONFLICT (name) DO UPDATE SET
  daily_rate = EXCLUDED.daily_rate,
  category = EXCLUDED.category,
  description = EXCLUDED.description;
