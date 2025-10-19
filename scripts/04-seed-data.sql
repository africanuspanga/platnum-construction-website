-- Seed equipment data
INSERT INTO public.equipment (name, category, description, image_url, daily_rate, status) VALUES
('Caterpillar 320 Excavator', 'Excavators', 'Heavy-duty excavator for large-scale projects', '/images/equipment/cat-320-excavator.png', 850.00, 'available'),
('Caterpillar Motor Grader', 'Graders', 'Precision grading for road construction', '/images/equipment/cat-motor-grader.png', 950.00, 'available'),
('Caterpillar Bulldozer', 'Bulldozers', 'Powerful dozer for earthmoving', '/images/equipment/cat-bulldozer.png', 1200.00, 'available'),
('Komatsu Wheel Loader', 'Loaders', 'Efficient material handling', '/images/equipment/komatsu-wheel-loader.png', 750.00, 'available'),
('Volvo Articulated Dump Truck', 'Dump Trucks', 'High-capacity hauling', '/images/equipment/volvo-dump-truck.png', 900.00, 'available'),
('JCB Backhoe Loader', 'Backhoes', 'Versatile digging and loading', '/images/equipment/jcb-backhoe.png', 650.00, 'available'),
('Bobcat Skid Steer', 'Skid Steers', 'Compact and maneuverable', '/images/equipment/bobcat-skid-steer.png', 450.00, 'available'),
('Hamm Roller', 'Rollers', 'Soil and asphalt compaction', '/images/equipment/hamm-roller.png', 550.00, 'available'),
('Mitsubishi Canter', 'Trucks', 'Light commercial transport vehicle', '/images/equipment/mitsubishi-canter.png', 300.00, 'available'),
('Sino Truck', 'Trucks', 'Heavy-duty dump truck', '/images/equipment/sino-truck.jpg', 800.00, 'available'),
('Hino Crane', 'Cranes', 'Truck-mounted crane for lifting', '/images/equipment/hino-crane.png', 1100.00, 'available'),
('Mitsubishi Crane', 'Cranes', 'Mobile crane for heavy lifting', '/images/equipment/mitsubishi-crane.png', 1500.00, 'available'),
('Schwing Stetter Concrete Pump', 'Concrete Equipment', 'High-capacity concrete pumping', '/images/equipment/schwing-concrete-pump.jpg', 700.00, 'available'),
('CIMC Trailer', 'Trailers', 'Flatbed trailer for equipment transport', '/images/equipment/cimc-trailer.webp', 250.00, 'available'),
('Mitsubishi Fuso', 'Trucks', 'Medium-duty commercial vehicle', '/images/equipment/mitsubishi-fuso.png', 400.00, 'available'),
('Toyota TownAce', 'Trucks', 'Compact pickup for light transport', '/images/equipment/toyota-townace.png', 200.00, 'available'),
('KM Trailer', 'Trailers', 'Specialized equipment trailer', '/images/equipment/km-trailer.jpg', 300.00, 'available'),
('Mitsubishi Canter Custom', 'Trucks', 'Custom commercial vehicle', '/images/equipment/mitsubishi-canter-custom.png', 350.00, 'available');

-- Note: You'll need to create an admin user manually through Supabase Auth
-- Then update their role in the users table to 'admin'
