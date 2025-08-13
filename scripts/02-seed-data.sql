-- Insert sample departments
INSERT INTO departments (name, code) VALUES
('Computer Science', 'CS'),
('Mathematics', 'MATH'),
('Physics', 'PHYS'),
('Chemistry', 'CHEM'),
('English', 'ENG');

-- Insert sample admin user (you'll need to sign up with this email first)
-- This is just a placeholder - the actual profile will be created via the trigger
-- UPDATE profiles SET role = 'admin', employee_id = 'ADM001', full_name = 'System Administrator' 
-- WHERE email = 'admin@college.edu';
