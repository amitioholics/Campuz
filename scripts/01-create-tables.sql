-- Create user roles enum
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');

-- Create profiles table to extend Supabase auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  student_id TEXT UNIQUE, -- Only for students
  employee_id TEXT UNIQUE, -- Only for faculty/admin
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  head_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 3,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES profiles(id),
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrollments table (student-course relationship)
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE(student_id, course_id)
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

-- Create exams table
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('midterm', 'final', 'quiz', 'assignment')),
  date DATE NOT NULL,
  max_marks INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

-- Create timetable table
CREATE TABLE timetable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Departments: Everyone can read, only admins can modify
CREATE POLICY "Everyone can view departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify departments" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Courses: Everyone can read, faculty and admins can modify their courses
CREATE POLICY "Everyone can view courses" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty can modify their courses" ON courses FOR ALL USING (
  auth.uid() = faculty_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enrollments: Students can see their own, faculty can see their course enrollments, admins see all
CREATE POLICY "Students can view own enrollments" ON enrollments FOR SELECT USING (
  auth.uid() = student_id
);
CREATE POLICY "Faculty can view course enrollments" ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND faculty_id = auth.uid())
);
CREATE POLICY "Admins can view all enrollments" ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Similar policies for other tables...
CREATE POLICY "Students can view own attendance" ON attendance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Faculty can view course attendance" ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND faculty_id = auth.uid())
);
CREATE POLICY "Faculty can mark attendance" ON attendance FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND faculty_id = auth.uid())
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
