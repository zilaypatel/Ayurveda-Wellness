/*
  # Ayurveda Wellness Application Schema

  ## Overview
  Complete database schema for Ayurveda wellness application supporting user management,
  Prakriti analysis, personalized recommendations, and administrative functions.

  ## New Tables

  ### 1. `profiles`
  Extended user profile information
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `date_of_birth` (date)
  - `gender` (text)
  - `phone` (text)
  - `height` (numeric, in cm)
  - `weight` (numeric, in kg)
  - `medical_conditions` (text)
  - `allergies` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `prakriti_questions`
  Questionnaire for determining Ayurvedic body type
  - `id` (uuid, primary key)
  - `category` (text: physical/mental/behavioral)
  - `question` (text)
  - `vata_option` (text)
  - `pitta_option` (text)
  - `kapha_option` (text)
  - `order_number` (integer)

  ### 3. `prakriti_results`
  Stores user's Prakriti analysis results
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `vata_score` (integer)
  - `pitta_score` (integer)
  - `kapha_score` (integer)
  - `dominant_dosha` (text)
  - `secondary_dosha` (text, nullable)
  - `quiz_answers` (jsonb)
  - `completed_at` (timestamptz)

  ### 4. `diet_recommendations`
  Personalized diet plans based on Prakriti
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `dosha_type` (text)
  - `foods_to_favor` (jsonb)
  - `foods_to_avoid` (jsonb)
  - `meal_suggestions` (jsonb)
  - `lifestyle_tips` (jsonb)
  - `created_at` (timestamptz)

  ### 5. `daily_schedules`
  Customized daily wellness routines
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `wake_time` (time)
  - `morning_routine` (jsonb)
  - `meal_times` (jsonb)
  - `exercise_schedule` (jsonb)
  - `meditation_times` (jsonb)
  - `sleep_time` (time)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `follow_ups`
  Track user progress and feedback
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `follow_up_date` (date)
  - `status` (text: pending/completed/missed)
  - `feedback` (text, nullable)
  - `progress_notes` (text, nullable)
  - `reminder_sent` (boolean, default false)
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)

  ### 7. `admin_users`
  Administrative access control
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `role` (text: super_admin/admin/moderator)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read/update their own profile data
  - Users can view their own analysis, recommendations, schedules, and follow-ups
  - Admin users have elevated permissions for management functions
  - Prakriti questions are publicly readable for the quiz

  ## Indexes
  - Foreign key indexes for performance
  - Indexes on commonly queried fields
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  phone text,
  height numeric(5,2),
  weight numeric(5,2),
  medical_conditions text DEFAULT '',
  allergies text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prakriti_questions table
CREATE TABLE IF NOT EXISTS prakriti_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('physical', 'mental', 'behavioral')),
  question text NOT NULL,
  vata_option text NOT NULL,
  pitta_option text NOT NULL,
  kapha_option text NOT NULL,
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prakriti_results table
CREATE TABLE IF NOT EXISTS prakriti_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vata_score integer DEFAULT 0,
  pitta_score integer DEFAULT 0,
  kapha_score integer DEFAULT 0,
  dominant_dosha text NOT NULL,
  secondary_dosha text,
  quiz_answers jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now()
);

-- Create diet_recommendations table
CREATE TABLE IF NOT EXISTS diet_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dosha_type text NOT NULL,
  foods_to_favor jsonb DEFAULT '[]'::jsonb,
  foods_to_avoid jsonb DEFAULT '[]'::jsonb,
  meal_suggestions jsonb DEFAULT '{}'::jsonb,
  lifestyle_tips jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create daily_schedules table
CREATE TABLE IF NOT EXISTS daily_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  wake_time time,
  morning_routine jsonb DEFAULT '[]'::jsonb,
  meal_times jsonb DEFAULT '{}'::jsonb,
  exercise_schedule jsonb DEFAULT '[]'::jsonb,
  meditation_times jsonb DEFAULT '[]'::jsonb,
  sleep_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  follow_up_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
  feedback text DEFAULT '',
  progress_notes text DEFAULT '',
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prakriti_results_user_id ON prakriti_results(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_recommendations_user_id ON diet_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_schedules_user_id ON daily_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_prakriti_questions_order ON prakriti_questions(order_number);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prakriti questions policies (publicly readable for quiz)
CREATE POLICY "Anyone can view prakriti questions"
  ON prakriti_questions FOR SELECT
  TO authenticated
  USING (true);

-- Prakriti results policies
CREATE POLICY "Users can view own prakriti results"
  ON prakriti_results FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own prakriti results"
  ON prakriti_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Diet recommendations policies
CREATE POLICY "Users can view own diet recommendations"
  ON diet_recommendations FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own diet recommendations"
  ON diet_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Daily schedules policies
CREATE POLICY "Users can view own daily schedule"
  ON daily_schedules FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own daily schedule"
  ON daily_schedules FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own daily schedule"
  ON daily_schedules FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Follow-ups policies
CREATE POLICY "Users can view own follow-ups"
  ON follow_ups FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own follow-ups"
  ON follow_ups FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own follow-ups"
  ON follow_ups FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all prakriti results"
  ON prakriti_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all diet recommendations"
  ON diet_recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all daily schedules"
  ON daily_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all follow-ups"
  ON follow_ups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update follow-ups"
  ON follow_ups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );