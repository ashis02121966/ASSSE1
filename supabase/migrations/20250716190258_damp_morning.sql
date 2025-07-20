/*
  # Create Users and Roles Schema

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `permissions` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `profile_image` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `user_role_assignments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `role_id` (uuid, references user_roles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  profile_image text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_role_assignments table
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

CREATE POLICY "Users can read role assignments"
  ON user_role_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage role assignments"
  ON user_role_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- Insert default roles
INSERT INTO user_roles (name, code, permissions) VALUES
  ('EnSD Admin', 'ENSD_ADMIN', '["*"]'::jsonb),
  ('CPG User', 'CPG_USER', '["frame.allocate", "dashboard.view"]'::jsonb),
  ('EnSD AD/DD User', 'ENSD_AD_DD', '["dashboard.view", "reports.view"]'::jsonb),
  ('DS User / CSO Scrutinizer', 'DS_USER', '["scrutiny.manage", "data.download"]'::jsonb),
  ('FOD HQ User', 'FOD_HQ', '["reports.view", "dashboard.view"]'::jsonb),
  ('ZO User', 'ZO_USER', '["dashboard.view", "reports.view"]'::jsonb),
  ('RO User', 'RO_USER', '["frame.allocate", "notice.generate"]'::jsonb),
  ('SSO User', 'SSO_USER', '["survey.compile", "survey.scrutinize"]'::jsonb),
  ('Enterprise User', 'ENTERPRISE', '["survey.fill"]'::jsonb)
ON CONFLICT (code) DO NOTHING;